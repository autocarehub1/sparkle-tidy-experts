import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>Sparkle & Tidy Experts</h3>
            <p>Professional cleaning services for homes and businesses in San Antonio, Texas. We're committed to making your space shine!</p>
            <div className="contact-info">
              <p><i className="icon">📍</i> 123 Main Street, San Antonio, TX</p>
              <p><i className="icon">📞</i> (210) 555-1234</p>
              <p><i className="icon">✉️</i> info@sparkletidy.com</p>
            </div>
          </div>
          
          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><Link to="/appointments">Book Appointment</Link></li>
              <li><a href="#estimate-calculator">Get Estimate</a></li>
            </ul>
          </div>
          
          <div className="footer-section hours">
            <h3>Business Hours</h3>
            <ul>
              <li>Monday - Friday: 8:00 AM - 6:00 PM</li>
              <li>Saturday: 9:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Sparkle & Tidy Experts. All rights reserved.</p>
          <div className="social-icons">
            <a href="#" className="social-icon">FB</a>
            <a href="#" className="social-icon">IG</a>
            <a href="#" className="social-icon">TW</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 