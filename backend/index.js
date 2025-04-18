const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/config');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;
const ALTERNATIVE_PORTS = [5004, 5005];

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('The server will continue to run, but database functionality will be unavailable');
  });

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add disconnection handler
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate limiting in production
if (config.rateLimit.enabled) {
  console.log(`Setting up rate limiting: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/60000} minutes`);
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { 
      status: 'error', 
      message: 'Too many requests, please try again later'
    }
  });
  
  // Apply rate limiting to API routes
  app.use('/api/', limiter);
}

// Add domain detection middleware for production
if (!config.isDevelopment) {
  app.use((req, res, next) => {
    const host = req.hostname;
    
    // Log the incoming request details
    console.log(`Incoming request: ${req.method} ${req.originalUrl} from host: ${host}`);
    
    // If request comes to sparkletidy.com (non-www), redirect to www.sparkletidy.com
    if (host === config.domains.main) {
      return res.redirect(301, `https://${config.domains.www}${req.originalUrl}`);
    }
    
    next();
  });
}

// Import models
const Contractor = require('./models/Contractor');
const Feedback = require('./models/Feedback');
const CompanySettings = require('./models/CompanySettings');
const NotificationSettings = require('./models/NotificationSettings');
const Transaction = require('./models/Transaction');
const Client = require('./models/Client');

// Define the frontend URL based on environment
const FRONTEND_URL = config.nodeEnv === 'production' 
  ? 'https://www.sparkletidy.com' 
  : 'http://localhost:3000';

// Global variable to store the transporter
let transporter;

// Global variable to store the server reference
let server;

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
    console.log('Setting up Hostinger email transporter...');
    console.log(`Host: ${config.email.host}, Port: ${config.email.port}, User: ${config.email.auth.user}`);
    
    // Check if email configuration is available
    if (!config.email.auth.user || !config.email.auth.pass) {
      console.error('Missing email credentials in configuration');
      console.error('Please ensure EMAIL_USER and EMAIL_PASSWORD are set in .env file');
      return false;
    }
    
    // Create the transporter with Hostinger configuration
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: true, // Use TLS for port 465
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      },
      tls: {
        // Allow self-signed certificates
        rejectUnauthorized: false,
        // Use older ciphers for compatibility
        ciphers: 'SSLv3'
      },
      debug: config.nodeEnv !== 'production', // Only enable debug in non-production
      logger: config.nodeEnv !== 'production'  // Only enable logger in non-production
    });
    
    console.log('✅ Hostinger email transporter created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error setting up Hostinger email transporter:', error);
    console.error('Email configuration attempted:', {
      host: config.email.host,
      port: config.email.port,
      user: config.email.auth.user,
      // Password excluded for security
    });
    return false;
  }
};

