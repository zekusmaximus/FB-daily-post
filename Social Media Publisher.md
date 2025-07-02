# Social Media Publisher

A complete, production-ready web application that automates daily Facebook Page posting with AI-generated content. The application generates inspirational quotes using OpenAI's GPT-4, creates accompanying images with DALL-E 3, and automatically posts them to your Facebook Page on a daily schedule.

## Features

- **Automated Daily Posting**: Set-it-and-forget-it scheduling with node-cron
- **AI-Generated Content**: Uses OpenAI GPT-4 for quote generation and DALL-E 3 for image creation
- **Facebook Integration**: Posts directly to Facebook Pages via Graph API
- **Modern Web Interface**: Clean, responsive frontend with real-time status updates
- **Error Handling**: Comprehensive error handling with retry mechanisms and email notifications
- **Activity Logging**: Track all posting activity with detailed logs
- **Secure Configuration**: API keys stored securely on the server side

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **OpenAI API** for content and image generation
- **Facebook Graph API** for social media posting
- **node-cron** for scheduling automation
- **Nodemailer** for email notifications
- **CORS** enabled for frontend-backend communication

### Frontend
- **HTML5** with semantic markup
- **CSS3** with modern styling and responsive design
- **Vanilla JavaScript** for dynamic functionality
- **Font Awesome** icons and Google Fonts
- **Toast notifications** for user feedback

## Project Structure

```
social-media-publisher/
├── public/
│   ├── index.html          # Main frontend interface
│   ├── style.css           # Modern responsive styling
│   └── app.js              # Frontend JavaScript functionality
├── server.js               # Main Express server and API endpoints
├── package.json            # Node.js dependencies and scripts
├── .env.example            # Environment variables template
├── config.json             # Application configuration (auto-generated)
├── activity-log.json       # Activity logging (auto-generated)
└── README.md               # This documentation
```

## Prerequisites

Before setting up the application, you'll need to obtain the following:

1. **OpenAI API Key** with access to GPT-4 and DALL-E 3
2. **Facebook Page Access Token** with `pages_manage_posts` permission
3. **SMTP Email Credentials** for failure notifications (optional)
4. **Node.js** version 12 or higher
5. **A server environment** that supports persistent Node.js processes



## Getting API Keys

### 1. OpenAI API Key

