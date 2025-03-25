# DNS and Domain Configuration Checklist

## Domain Registration

- [ ] Confirm domain `sparkletidy.com` is registered with Hostinger
- [ ] Verify domain is active and not expired
- [ ] Check domain status in Hostinger control panel

## DNS Configuration

1. **A Records**
   - [ ] Create A record for `sparkletidy.com` (apex domain)
     * Host: `@` or blank
     * Value: Your VPS IP address
     * TTL: Automatic or 3600
   - [ ] Create A record for `www.sparkletidy.com`
     * Host: `www`
     * Value: Your VPS IP address
     * TTL: Automatic or 3600

2. **DNS Propagation**
   - [ ] Check propagation using dig command: `dig sparkletidy.com`
   - [ ] Check propagation using online tools like [whatsmydns.net](https://www.whatsmydns.net/)
   - [ ] Allow 24-48 hours for complete propagation

## Hostinger VPS Settings

1. **Networking**
   - [ ] Verify VPS has a public IP address
   - [ ] Check if VPS hostname is properly set

2. **Firewall**
   - [ ] Ensure ports 80 (HTTP) and 443 (HTTPS) are open in VPS firewall
   - [ ] Verify SSH access is working (port 22)

3. **Hostinger-Specific Settings**
   - [ ] Check for any domain-specific settings in Hostinger VPS control panel
   - [ ] Look for "Connect Domain" option and make sure it's configured

## Nginx Configuration

1. **Server Block**
   - [ ] Create proper server block for your domain
   - [ ] Include both www and non-www versions in `server_name`
   - [ ] Configure HTTP → HTTPS redirect

2. **SSL Configuration**
   - [ ] Install SSL certificate using Certbot
   - [ ] Verify certificate covers both `sparkletidy.com` and `www.sparkletidy.com`

## Application Settings

1. **Environment Variables**
   - [ ] Update application's .env file with proper domain
   - [ ] Set NODE_ENV=production

2. **Application Logs**
   - [ ] Check for any domain-related errors in application logs

## Testing

1. **HTTP Access**
   - [ ] Test HTTP access: `curl -I http://sparkletidy.com`
   - [ ] Verify HTTP redirect to HTTPS

2. **HTTPS Access**
   - [ ] Test HTTPS access: `curl -I https://sparkletidy.com`
   - [ ] Check for valid SSL certificate

3. **Browser Testing**
   - [ ] Test in different browsers
   - [ ] Test on mobile devices
   - [ ] Check both www and non-www versions

## Common Issues

1. **DNS Issues**
   - [ ] Domain not pointing to correct IP address
   - [ ] DNS propagation not complete

2. **SSL Certificate Issues**
   - [ ] Certificate not issued for both www and non-www
   - [ ] Certificate expired or invalid

3. **Nginx Configuration**
   - [ ] Incorrect server_name directive
   - [ ] Wrong proxy_pass configuration

4. **Application Issues**
   - [ ] Node.js application not running
   - [ ] Application not listening on correct port

## Resolution Steps

If the website is not accessible:

1. Verify DNS is pointing to the correct IP
2. Check if Nginx is running and configured correctly
3. Verify the Node.js application is running
4. Check all logs for specific error messages
5. Test locally first, then via IP address, then via domain 