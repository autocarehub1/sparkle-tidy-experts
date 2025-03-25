# Deploying Sparkle & Tidy Experts on Hostinger Shared Hosting

If you're having persistent issues with VPS deployment, you might consider switching to Hostinger's shared hosting, which is easier to set up but has some limitations for Node.js applications. This guide provides instructions for deploying your React application on shared hosting.

## Limitations of Shared Hosting

Before proceeding, be aware of these limitations:

1. Limited or no Node.js support on basic shared hosting plans
2. You'll need to use the static build of your React application
3. Dynamic server features will be limited or require workarounds
4. Database will need to be hosted separately or use alternatives

## Preparation

### 1. Build Your React Application

On your local machine:

```bash
# Navigate to your project
cd ~/Desktop/Development/hackathon_1

# Build the React application
npm run build
```

This will create a `build` directory with static files.

### 2. Set Up Hostinger Shared Hosting

1. Log in to your Hostinger account
2. Purchase a shared hosting plan if you don't have one
3. Go to "Hosting" > "Manage" for your domain

## Deployment

### 1. Create a ZIP File of Your Build

```bash
# Navigate to the build directory
cd build

# Create a ZIP file
zip -r sparkletidy-build.zip *
```

### 2. Upload to Hostinger

1. In Hostinger control panel, go to "Files" > "File Manager"
2. Navigate to the `public_html` directory
3. Upload your ZIP file
4. Extract the ZIP file to the `public_html` directory
5. Delete the ZIP file after extraction

### 3. Set Up Domain

1. Go to "Domains" > "sparkletidy.com"
2. Point the domain to your shared hosting (follow Hostinger's instructions)
3. Ensure DNS records are properly set

### Alternative 1: Using Hostinger Node.js Support (Premium Plans)

If you have a Hostinger premium plan with Node.js support:

1. Create a Node.js application in Hostinger control panel
2. Upload your server code
3. Configure environment variables
4. Set up MongoDB (if available) or use MongoDB Atlas

### Alternative 2: Static Site with API Services

If you need dynamic features without Node.js support:

1. Convert your React application to use external API services:
   - Use Firebase for authentication and database
   - Use Netlify/Vercel functions for serverless features
   - Use MongoDB Atlas for database

2. Update your code to use these services instead of your local Node.js backend

### Alternative 3: Use Hostinger Subdomain for API

If you have both shared hosting and VPS:

1. Deploy static React build to your main domain on shared hosting
2. Deploy Node.js backend to a subdomain on your VPS
3. Configure your React application to use this subdomain for API calls

## Setting Up Email Functionality

For email functionality without your Node.js server:

1. Use Hostinger's built-in email services
2. Or set up a form submission service like FormSubmit.co
3. Update your contact forms to use these services

## Static Website with Contact Form Workaround

If you only need a contact form functionality:

1. Use a service like Formspree or FormSubmit
2. Modify your contact form HTML to use their service

Example:
```html
<form action="https://formsubmit.co/info@sparkletidy.com" method="POST">
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <textarea name="message" required></textarea>
    <button type="submit">Send</button>
</form>
```

## Testing Your Site

After deployment:

1. Visit your domain (https://sparkletidy.com)
2. Test all static features
3. Verify that forms work correctly
4. Test on different browsers and devices

## Troubleshooting Shared Hosting Issues

### 404 Errors on Routes

React's client-side routing needs special handling. Create a .htaccess file in your public_html directory:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

### SSL Certificate

1. In Hostinger panel, go to "SSL/TLS"
2. Enable "SSL Certificate"
3. Choose "Let's Encrypt"
4. Follow the instructions to install

### Performance Optimization

1. Enable Hostinger's caching options
2. Compress images and optimize assets
3. Enable GZIP compression in .htaccess:

```
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json
</IfModule>
```

## Conclusion

While shared hosting has limitations for full-stack applications, it can be a viable option for simpler websites or as a temporary solution while you resolve VPS issues. Consider the alternatives provided if you need more dynamic functionality. 