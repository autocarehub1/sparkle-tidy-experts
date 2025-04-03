import React, { useState } from 'react';
import './EstimateCalculator.css';
import apiClient from '../api/axios';
import config from '../config';

// No need for axios config here - using the centralized axios instance

function EstimateCalculator() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'residential',
    squareFootage: '',
    serviceType: 'standard',
    frequency: 'one-time',
    message: '',
  });
  
  const [estimateResult, setEstimateResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Pricing rates (per sq ft)
  const rates = {
    residential: {
      standard: 0.12,
      deep: 0.20,
      move: 0.25,
    },
    commercial: {
      standard: 0.10,
      deep: 0.18,
      specialized: 0.22,
    }
  };
  
  // Frequency discounts
  const frequencyDiscounts = {
    'one-time': 1.0,
    'weekly': 0.85,
    'bi-weekly': 0.90,
    'monthly': 0.95,
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Auto-calculate when relevant fields change
    if (['propertyType', 'squareFootage', 'serviceType', 'frequency'].includes(name)) {
      calculateEstimate();
    }
  };
  
  const calculateEstimate = () => {
    const { propertyType, squareFootage, serviceType, frequency } = formData;
    
    if (!squareFootage || isNaN(squareFootage) || squareFootage <= 0) {
      setEstimateResult(null);
      return;
    }
    
    const baseRate = rates[propertyType][serviceType];
    const discount = frequencyDiscounts[frequency];
    const sqft = parseInt(squareFootage, 10);
    
    let estimatedPrice = baseRate * sqft * discount;
    
    // Minimum prices
    const minimumPrice = propertyType === 'residential' ? 120 : 200;
    estimatedPrice = Math.max(estimatedPrice, minimumPrice);
    
    // Store the price as a number, not a string
    setEstimateResult({
      price: parseFloat(estimatedPrice.toFixed(2)),
      squareFootage: sqft.toLocaleString(),
      serviceType,
      frequency,
      propertyType
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Calculate final estimate
    calculateEstimate();
    
    try {
      // Make sure estimateResult has a properly formatted price
      const dataToSend = {
        ...formData,
        estimateResult: {
          ...estimateResult,
          price: estimateResult && estimateResult.price ? 
            (typeof estimateResult.price === 'string' ? estimateResult.price : estimateResult.price.toFixed(2)) 
            : '0.00'
        }
      };
      
      console.log('Submitting estimate data:', dataToSend);
      
      // Send data to backend using apiClient
      const response = await apiClient.post('/api/send-estimate', dataToSend);
      
      console.log('Server response:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        throw new Error(response.data.message || 'There was an error sending your estimate. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting estimate:', err);
      
      // Check if the error has a friendly message from the axios interceptor
      if (err.isConnectionError && err.friendlyMessage) {
        setError(
          <div className="error-container">
            <p>{err.friendlyMessage}</p>
            <button 
              type="button" 
              className="retry-button" 
              onClick={() => handleSubmit(new Event('retry'))}
            >
              Try Again
            </button>
          </div>
        );
      } else if (err.response) {
        // Server returned an error response
        console.error('Server error response:', err.response.data);
        setError(
          <div className="error-container">
            <p>{err.response.data.message || 'There was an error processing your request.'}</p>
            <button 
              type="button" 
              className="retry-button" 
              onClick={() => handleSubmit(new Event('retry'))}
            >
              Try Again
            </button>
          </div>
        );
      } else if (err.request) {
        // No response received from server
        console.error('No response received from server');
        setError(
          <div className="error-container">
            <p>Could not connect to the server. Please check your internet connection and try again.</p>
            <p>If the problem persists, you can:</p>
            <ul>
              <li>Contact us directly at <a href={`mailto:${config.CONTACT.EMAIL}`}>{config.CONTACT.EMAIL}</a></li>
              <li>
                <button 
                  type="button" 
                  className="retry-button" 
                  onClick={() => handleSubmit(new Event('retry'))}
                >
                  Try Again
                </button>
              </li>
            </ul>
          </div>
        );
      } else {
        // Something else went wrong
        console.error('Error details:', err.message);
        setError(
          <div className="error-container">
            <p>{err.message || 'There was an error sending your estimate. Please try again.'}</p>
            <p>If the problem persists, please contact us at <a href={`mailto:${config.CONTACT.EMAIL}`}>{config.CONTACT.EMAIL}</a>.</p>
            <button 
              type="button" 
              className="retry-button" 
              onClick={() => handleSubmit(new Event('retry'))}
            >
              Try Again
            </button>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section className="estimate-calculator" id="estimate-calculator">
      <div className="container">
        <h2>Get Your Free Cleaning Estimate</h2>
        <p>Fill out the form below to receive an automated estimate for your cleaning needs.</p>
        
        {success ? (
          <div className="success-message">
            <h3>Thank You!</h3>
            <p>Your estimate has been sent to your email. We'll be in touch shortly!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="propertyType">Property Type</label>
                <select 
                  id="propertyType" 
                  name="propertyType" 
                  value={formData.propertyType} 
                  onChange={handleChange}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="squareFootage">Square Footage</label>
                <input 
                  type="number" 
                  id="squareFootage" 
                  name="squareFootage" 
                  value={formData.squareFootage} 
                  onChange={handleChange} 
                  min="1"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="serviceType">Service Type</label>
                <select 
                  id="serviceType" 
                  name="serviceType" 
                  value={formData.serviceType} 
                  onChange={handleChange}
                >
                  {formData.propertyType === 'residential' ? (
                    <>
                      <option value="standard">Standard Cleaning</option>
                      <option value="deep">Deep Cleaning</option>
                      <option value="move">Move In/Out Cleaning</option>
                    </>
                  ) : (
                    <>
                      <option value="standard">Standard Office Cleaning</option>
                      <option value="deep">Deep Commercial Cleaning</option>
                      <option value="specialized">Specialized Cleaning</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">Cleaning Frequency</label>
                <select 
                  id="frequency" 
                  name="frequency" 
                  value={formData.frequency} 
                  onChange={handleChange}
                >
                  <option value="one-time">One-time Service</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="message">Additional Information</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                rows="4"
              ></textarea>
            </div>
            
            {estimateResult && (
              <div className="estimate-result">
                <h3>Your Estimated Price</h3>
                <div className="price-display">${estimateResult.price}</div>
                <p>
                  This estimate is for {estimateResult.squareFootage} sq ft of 
                  {estimateResult.propertyType === 'residential' ? ' residential' : ' commercial'} space 
                  with {estimateResult.frequency} {estimateResult.serviceType} cleaning.
                </p>
                <p className="disclaimer">
                  *Final price may vary based on specific requirements and on-site assessment.
                </p>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Me My Estimate'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default EstimateCalculator; 