1. **Create an OpenAI Account**
   - Visit [OpenAI's website](https://openai.com/)
   - Sign up for an account or log in to your existing account

2. **Access the API Section**
   - Navigate to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Click on "Create new secret key"

3. **Generate Your API Key**
   - Give your key a descriptive name (e.g., "Social Media Publisher")
   - Copy the generated key (starts with `sk-`)
   - **Important**: Store this key securely as it won't be shown again

4. **Set Up Billing**
   - Add a payment method to your OpenAI account
   - Set usage limits to control costs
   - Monitor your usage in the OpenAI dashboard

### 2. Facebook Page Access Token

1. **Create a Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App" and select "Business" as the app type
   - Fill in your app details and create the app

2. **Add Facebook Login Product**
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"
   - Configure the basic settings

3. **Generate Page Access Token**
   - Go to Tools > Graph API Explorer
   - Select your app from the dropdown
   - Click "Generate Access Token"
   - Select the required permissions:
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`
   - Choose your Facebook Page from the list
   - Copy the generated access token

4. **Make Token Long-Lived** (Recommended)
   - Use the Access Token Debugger to extend token lifetime
   - Or implement token refresh in your application

### 3. SMTP Email Configuration (Optional)

For email notifications when posting fails:

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail address
   - Password: The generated app password

**Other Email Providers:**
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Contact your email provider for settings


## Installation & Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd social-media-publisher

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

### 3. Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your credentials:**
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   
   # Facebook API Configuration
   FACEBOOK_ACCESS_TOKEN=your-facebook-page-access-token-here
   
   # Email Configuration for Notifications (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password-here
   NOTIFICATION_EMAIL=recipient@example.com
   
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   ```

### 4. Start the Application

```bash
# For development
npm start

# For production with process manager (recommended)
npm install -g pm2
pm2 start server.js --name "social-media-publisher"
pm2 save
pm2 startup
```

### 5. Access the Web Interface

1. Open your web browser
2. Navigate to `http://localhost:3000` (or your server's IP/domain)
3. Configure your settings through the web interface
4. Test the posting functionality

## Configuration

### Web Interface Configuration

The application provides a user-friendly web interface for configuration:

1. **API Keys**: Enter your OpenAI API key and Facebook Page access token
2. **Email Notifications**: Set up email alerts for posting failures
3. **Custom Prompts**: Customize the type of quotes to generate
4. **Test Functionality**: Use the "Test Post" button to verify everything works

### Scheduling Configuration

By default, the application posts daily at 9:00 AM Eastern Time. To modify the schedule:

1. Open `server.js`
2. Find the `cron.schedule` line
3. Modify the cron expression:
   ```javascript
   // Current: Daily at 9:00 AM ET
   cron.schedule('0 9 * * *', async () => {
   
   // Examples:
   // Every day at 6:00 PM: '0 18 * * *'
   // Twice daily (9 AM & 6 PM): '0 9,18 * * *'
   // Weekdays only at 9 AM: '0 9 * * 1-5'
   ```
4. Restart the application

### Timezone Configuration

To change the timezone:

1. Modify the timezone in the cron schedule:
   ```javascript
   cron.schedule('0 9 * * *', async () => {
     // ... posting logic
   }, {
     scheduled: true,
     timezone: "America/Los_Angeles" // Change this
   });
   ```

Common timezones:
- `America/New_York` (Eastern)
- `America/Chicago` (Central)
- `America/Denver` (Mountain)
- `America/Los_Angeles` (Pacific)
- `Europe/London` (GMT)
- `Europe/Paris` (CET)


## Hosting Recommendations

For production deployment, you need a hosting solution that supports persistent Node.js processes:

### Recommended Platforms

1. **Render** (Easiest)
   - Free tier available
   - Automatic deployments from Git
   - Built-in environment variable management
   - Persistent storage for logs and configuration

2. **Heroku**
   - Easy deployment with Git
   - Add-ons for databases and monitoring
   - Automatic scaling options
   - Free tier with limitations

3. **DigitalOcean App Platform**
   - Simple deployment process
   - Competitive pricing
   - Built-in monitoring and alerts
   - Easy scaling

4. **Railway**
   - Modern deployment platform
   - Git-based deployments
   - Simple pricing model
   - Good for Node.js applications

5. **VPS Solutions** (Advanced)
   - DigitalOcean Droplets
   - Linode
   - Vultr
   - AWS EC2
   - Google Cloud Compute Engine

### Deployment Steps (Generic)

1. **Prepare your code:**
   ```bash
   # Ensure all dependencies are in package.json
   npm install --production
   ```

2. **Set environment variables** on your hosting platform

3. **Configure the start command:**
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

4. **Deploy and monitor** the application logs

### VPS Deployment (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your application
git clone <your-repo-url>
cd social-media-publisher

# Install dependencies
npm install --production

# Set up environment variables
cp .env.example .env
nano .env  # Edit with your credentials

# Start with PM2
pm2 start server.js --name "social-media-publisher"
pm2 save
pm2 startup

# Set up reverse proxy (optional, for custom domain)
sudo apt install nginx
# Configure nginx to proxy to your Node.js app
```

## API Endpoints

The application exposes the following REST API endpoints:

### Configuration Endpoints

- **POST /api/settings**
  - Save application configuration
  - Body: `{ openaiApiKey, facebookAccessToken, notificationEmail, prompt }`
  - Returns: Success/error status

- **GET /api/settings**
  - Retrieve current configuration (without sensitive data)
  - Returns: `{ prompt, notificationEmail, hasOpenaiKey, hasFacebookToken }`

### Status and Monitoring

- **GET /api/status**
  - Get application status and activity log
  - Returns: Server status, last successful post, activity log, configuration status

- **GET /health**
  - Health check endpoint
  - Returns: Server status and uptime

### Testing

- **POST /api/test**
  - Manually trigger a test post
  - Requires valid configuration
  - Returns: Success/error status with posting details

## Troubleshooting

### Common Issues

1. **"Settings saved successfully" but posting fails**
   - Verify your API keys are correct and active
   - Check that your Facebook token has the required permissions
   - Ensure your OpenAI account has sufficient credits

2. **Server won't start**
   - Check that port 3000 is available
   - Verify all dependencies are installed (`npm install`)
   - Check the console for error messages

3. **Scheduled posts not working**
   - Verify the server is running continuously
   - Check the activity log for error messages
   - Ensure your hosting platform supports persistent processes

4. **Facebook API errors**
   - Verify your page access token is valid and not expired
   - Check that your Facebook app has the required permissions
   - Ensure you're posting to the correct page

5. **OpenAI API errors**
   - Check your API key is valid and active
   - Verify you have sufficient credits in your OpenAI account
   - Ensure you have access to GPT-4 and DALL-E 3

### Debug Mode

To enable detailed logging:

1. Set `NODE_ENV=development` in your `.env` file
2. Restart the application
3. Check the console output for detailed error messages

### Log Files

The application creates two log files:
- `config.json`: Stores your configuration settings
- `activity-log.json`: Records the last 10 activities with timestamps

### Getting Help

If you encounter issues:

1. Check the activity log in the web interface
2. Review the console output for error messages
3. Verify all API keys and permissions
4. Test each component individually using the web interface


## Security Considerations

### API Key Protection
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor API usage for unusual activity

### Server Security
- Keep Node.js and dependencies updated
- Use HTTPS in production (configure reverse proxy)
- Implement rate limiting if exposing to the internet
- Regular security audits with `npm audit`

### Facebook Security
- Use page-specific tokens, not user tokens
- Regularly review app permissions
- Monitor posting activity for unauthorized posts
- Set up Facebook app security notifications

## Customization

### Quote Prompts
Customize the type of content generated by modifying the prompt in the web interface. Examples:

- **Business Motivation**: "Generate a professional business motivation quote about leadership, innovation, or success. Keep it under 200 characters."
- **Health & Wellness**: "Create an inspiring quote about health, fitness, or mental wellness. Make it encouraging and under 200 characters."
- **Technology**: "Generate a thought-provoking quote about technology, innovation, or the digital future. Keep it under 200 characters."

### Image Styles
Modify the image generation prompt in `server.js`:

```javascript
const imagePrompt = `A minimalist, professional image inspired by the quote: "${quote}". Use modern design principles with clean typography and inspiring visuals.`;
```

### Posting Schedule
Customize when posts are published by modifying the cron expression:

```javascript
// Multiple times per day
cron.schedule('0 9,15,21 * * *', async () => {

// Specific days only
cron.schedule('0 9 * * 1,3,5', async () => {

// Different times for weekdays vs weekends
cron.schedule('0 9 * * 1-5', async () => { // Weekdays
cron.schedule('0 11 * * 0,6', async () => { // Weekends
```

### Email Templates
Customize email notifications by modifying the `sendEmailNotification` function in `server.js`.

## Performance Optimization

### Monitoring
- Monitor API usage and costs
- Track posting success rates
- Set up alerts for failures
- Regular log file cleanup

### Scaling
- Use PM2 cluster mode for high traffic
- Implement Redis for session storage if needed
- Consider CDN for static assets
- Database integration for larger scale operations

## Development

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd social-media-publisher

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env

# Start in development mode
npm run dev  # If you have nodemon installed
# or
node server.js
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Structure
- `server.js`: Main application logic and API endpoints
- `public/index.html`: Frontend interface structure
- `public/style.css`: Responsive styling and design
- `public/app.js`: Frontend JavaScript functionality

## Cost Considerations

### OpenAI API Costs
- GPT-4: ~$0.03 per quote (150 tokens)
- DALL-E 3: ~$0.04 per image (1024x1024, HD)
- **Daily cost**: ~$0.07 per automated post
- **Monthly cost**: ~$2.10 for daily posting

### Facebook API
- Free for standard posting
- Rate limits apply (200 posts per hour per page)

### Hosting Costs
- **Free tiers**: Render, Heroku (with limitations)
- **Paid hosting**: $5-20/month for basic VPS
- **Managed platforms**: $7-25/month

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
1. Check the troubleshooting section above
2. Review the activity logs in the web interface
3. Verify all API keys and permissions are correct
4. Test individual components using the web interface

## Changelog

### Version 1.0.0
- Initial release
- Automated daily Facebook posting
- OpenAI GPT-4 and DALL-E 3 integration
- Web-based configuration interface
- Email notifications for failures
- Activity logging and monitoring
- Responsive design for mobile and desktop

---

**Note**: This application is designed for educational and personal use. Ensure compliance with OpenAI's usage policies and Facebook's platform policies when using in production.

