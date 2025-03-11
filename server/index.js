const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
  origin: ['http://localhost:5004', 'http://localhost:3000', 'http://localhost:5002'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());

// Global variable to store the transporter
let transporter;

// Create Ethereal test account for development
const createTestAccount = async () => {
  console.log('Setting up Ethereal Email test account...');
  try {
    // Create a test account at Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    // Create reusable transporter using Ethereal
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Ethereal Email test account created successfully');
    console.log(`Username: ${testAccount.user}`);
    console.log(`Password: ${testAccount.pass}`);
    console.log(`View sent emails at: https://ethereal.email`);
    
    return true;
  } catch (error) {
    console.error('Error creating test account:', error);
    return false;
  }
};

// Setup production transporter
const setupProductionTransporter = () => {
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info@sparkletidy.com',
        pass: 'SparkSpark2024$'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    return true;
  } catch (error) {
    console.error('Error setting up production transporter:', error);
    return false;
  }
};

// Verify connection configuration
const verifyConnection = async () => {
  try {
    // Try to set up production transporter first
    if (setupProductionTransporter()) {
      await transporter.verify();
      console.log('SMTP connection to Hostinger verified successfully');
      console.log('Using email: info@sparkletidy.com');
      return true;
    }
  } catch (error) {
    console.error('SMTP connection to Hostinger failed:', error);
    console.error('Falling back to Ethereal test account...');
    
    // Fall back to Ethereal test account
    return await createTestAccount();
  }
};

// API endpoint for sending estimates
app.post('/api/send-estimate', async (req, res) => {
  console.log('Received estimate request:', req.body);
  
  const {
    name,
    email,
    phone,
    propertyType,
    squareFootage,
    serviceType,
    frequency,
    message,
    estimateResult
  } = req.body;
  
  // Format square footage with commas for thousands
  const formattedSquareFootage = typeof squareFootage === 'string' 
    ? parseInt(squareFootage, 10).toLocaleString() 
    : squareFootage.toLocaleString();
  
  // Format the price
  const formattedPrice = estimateResult && estimateResult.price 
    ? (typeof estimateResult.price === 'string' ? estimateResult.price : estimateResult.price.toFixed(2))
    : '0.00';
  
  try {
    console.log('Sending client estimate email to:', email);
    
    // Email to client
    const clientEmail = await transporter.sendMail({
      from: `"Sparkle & Tidy Experts" <info@sparkletidy.com>`,
      to: email,
      subject: 'Your Cleaning Estimate from Sparkle & Tidy Experts',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a90e2; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sparkle & Tidy Experts</h1>
            <p style="color: white; margin: 5px 0 0;">Professional Cleaning Services</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>Hello ${name},</h2>
            <p>Thank you for requesting an estimate from Sparkle & Tidy Experts. Based on the information you provided, here is your estimated cleaning cost:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4a90e2;">Your Estimate Details</h3>
              <p><strong>Property Type:</strong> ${propertyType === 'residential' ? 'Residential' : 'Commercial'}</p>
              <p><strong>Square Footage:</strong> ${formattedSquareFootage} sq ft</p>
              <p><strong>Service Type:</strong> ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Cleaning</p>
              <p><strong>Frequency:</strong> ${frequency.charAt(0).toUpperCase() + frequency.slice(1)}</p>
              <p><strong>Estimated Price:</strong> <span style="font-size: 24px; font-weight: bold; color: #4a90e2;">$${formattedPrice}</span></p>
            </div>
            
            <p>This estimate is based on the information you provided. The final price may vary based on the specific requirements of your space.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="http://localhost:5004/appointments" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Schedule Your Cleaning</a>
            </div>
            
            <p>If you have any questions or would like to discuss your cleaning needs further, please don't hesitate to contact us at <a href="mailto:info@sparkletidy.com">info@sparkletidy.com</a> or call us at (210) 555-1234.</p>
            
            <p>Thank you for considering Sparkle & Tidy Experts for your cleaning needs!</p>
            
            <p>Best regards,<br>The Sparkle & Tidy Team</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sparkle & Tidy Experts. All rights reserved.</p>
            <p>123 Main Street, San Antonio, TX • (210) 555-1234 • <a href="mailto:info@sparkletidy.com">info@sparkletidy.com</a></p>
          </div>
        </div>
      `
    });
    
    console.log('Client estimate email sent successfully');
    
    // If using Ethereal, provide preview URL
    if (clientEmail.messageId && clientEmail.messageId.includes('ethereal')) {
      console.log('Client Email Preview URL:', nodemailer.getTestMessageUrl(clientEmail));
    }
    
    console.log('Sending notification email to business');
    
    // Email to business owner
    const ownerEmail = await transporter.sendMail({
      from: `"Sparkle & Tidy Website" <info@sparkletidy.com>`,
      to: 'info@sparkletidy.com', // Send to the business email
      subject: 'New Estimate Request',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Estimate Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Property Type:</strong> ${propertyType === 'residential' ? 'Residential' : 'Commercial'}</p>
          <p><strong>Square Footage:</strong> ${formattedSquareFootage} sq ft</p>
          <p><strong>Service Type:</strong> ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Cleaning</p>
          <p><strong>Frequency:</strong> ${frequency.charAt(0).toUpperCase() + frequency.slice(1)}</p>
          <p><strong>Estimated Price:</strong> $${formattedPrice}</p>
          <p><strong>Additional Message:</strong> ${message || 'None provided'}</p>
        </div>
      `
    });
    
    // If using Ethereal, provide preview URL
    if (ownerEmail.messageId && ownerEmail.messageId.includes('ethereal')) {
      console.log('Owner Email Preview URL:', nodemailer.getTestMessageUrl(ownerEmail));
    }
    
    console.log('Estimate emails sent successfully');
    console.log(`Client email sent to: ${email}`);
    console.log(`Business notification sent to: info@sparkletidy.com`);
    
    res.status(200).json({ success: true, message: 'Estimate sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send estimate. Please try again or contact us directly at info@sparkletidy.com.' 
    });
  }
});