// Verify connection configuration
const verifyConnection = async () => {
  try {
    console.log('Attempting to verify email connection to Hostinger...');
    
    // Try to set up production transporter first
    if (setupProductionTransporter()) {
      // Test the connection
      console.log('Testing SMTP connection...');
      try {
        const verifyResult = await transporter.verify();
        console.log('✅ SMTP connection to Hostinger verified successfully:', verifyResult);
        console.log(`✅ Using email: ${config.email.auth.user}`);
        
        // You mentioned the Hostinger email is now working, so we'll return success
        console.log('Using production Hostinger email configuration');
        return true;
      } catch (verifyError) {
        console.error('❌ SMTP verification failed:', verifyError);
        throw verifyError;
      }
    }
  } catch (error) {
    console.error('❌ SMTP connection to Hostinger failed:', error);
    
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication error - check your email password!');
    } else if (error.code === 'ESOCKET') {
      console.error('❌ Socket error - check your port and connection settings!');
    } else if (error.code === 'ECONNECTION') {
      console.error('❌ Connection error - check your host and network settings!');
    }
    
    console.warn('Falling back to Ethereal test account for development purposes only...');
    console.warn('For production, please fix the Hostinger email settings.');
    
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
    // Ensure transporter is initialized
    if (!transporter) {
      console.log('Email transporter not initialized, attempting to initialize now...');
      await verifyConnection();
      
      if (!transporter) {
        throw new Error('Failed to initialize email transporter');
      }
    }
    
    console.log('Sending client estimate email to:', email);
    
    // Email to client
    const clientEmail = await transporter.sendMail({
      from: `"Sparkle & Tidy Experts" <${config.email.auth.user}>`,
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
              <a href="${config.frontendUrl}/appointments" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Schedule Your Cleaning</a>
            </div>
            
            <p>If you have any questions or would like to discuss your cleaning needs further, please don't hesitate to contact us at <a href="mailto:${config.email.auth.user}">${config.email.auth.user}</a> or call us at (210) 555-1234.</p>
            
            <p>Thank you for considering Sparkle & Tidy Experts for your cleaning needs!</p>
            
            <p>Best regards,<br>The Sparkle & Tidy Team</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Sparkle & Tidy Experts. All rights reserved.</p>
            <p>123 Main Street, San Antonio, TX • (210) 555-1234 • <a href="mailto:${config.email.auth.user}">${config.email.auth.user}</a></p>
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
      from: `"Sparkle & Tidy Website" <${config.email.auth.user}>`,
      to: config.email.auth.user, // Send to the business email
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
    console.log(`Business notification sent to: ${config.email.auth.user}`);
    
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

// Add test endpoints for checking the server status
app.get('/api/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check email service
    const emailStatus = transporter ? 'configured' : 'not configured';
    
    // Get uptime in seconds
    const uptime = Math.floor(process.uptime());
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: `${uptime} seconds`,
      database: dbStatus,
      email: {
        status: emailStatus,
        provider: config.email.isHostinger ? 'Hostinger' : 'Ethereal'
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Contractor Management API Endpoints
app.get('/api/contractors', async (req, res) => {
  try {
    const contractors = await Contractor.find();
    res.json(contractors);
  } catch (err) {
    console.error('Error fetching contractors:', err);
    res.status(500).json({ message: 'Error fetching contractors' });
  }
});

app.post('/api/contractors', async (req, res) => {
  try {
    const contractor = new Contractor(req.body);
    await contractor.save();
    res.status(201).json(contractor);
  } catch (err) {
    console.error('Error creating contractor:', err);
    if (err.code === 11000) { // Duplicate key error
      res.status(400).json({ message: 'A contractor with this email already exists' });
    } else {
      res.status(500).json({ message: 'Error creating contractor' });
    }
  }
});

app.put('/api/contractors/:id', async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }
    res.json(contractor);
  } catch (err) {
    console.error('Error updating contractor:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'A contractor with this email already exists' });
    } else {
      res.status(500).json({ message: 'Error updating contractor' });
    }
  }
});

app.delete('/api/contractors/:id', async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndDelete(req.params.id);
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }
    res.json({ message: 'Contractor deleted successfully' });
  } catch (err) {
    console.error('Error deleting contractor:', err);
    res.status(500).json({ message: 'Error deleting contractor' });
  }
});

