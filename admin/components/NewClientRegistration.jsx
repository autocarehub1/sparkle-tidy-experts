import React, { useState } from 'react';
import axios from 'axios';
import './NewClientRegistration.css';

const NewClientRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    preferredService: 'standard',
    propertyType: 'residential',
    squareFootage: '',
    preferredDay: '',
    preferredTime: '',
    specialInstructions: '',
    howHeard: '',
    pets: false,
    referralSource: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.lastName) errors.push('Last name is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.phone) errors.push('Phone number is required');
    if (!formData.address) errors.push('Address is required');
    if (!formData.city) errors.push('City is required');
    if (!formData.state) errors.push('State is required');
    if (!formData.zipCode) errors.push('ZIP code is required');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send the client data to the server
      const response = await axios.post('/api/clients', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          preferredService: 'standard',
          propertyType: 'residential',
          squareFootage: '',
          preferredDay: '',
          preferredTime: '',
          specialInstructions: '',
          howHeard: '',
          pets: false,
          referralSource: ''
        });
      } else {
        setError(response.data.message || 'Failed to register client');
      }
    } catch (err) {
      console.error('Error registering client:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register client. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMockClients = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/generate-mock-clients', { count: 5 });
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to generate mock clients');
      }
    } catch (err) {
      console.error('Error generating mock clients:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to generate mock clients. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h3>Client Registration Successful!</h3>
        <p>The new client has been added to the system.</p>
        <div className="success-actions">
          <button 
            className="new-registration-btn"
            onClick={() => setSuccess(false)}
          >
            Register Another Client
          </button>
          <button 
            className="mock-data-btn"
            onClick={handleGenerateMockClients}
          >
            Generate 5 Mock Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="new-client-registration">
      <div className="registration-header">
        <h2>New Client Registration</h2>
        <p>Enter the client's information to create a new account</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Property Information</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
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
            <div className="form-group">
              <label htmlFor="squareFootage">Square Footage</label>
              <input
                type="number"
                id="squareFootage"
                name="squareFootage"
                value={formData.squareFootage}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Service Preferences</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredService">Preferred Service</label>
              <select
                id="preferredService"
                name="preferredService"
                value={formData.preferredService}
                onChange={handleChange}
              >
                <option value="standard">Standard Cleaning</option>
                <option value="deep">Deep Cleaning</option>
                <option value="move-in">Move-In Cleaning</option>
                <option value="move-out">Move-Out Cleaning</option>
                <option value="commercial">Commercial Cleaning</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="preferredDay">Preferred Day</label>
              <select
                id="preferredDay"
                name="preferredDay"
                value={formData.preferredDay}
                onChange={handleChange}
              >
                <option value="">No Preference</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="preferredTime">Preferred Time</label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
              >
                <option value="">No Preference</option>
                <option value="Morning">Morning (8am - 12pm)</option>
                <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                <option value="Evening">Evening (4pm - 8pm)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="specialInstructions">Special Instructions</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="pets"
                  name="pets"
                  checked={formData.pets}
                  onChange={handleChange}
                />
                <label htmlFor="pets">Has Pets</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="howHeard">How did they hear about us?</label>
              <select
                id="howHeard"
                name="howHeard"
                value={formData.howHeard}
                onChange={handleChange}
              >
                <option value="">Select an option</option>
                <option value="search">Search Engine</option>
                <option value="social">Social Media</option>
                <option value="referral">Referral</option>
                <option value="advertisement">Advertisement</option>
                <option value="other">Other</option>
              </select>
            </div>
            {formData.howHeard === 'referral' && (
              <div className="form-group">
                <label htmlFor="referralSource">Referral Source</label>
                <input
                  type="text"
                  id="referralSource"
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleChange}
                  placeholder="Who referred them?"
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Client'}
          </button>
        </div>
      </form>
      
      <div className="mock-data-section">
        <button 
          className="mock-data-btn"
          onClick={handleGenerateMockClients}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate 5 Mock Clients'}
        </button>
        <p className="mock-data-info">
          This will create 5 random clients with sample data for testing purposes.
        </p>
      </div>
    </div>
  );
};

export default NewClientRegistration; 