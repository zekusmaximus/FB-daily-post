# Facebook Daily Post Automater

A production-ready web application that automates daily posts to Facebook Pages using AI-generated quotes and images.

## Features

- 🤖 **AI-Powered Content**: Generates quotes using OpenAI GPT-4 and creates relevant images with DALL-E 3
- 📅 **Automated Scheduling**: Posts daily at 9:00 AM using node-cron
- 📱 **Facebook Integration**: Posts directly to your Facebook Page
- 📧 **Email Notifications**: Alerts you when posting fails
- 📊 **Activity Logging**: Tracks all posting attempts and results
- 🎨 **Modern UI**: Clean, responsive web interface for configuration
- 🔒 **Secure**: All API keys stored securely in environment variables

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

4. **Access the Web Interface**
   Open your browser and go to `http://localhost:3000`

5. **Configure Settings**
   - Enter your OpenAI API Key
   - Enter your Facebook Page Access Token
   - Set your notification email
   - Customize your quote generation prompt
   - Click "Save Settings"

6. **Test the Setup**
   Click "Test Post" to verify everything works

## API Key Setup

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Copy the generated key and add it to your `.env` file

**Cost**: Approximately $0.01-0.03 per post (quote + image generation)

### Facebook Page Access Token

**Important**: The old `publish_actions` permission is deprecated. Follow these updated steps:

1. **Create a Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App" → "Consumer" → "Next"
   - Fill in app details and create

2. **Add Facebook Login Product**
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"
   - Choose "Web" platform
   - Enter your website URL (e.g., `http://localhost:3000` for testing)

3. **Configure App Settings**
   - Go to "App Settings" → "Basic"
   - Add your domain to "App Domains"
   - Add `http://localhost:3000` to "Valid OAuth Redirect URIs"

4. **Get User Access Token**
   - Go to "Tools" → "Graph API Explorer"
   - Select your app from the dropdown
   - Click "Generate Access Token"
   - Grant the following permissions:
     - `pages_manage_posts` (to post to pages)
     - `pages_read_engagement` (to read page info)
   - Copy the generated token

5. **Get Page Access Token**
   - The application will automatically exchange your user token for a page token
   - No additional setup required

**Note**: The access token expires after 60 days. You'll need to regenerate it periodically.

### Email Notifications (Optional)

For failure notifications, configure SMTP settings:

1. **Gmail Example**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

2. **Outlook Example**:
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your_email@outlook.com
   SMTP_PASS=your_password
   ```

**For Gmail**: Use an "App Password" instead of your regular password. Enable 2FA and generate an app password in your Google Account settings.

## Deployment

### Local Development
```bash
npm start
```

### Production Deployment

**Recommended Hosting Options**:

1. **Render** (Free tier available)
   - Connect your GitHub repository
   - Set environment variables in dashboard
   - Deploy automatically

2. **Heroku**
   - Install Heroku CLI
   - Create app: `heroku create your-app-name`
   - Set environment variables: `heroku config:set OPENAI_API_KEY=your_key`
   - Deploy: `git push heroku main`

3. **VPS (DigitalOcean, AWS, etc.)**
   - Install Node.js and PM2
   - Clone repository
   - Set up environment variables
   - Run with PM2: `pm2 start server.js`

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `OPENAI_API_KEY`
- `FACEBOOK_ACCESS_TOKEN`
- `SMTP_HOST` (optional)
- `SMTP_PORT` (optional)
- `SMTP_USER` (optional)
- `SMTP_PASS` (optional)

## API Endpoints

- `POST /api/settings` - Save configuration
- `GET /api/settings` - Retrieve settings (without sensitive data)
- `POST /api/test` - Manual test posting
- `GET /api/status` - Application status and activity log
- `GET /health` - Health check

## Troubleshooting

### Common Issues

1. **"Facebook API error: 403"**
   - Ensure your access token has the correct permissions
   - Check that the token hasn't expired
   - Verify you're posting to a Page, not a personal profile

2. **"OpenAI API error"**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the API key has access to GPT-4 and DALL-E 3

3. **"No Facebook pages found"**
   - Make sure you're using a Page access token, not a user token
   - Verify you have admin access to the Facebook Page
   - Check that the Page is published and active

4. **Scheduling not working**
   - Ensure the server is running continuously
   - Check the server logs for cron job errors
   - Verify your timezone settings

### Logs

Check the `activity-log.json` file for detailed error information and posting history.

## Customization

### Changing Posting Schedule

Edit the cron schedule in `server.js`:
```javascript
// Current: Daily at 9:00 AM
cron.schedule('0 9 * * *', executePostingWorkflow);

// Examples:
// Every 6 hours: '0 */6 * * *'
// Weekdays only: '0 9 * * 1-5'
// Twice daily: '0 9,18 * * *'
```

### Customizing Quote Prompts

Modify the prompt in the web interface or directly in the configuration. Examples:

- **Motivational**: "Generate an inspiring motivational quote about success and perseverance"
- **Business**: "Create a professional business quote about leadership and innovation"
- **Personal**: "Write a positive life quote about happiness and personal growth"

### Image Style Customization

Edit the DALL-E prompt in `server.js`:
```javascript
const imagePrompt = `An artistic, high-quality image inspired by the quote: "${quote}"`;
```

## Security Considerations

- Never commit your `.env` file to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your API usage to control costs
- Use HTTPS in production

## Cost Analysis

**Estimated Monthly Costs** (with daily posting):
- OpenAI API: $0.30 - $0.90 (30 posts × $0.01-0.03)
- Hosting: $0 - $20 (depending on provider)
- **Total**: $0.30 - $20.90/month

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the activity logs
3. Verify your API keys and permissions
4. Test with the "Test Post" button

## License

This project is open source and available under the MIT License. 