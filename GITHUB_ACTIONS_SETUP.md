# GitHub Actions Deployment Setup Guide

This guide explains how to set up the GitHub Actions workflow for automatically deploying the Sparkle & Tidy Experts application to your Hostinger VPS whenever you push to the master branch.

## Prerequisites

1. A GitHub repository containing your application code
2. A Hostinger VPS running Ubuntu/Debian
3. SSH access to your VPS
4. Node.js, PM2, and NGINX installed on your VPS

## Setting Up GitHub Secrets

You need to add the following secrets to your GitHub repository to enable automated deployment:

1. **SSH_PRIVATE_KEY**: Your private SSH key for connecting to the VPS
2. **VPS_IP**: The IP address of your Hostinger VPS
3. **VPS_USER**: The SSH username (usually 'root')

### Step 1: Generate an SSH Key (if you don't already have one)

```bash
# Generate a new SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/sparkletidy_deploy_key

# Display the public key to add to your VPS
cat ~/.ssh/sparkletidy_deploy_key.pub

# Display the private key to add to GitHub Secrets
cat ~/.ssh/sparkletidy_deploy_key
```

### Step 2: Add the Public Key to Your VPS

1. Connect to your VPS:
   ```bash
   ssh root@YOUR_VPS_IP
   ```

2. Add the public key to the authorized_keys file:
   ```bash
   mkdir -p ~/.ssh
   echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### Step 3: Add Secrets to Your GitHub Repository

1. Go to your GitHub repository
2. Click on **Settings**
3. Click on **Secrets and variables** > **Actions**
4. Click on **New repository secret**
5. Add the following secrets:

   - Name: `SSH_PRIVATE_KEY`
     Value: *The entire private key content (including BEGIN and END lines)*

   - Name: `VPS_IP`
     Value: *Your VPS IP address*

   - Name: `VPS_USER`
     Value: `root` (or your specific user)

## How the Workflow Works

1. When you push to the master branch, the workflow is triggered
2. It builds both the frontend and admin applications
3. It creates a deployment package (ZIP file)
4. It connects to your VPS using SSH
5. It deploys the application, configures NGINX, and restarts the services

## Testing the Deployment

After setting up the secrets, push a change to your master branch:

```bash
git add .
git commit -m "Test automatic deployment"
git push origin master
```

You can monitor the deployment process in the Actions tab of your GitHub repository.

## Troubleshooting

### SSH Connection Issues

If the workflow fails to connect to your VPS:

1. Verify that the SSH_PRIVATE_KEY is correctly formatted (including BEGIN and END lines)
2. Ensure the public key is properly added to your VPS's authorized_keys file
3. Check that the VPS_IP and VPS_USER values are correct
4. Verify that your VPS firewall allows SSH connections

### Deployment Failures

If the deployment process fails:

1. Check the workflow logs in GitHub Actions for specific errors
2. SSH into your VPS and check the application logs:
   ```bash
   pm2 logs sparkle-tidy
   ```
3. Check NGINX error logs:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

## Securing Your Deployment

For production environments, consider implementing additional security measures:

1. Use a dedicated deployment user instead of root
2. Restrict the deployment user's permissions
3. Use IP restrictions for SSH access
4. Consider adding application-specific environment variables as GitHub Secrets 