// Feedback API Endpoints
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/feedback/contractor/:contractorId', async (req, res) => {
  try {
    const { contractorId } = req.params;
    const feedback = await Feedback.find({ contractorId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching contractor feedback:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { contractorId, clientName, email, rating, comment, serviceDate, serviceType } = req.body;
    
    // Validate required fields
    if (!contractorId || !clientName || !email || !rating || !comment || !serviceDate || !serviceType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create new feedback
    const newFeedback = new Feedback({
      contractorId,
      clientName,
      email,
      rating,
      comment,
      serviceDate,
      serviceType
    });
    
    // Save to database
    const savedFeedback = await newFeedback.save();
    
    // Update contractor's average rating
    const allFeedback = await Feedback.find({ contractorId });
    const totalRating = allFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allFeedback.length;
    
    // Update the contractor with the new average rating
    await Contractor.findByIdAndUpdate(contractorId, { rating: averageRating.toFixed(1) });
    
    // Send email notification about new feedback
    if (transporter) {
      const contractor = await Contractor.findById(contractorId);
      const contractorName = contractor ? `${contractor.firstName} ${contractor.lastName}` : 'a contractor';
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'info@sparkletidy.com',
        to: process.env.ADMIN_EMAIL || 'admin@sparkletidy.com',
        subject: `New Feedback Received for ${contractorName}`,
        html: `
          <h2>New Feedback Received</h2>
          <p><strong>Contractor:</strong> ${contractorName}</p>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Rating:</strong> ${rating} out of 5</p>
          <p><strong>Service Date:</strong> ${new Date(serviceDate).toLocaleDateString()}</p>
          <p><strong>Service Type:</strong> ${serviceType}</p>
          <p><strong>Comment:</strong> ${comment}</p>
        `
      };
      
      transporter.sendMail(mailOptions)
        .then(info => console.log('Feedback notification email sent:', info.messageId))
        .catch(err => console.error('Error sending feedback notification email:', err));
    }
    
    res.status(201).json(savedFeedback);
  } catch (err) {
    // Handle duplicate review error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted feedback for this service' });
    }
    
    console.error('Error saving feedback:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Company Settings API Endpoints
app.get('/api/company-settings', async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await CompanySettings.create({
        companyName: 'Sparkle & Tidy Experts',
        email: 'info@sparkletidy.com',
        phone: '(210) 555-1234',
        website: 'www.sparkletidy.com',
        address: '123 Main Street',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78248',
        description: 'Professional cleaning services for homes and businesses in San Antonio, Texas.'
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({ message: 'Error fetching company settings', error: error.message });
  }
});

app.put('/api/company-settings', async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();
    
    if (!settings) {
      return res.status(404).json({ message: 'Company settings not found' });
    }
    
    // Update fields from request body
    const updateFields = [
      'companyName', 'email', 'phone', 'website', 'address', 'city', 'state', 'zipCode',
      'description', 'logoUrl', 'businessHours', 'taxRate', 'currency', 'timeZone',
      'dateFormat', 'timeFormat', 'emailNotifications', 'smsNotifications', 'socialMedia'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({ message: 'Error updating company settings', error: error.message });
  }
});

// Logo upload endpoint (placeholder - would need file upload middleware in production)
app.post('/api/company-settings/logo', async (req, res) => {
  try {
    // In a real implementation, this would handle file uploads
    // For now, we'll just update the logoUrl if provided in the request
    if (!req.body.logoUrl) {
      return res.status(400).json({ message: 'Logo URL is required' });
    }
    
    const settings = await CompanySettings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Company settings not found' });
    }
    
    settings.logoUrl = req.body.logoUrl;
    await settings.save();
    
    res.json({ message: 'Logo updated successfully', logoUrl: settings.logoUrl });
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ message: 'Error updating logo', error: error.message });
  }
});

