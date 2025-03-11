import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './HeroSection.css';

function HeroSection({ title, subtitle, ctaText, ctaLink }) {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-logo">
            <Logo size="large" />
          </div>
          <h1>{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <div className="hero-features">
            <div className="hero-feature">
              <div className="feature-icon">✓</div>
              <span>Professional Service</span>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">✓</div>
              <span>Satisfaction Guaranteed</span>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">✓</div>
              <span>Eco-Friendly Products</span>
            </div>
          </div>
          <div className="hero-cta-container">
            <a href={ctaLink} className="hero-cta">{ctaText}</a>
            <Link to="/appointments" className="hero-cta primary">Book Now</Link>
            <a href="#services" className="hero-cta secondary">Our Services</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" alt="Professional Cleaning" />
          <div className="hero-image-badge">
            <div className="badge-content">
              <span className="badge-number">100%</span>
              <span className="badge-text">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection; 