const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration file paths
const CONFIG_FILE = path.join(__dirname, 'config.json');
const ACTIVITY_LOG_FILE = path.join(__dirname, 'activity-log.json');

// Global configuration storage
let appConfig = {
  openaiApiKey: '',
  facebookAccessToken: '',
  notificationEmail: '',
  prompt: 'Generate an inspiring daily quote about success, motivation, or personal growth. Keep it under 200 characters and make it engaging for social media.'
};

// Activity log storage
let activityLog = [];

// Initialize configuration and log files
async function initializeFiles() {
  try {
    // Load existing configuration
    try {
      const configData = await fs.readFile(CONFIG_FILE, 'utf8');
      appConfig = { ...appConfig, ...JSON.parse(configData) };
      console.log('Configuration loaded successfully');
    } catch (error) {
      console.log('No existing configuration found, using defaults');
    }

    // Load existing activity log
    try {
      const logData = await fs.readFile(ACTIVITY_LOG_FILE, 'utf8');
      activityLog = JSON.parse(logData);
      console.log('Activity log loaded successfully');
    } catch (error) {
      console.log('No existing activity log found, starting fresh');
      activityLog = [];
    }
  } catch (error) {
    console.error('Error initializing files:', error);
  }
}

// Utility function to save configuration
async function saveConfig() {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(appConfig, null, 2));
    console.log('Configuration saved successfully');
  } catch (error) {
    console.error('Error saving configuration:', error);
    throw error;
  }
}

// Utility function to add activity log entry
async function addLogEntry(status, message) {
  const entry = {
    timestamp: new Date().toISOString(),
    status: status,
    message: message
  };

  activityLog.unshift(entry); // Add to beginning
  activityLog = activityLog.slice(0, 10); // Keep only last 10 entries

  try {
    await fs.writeFile(ACTIVITY_LOG_FILE, JSON.stringify(activityLog, null, 2));
    console.log('Activity log updated:', entry);
  } catch (error) {
    console.error('Error saving activity log:', error);
  }
}

// OpenAI API Integration Functions

// Generate quote using OpenAI Chat Completions API
async function generateQuote(prompt) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${appConfig.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const quote = data.choices[0].message.content.trim();
    
    console.log('Generated quote:', quote);
    return quote;
  } catch (error) {
    console.error('Error generating quote:', error);
    throw error;
  }
}

// Generate image using OpenAI DALL-E 3 API
async function generateImage(quote) {
  try {
    const imagePrompt = `An artistic, high-quality image inspired by the quote: "${quote}". Create a visually appealing, inspirational image suitable for social media posting.`;
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${appConfig.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    console.log('Generated image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Facebook API Integration Functions

// Post content to Facebook Page
async function postToFacebook(quote, imageUrl) {
  try {
    // First, we need to get the page ID from the access token
    const pageInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${appConfig.facebookAccessToken}`);
    
    if (!pageInfoResponse.ok) {
      const errorData = await pageInfoResponse.json();
      const errorMessage = errorData.error && errorData.error.message ? errorData.error.message : pageInfoResponse.statusText;
      throw new Error(`Facebook API error: ${pageInfoResponse.status} - ${errorMessage}`);
    }

    const pageInfo = await pageInfoResponse.json();
    
    if (!pageInfo.data || pageInfo.data.length === 0) {
      throw new Error('No Facebook pages found for this access token');
    }

    // Use the first page (you can modify this logic if you have multiple pages)
    const pageId = pageInfo.data[0].id;
    const pageAccessToken = pageInfo.data[0].access_token;

    console.log(`Posting to Facebook page: ${pageId}`);

    // Post the image with the quote as caption to the page
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: imageUrl,
        message: quote,
        access_token: pageAccessToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error && errorData.error.message ? errorData.error.message : response.statusText;
      throw new Error(`Facebook API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Facebook post successful:', data);
    return data;
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    throw error;
  }
}

// Main posting workflow function
async function executePostingWorkflow() {
  let quote = '';
  let imageUrl = '';
  
  try {
    await addLogEntry('INFO', 'Starting posting workflow');

    // Step 1: Generate quote
    await addLogEntry('INFO', 'Generating quote with OpenAI');
    quote = await generateQuote(appConfig.prompt);
    await addLogEntry('SUCCESS', `Quote generated: "${quote.substring(0, 50)}..."`);

    // Step 2: Generate image
    await addLogEntry('INFO', 'Generating image with DALL-E');
    imageUrl = await generateImage(quote);
    await addLogEntry('SUCCESS', 'Image generated successfully');

    // Step 3: Post to Facebook
    await addLogEntry('INFO', 'Posting to Facebook');
    const facebookResult = await postToFacebook(quote, imageUrl);
    await addLogEntry('SUCCESS', `Content posted to Facebook successfully. Post ID: ${facebookResult.id}`);

    return {
      success: true,
      quote: quote,
      imageUrl: imageUrl,
      facebookPostId: facebookResult.id
    };

  } catch (error) {
    const errorMessage = `Posting workflow failed: ${error.message}`;
    await addLogEntry('ERROR', errorMessage);
    
    // Send email notification on failure
    await sendEmailNotification(
      'Social Media Publisher - Posting Failed',
      `The automated posting workflow failed with the following error:\n\n${errorMessage}\n\nQuote: ${quote}\nImage URL: ${imageUrl}\n\nPlease check the application logs for more details.`
    );
    
    throw error;
  }
}

// Utility function with retry mechanism
async function executeWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Email notification function
async function sendEmailNotification(subject, message) {
  if (!process.env.SMTP_HOST || !appConfig.notificationEmail) {
    console.log('Email notification skipped - missing configuration');
    return;
  }

  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: appConfig.notificationEmail,
      subject: subject,
      text: message
    });

    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// API Routes

// POST /api/settings - Save user configuration
app.post('/api/settings', async (req, res) => {
  try {
    const { openaiApiKey, facebookAccessToken, notificationEmail, prompt } = req.body;

    // Validate required fields
    if (!openaiApiKey || !facebookAccessToken) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'OpenAI API Key and Facebook Access Token are required'
      });
    }

    // Update configuration (only store if provided)
    if (openaiApiKey) appConfig.openaiApiKey = openaiApiKey;
    if (facebookAccessToken) appConfig.facebookAccessToken = facebookAccessToken;
    if (notificationEmail) appConfig.notificationEmail = notificationEmail;
    if (prompt) appConfig.prompt = prompt;

    // Save to file
    await saveConfig();
    await addLogEntry('SUCCESS', 'Configuration updated successfully');

    res.json({ 
      success: true,
      message: 'Settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    await addLogEntry('ERROR', `Failed to save settings: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to save settings',
      message: error.message
    });
  }
});