// Get notification settings
app.get('/api/notification-settings', async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await NotificationSettings.create({
        emailNotifications: {
          appointments: {
            enabled: true,
            recipients: ['info@sparkletidy.com']
          },
          feedback: {
            enabled: true,
            recipients: ['info@sparkletidy.com']
          },
          reports: {
            enabled: true,
            recipients: ['info@sparkletidy.com']
          }
        },
        smsNotifications: {
          appointments: {
            enabled: false,
            recipients: []
          },
          emergencies: {
            enabled: false,
            recipients: []
          }
        },
        pushNotifications: {
          enabled: false,
          devices: []
        },
        alertPreferences: {
          lowInventory: true,
          staffAbsence: true,
          paymentOverdue: true,
          systemUpdates: true
        }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
app.put('/api/notification-settings', async (req, res) => {
  try {
    const updates = req.body;
    let settings = await NotificationSettings.findOne();
    
    if (!settings) {
      settings = await NotificationSettings.create(updates);
    } else {
      settings = await NotificationSettings.findOneAndUpdate(
        {},
        { $set: updates },
        { new: true }
      );
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Financial Reports API Endpoints
app.get('/api/transactions', async (req, res) => {
  try {
    const { startDate, endDate, status, serviceType, paymentMethod } = req.query;
    
    // Build query object
    const query = {};
    
    // Add date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Add filters if provided
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    // Execute query
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 100);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    // Generate a unique transaction ID
    const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create new transaction with the generated ID
    const transaction = new Transaction({
      ...req.body,
      transactionId
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

app.get('/api/financial-reports', async (req, res) => {
  try {
    const { startDate, endDate, serviceType, paymentMethod } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Build filters
    const filters = {};
    if (serviceType) filters.serviceType = serviceType;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    
    // Generate report using the static method
    const report = await Transaction.generateReport(
      new Date(startDate),
      new Date(endDate),
      filters
    );
    
    res.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ message: 'Error generating financial report', error: error.message });
  }
});

// Generate mock transaction data for testing
app.post('/api/generate-mock-transactions', async (req, res) => {
  try {
    const { count = 50 } = req.body;
    const mockTransactions = [];
    
    // Get contractors for reference
    const contractors = await Contractor.find();
    
    // Service types
    const serviceTypes = ['standard', 'deep', 'move-in', 'move-out', 'commercial'];
    
    // Payment methods
    const paymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'paypal'];
    
    // Status options
    const statusOptions = ['pending', 'completed', 'refunded', 'failed', 'cancelled'];
    
    // Generate random transactions
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Random date in last 6 months
      
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      // Base amount by service type
      let baseAmount = 0;
      switch (serviceType) {
        case 'standard': baseAmount = 120; break;
        case 'deep': baseAmount = 200; break;
        case 'move-in': baseAmount = 250; break;
        case 'move-out': baseAmount = 280; break;
        case 'commercial': baseAmount = 350; break;
        default: baseAmount = 150;
      }
      
      // Add some randomness to the amount
      const amount = baseAmount + Math.floor(Math.random() * 50);
      
      // Calculate tax (8.25%)
      const taxAmount = parseFloat((amount * 0.0825).toFixed(2));
      
      // Random discount (0-10%)
      const discountPercent = Math.floor(Math.random() * 11);
      const discountAmount = parseFloat((amount * (discountPercent / 100)).toFixed(2));
      
      // Contractor payout (70% of amount)
      const contractorPayout = parseFloat((amount * 0.7).toFixed(2));
      
      // Random contractor
      const contractor = contractors.length > 0 
        ? contractors[Math.floor(Math.random() * contractors.length)] 
        : null;
      
      // Create transaction object
      const transaction = new Transaction({
        transactionId: `TRX-${Date.now()}-${i}`,
        date,
        clientName: `Client ${i + 1}`,
        clientEmail: `client${i + 1}@example.com`,
        serviceType,
        appointmentId: `APT-${Date.now()}-${i}`,
        amount,
        paymentMethod,
        status,
        notes: status === 'cancelled' ? 'Customer cancelled due to scheduling conflict' : '',
        taxAmount,
        discountAmount,
        contractorId: contractor ? contractor._id : null,
        contractorPayout,
        payoutStatus: status === 'completed' ? (Math.random() > 0.3 ? 'paid' : 'pending') : 'pending',
        refundAmount: status === 'refunded' ? amount : 0,
        refundReason: status === 'refunded' ? 'Customer dissatisfied with service' : ''
      });
      
      await transaction.save();
      mockTransactions.push(transaction);
    }
    
    res.status(201).json({ 
      message: `Successfully generated ${mockTransactions.length} mock transactions`,
      count: mockTransactions.length
    });
  } catch (error) {
    console.error('Error generating mock transactions:', error);
    res.status(500).json({ message: 'Error generating mock transactions', error: error.message });
  }
});

// Client Management API Endpoints
app.get('/api/clients', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    // Add search filter if provided
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clients', error: error.message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch client', error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    // Check if client with this email already exists
    const existingClient = await Client.findOne({ email: req.body.email });
    if (existingClient) {
      return res.status(400).json({ success: false, message: 'A client with this email already exists' });
    }
    
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json({ success: true, message: 'Client created successfully', client: newClient });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: 'Failed to create client', error: error.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    // Check if updating email and if it already exists for another client
    if (req.body.email) {
      const existingClient = await Client.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingClient) {
        return res.status(400).json({ success: false, message: 'A client with this email already exists' });
      }
    }
    
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.json({ success: true, message: 'Client updated successfully', client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, message: 'Failed to update client', error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    
    if (!deletedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Failed to delete client', error: error.message });
  }
});

// Generate mock clients for testing
app.post('/api/generate-mock-clients', async (req, res) => {
  try {
    const count = req.body.count || 10;
    const mockClients = [];
    
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    const cities = ['San Antonio', 'Austin', 'Houston', 'Dallas', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'];
    const states = ['TX'];
    const propertyTypes = ['residential', 'commercial'];
    const services = ['standard', 'deep', 'move-in', 'move-out', 'commercial'];
    const statuses = ['active', 'inactive', 'pending'];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const zipCode = `78${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const preferredService = services[Math.floor(Math.random() * services.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const mockClient = new Client({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`,
        phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
        city,
        state,
        zipCode,
        propertyType,
        squareFootage: Math.floor(Math.random() * 3000) + 1000,
        preferredService,
        preferredDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][Math.floor(Math.random() * 5)],
        preferredTime: ['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)],
        pets: Math.random() > 0.5,
        status,
        totalServices: Math.floor(Math.random() * 10),
        totalSpent: Math.floor(Math.random() * 5000)
      });
      
      await mockClient.save();
      mockClients.push(mockClient);
    }
    
    res.status(201).json({ 
      success: true, 
      message: `${count} mock clients created successfully`, 
      clients: mockClients 
    });
  } catch (error) {
    console.error('Error generating mock clients:', error);
    res.status(500).json({ success: false, message: 'Failed to generate mock clients', error: error.message });
  }
});

// Serve static files from the React frontend app in production
if (!config.isDevelopment) {
  console.log('Setting up static file serving for production');
  
  // Serve static files from the React app build directory
  const staticFilesPath = path.join(__dirname, '../frontend/build');
  
  // Serve static files with proper cache headers
  app.use(express.static(staticFilesPath, {
    etag: true,
    maxAge: '30d', // Cache static assets for 30 days
    setHeaders: (res, path) => {
      // Set cache headers based on file type
      if (path.endsWith('.html')) {
        // Don't cache HTML files
        res.setHeader('Cache-Control', 'no-cache');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        // Cache JS, CSS, and images
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
      }
    }
  }));
  
  // Handle API routes first (before the catch-all route for the frontend)
  app.use('/api', (req, res, next) => {
    console.log(`API request received: ${req.method} ${req.originalUrl}`);
    next();
  });
  
  // For any request not starting with /api, serve the React app
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      console.log(`Serving frontend for path: ${req.path}`);
      res.sendFile(path.join(staticFilesPath, 'index.html'));
    } else {
      next();
    }
  });
  
  console.log(`Static files will be served from: ${staticFilesPath}`);
  console.log(`All non-API routes will serve the React app`);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server',
    error: config.isDevelopment ? err.message : 'Internal Server Error'
  });
});

