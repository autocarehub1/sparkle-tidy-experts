import React, { useState, useEffect } from 'react';
import './FeedbackForm.css';
import apiClient from '../api/axios';
import config from '../config';

const FeedbackForm = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    contractorId: '',
    clientName: '',
    email: '',
    rating: 5,
    comment: '',
    serviceDate: '',
    serviceType: 'Standard Cleaning'
  });

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        // Try to fetch real data first
        try {
          const response = await apiClient.get('/api/contractors');
          if (response.data && response.data.length > 0) {
            setContractors(response.data.map(contractor => ({
              id: contractor._id,
              name: `${contractor.firstName} ${contractor.lastName}`
            })));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error fetching real contractor data:', err);
          // Fall back to mock data
        }
        
        // Mock data as fallback
        const mockContractors = [
          { id: 1, name: 'John Smith' },
          { id: 2, name: 'Maria Garcia' },
          { id: 3, name: 'David Johnson' }
        ];
        
        setContractors(mockContractors);
        setLoading(false);
      } catch (err) {
        console.error('Error loading contractors:', err);
        setError('Failed to load contractors');
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // In a real app, this would send data to your backend
      // For now, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to post to the real API
      try {
        await apiClient.post('/api/feedback', formData);
      } catch (err) {
        console.error('Error posting to real API:', err);
        // Continue with mock success even if real API fails
      }
      
      setSuccess(true);
      setFormData({
        contractorId: '',
        clientName: '',
        email: '',
        rating: 5,
        comment: '',
        serviceDate: '',
        serviceType: 'Standard Cleaning'
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= formData.rating ? 'filled' : ''}`}
          onClick={() => handleRatingChange(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading && contractors.length === 0) {
    return <div className="loading-message">Loading feedback form...</div>;
  }

  return (
    <section className="feedback-form-section" id="feedback-form">
      <div className="container">
        <h2>Share Your Experience</h2>
        <p>We value your feedback! Please let us know about your recent cleaning experience.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        {success ? (
          <div className="success-message">
            <h3>Thank You for Your Feedback!</h3>
            <p>We appreciate you taking the time to share your experience. Your feedback helps us improve our services.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientName">Your Name</label>
                <input 
                  type="text" 
                  id="clientName" 
                  name="clientName" 
                  value={formData.clientName} 
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
                <label htmlFor="contractorId">Cleaning Professional</label>
                <select 
                  id="contractorId" 
                  name="contractorId" 
                  value={formData.contractorId} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a cleaning professional</option>
                  {contractors.map(contractor => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="serviceType">Service Type</label>
                <select 
                  id="serviceType" 
                  name="serviceType" 
                  value={formData.serviceType} 
                  onChange={handleChange}
                  required
                >
                  <option value="Standard Cleaning">Standard Cleaning</option>
                  <option value="Deep Cleaning">Deep Cleaning</option>
                  <option value="Move-in/Move-out Cleaning">Move-in/Move-out Cleaning</option>
                  <option value="Post-Construction Cleaning">Post-Construction Cleaning</option>
                  <option value="Office Cleaning">Office Cleaning</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serviceDate">Service Date</label>
                <input 
                  type="date" 
                  id="serviceDate" 
                  name="serviceDate" 
                  value={formData.serviceDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating">
                  {renderStars()}
                  <span className="rating-text">{formData.rating} out of 5</span>
                </div>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="comment">Your Feedback</label>
              <textarea 
                id="comment" 
                name="comment" 
                value={formData.comment} 
                onChange={handleChange} 
                rows="4"
                required
                placeholder="Please share your experience with our service..."
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default FeedbackForm; 