// GET /api/settings - Retrieve current configuration (without sensitive data)
app.get('/api/settings', (req, res) => {
  try {
    res.json({
      prompt: appConfig.prompt,
      notificationEmail: appConfig.notificationEmail,
      hasOpenaiKey: !!appConfig.openaiApiKey,
      hasFacebookToken: !!appConfig.facebookAccessToken
    });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve settings',
      message: error.message
    });
  }
});

// GET /api/status - Get application status and activity log
app.get('/api/status', (req, res) => {
  try {
    // Find the last successful post
    const lastSuccessfulPost = activityLog.find(entry => 
      entry.status === 'SUCCESS' && entry.message.includes('posted')
    );

    res.json({
      lastSuccessfulPost: lastSuccessfulPost ? lastSuccessfulPost.timestamp : null,
      activityLog: activityLog,
      serverUptime: process.uptime(),
      configurationStatus: {
        hasOpenaiKey: !!appConfig.openaiApiKey,
        hasFacebookToken: !!appConfig.facebookAccessToken,
        hasNotificationEmail: !!appConfig.notificationEmail,
        hasPrompt: !!appConfig.prompt
      }
    });
  } catch (error) {
    console.error('Error retrieving status:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve status',
      message: error.message
    });
  }
});

// POST /api/test - Manually trigger posting workflow for testing
app.post('/api/test', async (req, res) => {
  try {
    // Check if configuration is complete
    if (!appConfig.openaiApiKey || !appConfig.facebookAccessToken) {
      return res.status(400).json({
        error: 'Incomplete configuration',
        message: 'OpenAI API Key and Facebook Access Token are required'
      });
    }

    await addLogEntry('INFO', 'Manual test post triggered');
    
    // Execute the posting workflow with retry mechanism
    const result = await executeWithRetry(executePostingWorkflow);
    
    res.json({
      success: true,
      message: 'Test post completed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error triggering test post:', error);
    await addLogEntry('ERROR', `Test post failed: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to trigger test post',
      message: error.message
    });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Scheduling System

// Schedule daily posting at 9:00 AM
async function initializeScheduler() {
  // Run every day at 9:00 AM (0 9 * * *)
  cron.schedule('0 9 * * *', async () => {
    console.log('Scheduled posting triggered at:', new Date().toISOString());
    
    try {
      // Check if configuration is complete
      if (!appConfig.openaiApiKey || !appConfig.facebookAccessToken) {
        await addLogEntry('ERROR', 'Scheduled posting skipped - incomplete configuration');
        return;
      }

      await addLogEntry('INFO', 'Scheduled posting started');
      
      // Execute the posting workflow with retry mechanism
      const result = await executeWithRetry(executePostingWorkflow);
      
      console.log('Scheduled posting completed successfully:', result);
      
    } catch (error) {
      console.error('Scheduled posting failed:', error);
      // Error logging and email notification are handled in executePostingWorkflow
    }
  }, {
    scheduled: true,
    timezone: "America/New_York" // You can change this to user's preferred timezone
  });

  console.log('Daily posting scheduler initialized - will run at 9:00 AM EST daily');
  await addLogEntry('INFO', 'Automated scheduling system initialized');
}

// Initialize and start server
async function startServer() {
  await initializeFiles();
  await initializeScheduler();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Social Media Publisher server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);

