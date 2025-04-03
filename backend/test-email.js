/**
 * Test Email Connection Script
 * 
 * This script tests the connection to the Hostinger email server
 * without starting the entire application.
 * 
 * Usage: node test-email.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Get email settings from environment variables
const emailUser = process.env.EMAIL_USER || 'info@sparkletidy.com';
const emailPass = process.env.EMAIL_PASSWORD;
const emailHost = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const emailPort = process.env.EMAIL_PORT || 465;

console.log(`Testing email connection to ${emailHost}:${emailPort} with user ${emailUser}`);
console.log('Make sure you have updated the EMAIL_PASSWORD in your .env file with the correct password');

// Create transporter
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: true, // use SSL
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
    ciphers: 'SSLv3' // Use older ciphers for compatibility with some servers
  },
  debug: true, // Enable debug logs
  logger: true // Log SMTP traffic
});

// Verify connection configuration
async function verifyConnection() {
  try {
    console.log('Testing SMTP connection...');
    const verifyResult = await transporter.verify();
    console.log('✅ SMTP connection verified successfully:', verifyResult);
    console.log(`✅ Using email: ${emailUser}`);
    
    // Try sending a test email
    console.log('Sending test email to verify complete functionality...');
    const testInfo = await transporter.sendMail({
      from: `"System Test" <${emailUser}>`,
      to: emailUser, // sending to the same address
      subject: "SMTP Connection Test",
      text: "If you received this email, your SMTP connection is working correctly.",
      html: "<p>If you received this email, your SMTP connection is working correctly.</p>"
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', testInfo.messageId);
    console.log('Check your inbox at', emailUser);
    
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication error - check your email password!');
    } else if (error.code === 'ESOCKET') {
      console.error('❌ Socket error - check your port and connection settings!');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ Connection error - check your host and network settings!');
    }
    
    return false;
  }
}

// Run the test
verifyConnection()
  .then(success => {
    if (success) {
      console.log('✅ Email configuration is working correctly!');
    } else {
      console.log('❌ Email configuration has problems.');
      console.log('Please update your .env file with the correct email settings.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 