// Start the server with better error handling and port fallback
const startServer = (portIndex = 0) => {
  const currentPort = portIndex === 0 ? PORT : ALTERNATIVE_PORTS[portIndex - 1];
  
  try {
    console.log(`Attempting to start server on port ${currentPort}...`);
    
    server = app.listen(currentPort, () => {
      console.log(`Server running on port ${currentPort} - Open http://localhost:${currentPort}/api/health in your browser to test`);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${currentPort} is already in use.`);
        
        // Try next port if available
        const nextPortIndex = portIndex + 1;
        if (nextPortIndex <= ALTERNATIVE_PORTS.length) {
          console.log(`Trying alternative port ${ALTERNATIVE_PORTS[nextPortIndex - 1]}...`);
          startServer(nextPortIndex);
        } else {
          console.error('❌ All ports are in use. Please manually close the applications using these ports.');
          console.error(`Ports attempted: ${PORT}, ${ALTERNATIVE_PORTS.join(', ')}`);
          process.exit(1);
        }
      } else {
        console.error(`❌ Failed to start server: ${err.message}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
  }
};

// Initialize email service, then start the server
const initializeServices = async () => {
  try {
    // Verify email connection and set up transporter
    const result = await verifyConnection();
    if (result) {
      console.log('✅ Email service initialized successfully');
    } else {
      console.warn('⚠️ Email service not initialized properly, but continuing with server startup');
    }
    
    // Start the server
    startServer();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    // Still try to start the server even if email fails
    startServer();
  }
};

// Initialize services and start the application
initializeServices();

// Improved process termination handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        console.log('Process terminated');
        process.exit(0);
      });
    });
    
    // Force close after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  } else {
    console.log('Server not initialized, terminating immediately');
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        console.log('Process terminated');
        process.exit(0);
      });
    });
    
    // Force close after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  } else {
    console.log('Server not initialized, terminating immediately');
    process.exit(0);
  }
});

module.exports = app; 