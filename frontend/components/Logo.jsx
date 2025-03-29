import React from 'react';
import './Logo.css';

function Logo({ size = 'medium', withText = true }) {
  const sizes = {
    small: { width: 40, height: 40, fontSize: 14 },
    medium: { width: 60, height: 60, fontSize: 18 },
    large: { width: 80, height: 80, fontSize: 24 }
  };
  
  const { width, height, fontSize } = sizes[size] || sizes.medium;
  
  return (
    <div className={`logo-container ${size} ${withText ? 'with-text' : ''}`}>
      <div className="logo-icon">
        <svg 
          width={width} 
          height={height} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular background */}
          <circle cx="50" cy="50" r="48" fill="#4a90e2" />
          <circle cx="50" cy="50" r="44" fill="white" />
          
          {/* Sparkle elements */}
          <path d="M50 15L53 30L60 20L55 35L70 30L57 40L75 50L57 60L70 70L55 65L60 80L53 70L50 85L47 70L40 80L45 65L30 70L43 60L25 50L43 40L30 30L45 35L40 20L47 30L50 15Z" fill="#4a90e2" />
          
          {/* Cleaning brush */}
          <rect x="35" y="60" width="30" height="8" rx="2" fill="#4a90e2" />
          <rect x="40" y="68" width="20" height="12" rx="1" fill="#4a90e2" />
          <rect x="42" y="80" width="2" height="5" fill="#4a90e2" />
          <rect x="46" y="80" width="2" height="5" fill="#4a90e2" />
          <rect x="50" y="80" width="2" height="5" fill="#4a90e2" />
          <rect x="54" y="80" width="2" height="5" fill="#4a90e2" />
          <rect x="58" y="80" width="2" height="5" fill="#4a90e2" />
        </svg>
      </div>
      
      {withText && (
        <div className="logo-text" style={{ fontSize }}>
          <span className="logo-name">Sparkle & Tidy</span>
          <span className="logo-tagline">Experts</span>
        </div>
      )}
    </div>
  );
}

export default Logo; 