// API endpoint for sending appointment confirmations
app.post('/api/send-appointment', async (req, res) => {
  console.log('Received appointment request:', req.body);
  
  const {
    name,
    email,
    phone,
    propertyType,
    serviceType,
    squareFootage,
    recurring,
    date,
    timeSlot,
    specialRequests,
    estimatedPrice,
    address,
    city,
    zipCode
  } = req.body;
  
  // Validate required fields
  if (!name || !email || !date || !timeSlot) {
    console.error('Missing required fields in appointment request');
    return res.status(400).json({
      success: false,
      message: 'Missing required fields. Please fill out all required fields and try again.'
    });
  }
  
  try {
    // Format the date
    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Format the price
    const formattedPrice = typeof estimatedPrice === 'string' ? estimatedPrice : 
                          (estimatedPrice ? estimatedPrice.toFixed(2) : '0.00');
    
    console.log('Sending client confirmation email to:', email);
    
    // Email to client
    const clientEmail = await transporter.sendMail({
      from: `"Sparkle & Tidy Experts" <info@sparkletidy.com>`,
      to: email,
      subject: 'Your Cleaning Appointment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a90e2; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sparkle & Tidy Experts</h1>
            <p style="color: white; margin: 5px 0 0;">Professional Cleaning Services</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>Hello ${name},</h2>
            <p>Thank you for scheduling a cleaning appointment with Sparkle & Tidy Experts. Your appointment has been confirmed!</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4a90e2;">Your Appointment Details</h3>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${timeSlot}</p>
              <p><strong>Service:</strong> ${serviceType} Cleaning</p>
              <p><strong>Property Type:</strong> ${propertyType}</p>
              <p><strong>Frequency:</strong> ${recurring}</p>
              <p><strong>Estimated Price:</strong> <span style="font-size: 20px; font-weight: bold; color: #4a90e2;">$${formattedPrice}</span></p>
            </div>
            
            <p>Our cleaning team will arrive at the scheduled time. Please ensure that they have access to your property.</p>
            
            <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance at <a href="mailto:info@sparkletidy.com">info@sparkletidy.com</a> or call us at (210) 555-1234.</p>
            
            <p>Thank you for choosing Sparkle & Tidy Experts for your cleaning needs!</p>
            
            <p>Best regards,<br>The Sparkle & Tidy Team</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sparkle & Tidy Experts. All rights reserved.</p>
            <p>123 Main Street, San Antonio, TX • (210) 555-1234 • <a href="mailto:info@sparkletidy.com">info@sparkletidy.com</a></p>
          </div>
        </div>
      `
    });
    
    console.log('Client email sent successfully');
    
    // If using Ethereal, provide preview URL
    if (clientEmail.messageId && clientEmail.messageId.includes('ethereal')) {
      console.log('Client Email Preview URL:', nodemailer.getTestMessageUrl(clientEmail));
    }
    
    console.log('Sending notification email to business');
    
    // Email to business owner
    const ownerEmail = await transporter.sendMail({
      from: `"Sparkle & Tidy Website" <info@sparkletidy.com>`,
      to: 'info@sparkletidy.com', // Send to the business email
      subject: 'New Cleaning Appointment',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Cleaning Appointment</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address || 'Not provided'}</p>
          <p><strong>City:</strong> ${city || 'Not provided'}</p>
          <p><strong>Zip Code:</strong> ${zipCode || 'Not provided'}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Property Type:</strong> ${propertyType}</p>
          <p><strong>Service Type:</strong> ${serviceType} Cleaning</p>
          <p><strong>Square Footage:</strong> ${squareFootage}</p>
          <p><strong>Frequency:</strong> ${recurring}</p>
          <p><strong>Estimated Price:</strong> $${formattedPrice}</p>
          <p><strong>Special Instructions:</strong> ${specialRequests || 'None provided'}</p>
        </div>
      `
    });
    
    // If using Ethereal, provide preview URL
    if (ownerEmail.messageId && ownerEmail.messageId.includes('ethereal')) {
      console.log('Owner Email Preview URL:', nodemailer.getTestMessageUrl(ownerEmail));
    }
    
    console.log('Appointment emails sent successfully');
    console.log(`Client email sent to: ${email}`);
    console.log(`Business notification sent to: info@sparkletidy.com`);
    
    res.status(200).json({ success: true, message: 'Appointment confirmation sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send appointment confirmation. Please contact us directly at info@sparkletidy.com.' 
    });
  }
});

// Verify SMTP connection when the server starts
verifyConnection().catch(console.error);

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running correctly',
    email: 'info@sparkletidy.com'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 