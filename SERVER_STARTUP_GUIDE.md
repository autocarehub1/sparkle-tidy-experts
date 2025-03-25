# Server Startup Guide for Sparkle & Tidy Experts

## Issue: Module Not Found Error
 
You've encountered the error:
```
Error: Cannot find module '/root/sparkle-tidy-experts/index.js'
```

This happens because Node.js is looking for a file called `index.js` in the root directory, but your application's server code is in the `server/index.js` directory.

## Solutions

We've provided multiple solutions to fix this issue:

### Method 1: Use the Root-Level index.js (Recommended)

We've created a root-level `index.js` file that points to your actual server file. Start your app with:

```bash
cd /root/sparkle-tidy-experts
node index.js
```

### Method 2: Start with Explicit Path

Start your server by explicitly pointing to the server file:

```bash
cd /root/sparkle-tidy-experts
node server/index.js
```

### Method 3: Use PM2 with Updated Configuration

We've updated your `ecosystem.config.js` file to include the correct working directory. Start your app with:

```bash
cd /root/sparkle-tidy-experts
pm2 start ecosystem.config.js
```

## Verifying the Server is Running

After starting the server, verify it's running:

1. Check for a message like: `Server running on port 5003`
2. Access your API endpoint: `http://YOUR_SERVER_IP:5003/api/health` (should return a status message)
3. If using PM2: `pm2 list` and `pm2 logs sparkle-tidy-experts`

## Troubleshooting

If you're still encountering issues:

1. **Check package.json**: Ensure your `main` field points to the correct file
   ```bash
   cat package.json | grep main
   ```

2. **Verify node_modules**: Make sure dependencies are installed
   ```bash
   npm install
   ```

3. **Check permissions**: Ensure files are executable
   ```bash
   chmod +x server/index.js
   ```

4. **Check for errors in server logs**:
   ```bash
   pm2 logs sparkle-tidy-experts
   ```

5. **Verify MongoDB connection**: MongoDB should be running and accessible
   ```bash
   mongo mongodb://localhost:27017/sparkletidy
   ```

## Environment Configuration

Ensure your `.env` file is properly configured:
- `PORT=5003`
- `MONGODB_URI=mongodb://localhost:27017/sparkletidy`
- Other required variables like `EMAIL_HOST`, etc.

## Connecting to a Domain

After your server is running, see the `PM2_DEPLOYMENT_GUIDE.md` for instructions on connecting to your domain. 