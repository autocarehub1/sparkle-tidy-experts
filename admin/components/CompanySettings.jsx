import React, { useState, useEffect } from 'react';
import './CompanySettings.css';
import axios from 'axios';

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    logoUrl: '',
    businessHours: {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '15:00', isOpen: true },
      sunday: { open: '10:00', close: '15:00', isOpen: false }
    },
    taxRate: 8.25,
    currency: 'USD',
    timeZone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    emailNotifications: {
      newBooking: true,
      bookingCancellation: true,
      bookingReminder: true,
      paymentReceived: true,
      reviewReceived: true
    },
    smsNotifications: {
      newBooking: true,
      bookingCancellation: true,
      bookingReminder: false,
      paymentReceived: false,
      reviewReceived: false
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  // Fetch company settings from API
  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/company-settings');
      if (response.data && Object.keys(response.data).length > 0) {
        setFormData(response.data);
      } else {
        console.warn('Empty settings received from API, using defaults');
        // Keep the default settings from state
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      setErrorMessage('Failed to load company settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: field === 'isOpen' ? !prev.businessHours[day].isOpen : value
        }
      }
    }));
  };

  const handleNotificationChange = (type, field) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: !prev[type][field]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    if (formData.taxRate < 0 || formData.taxRate > 20) {
      newErrors.taxRate = 'Tax rate must be between 0 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      try {
        // Update company settings
        const response = await axios.put('/api/company-settings', formData);
        
        // Handle logo upload if a new logo was selected
        if (logoFile) {
          const logoData = new FormData();
          logoData.append('logo', logoFile);
          
          try {
            // In a real implementation, you would upload the file
            // For now, we'll just update the URL (simulating a successful upload)
            await axios.post('/api/company-settings/logo', {
              logoUrl: URL.createObjectURL(logoFile)
            });
          } catch (logoError) {
            console.error('Error uploading logo:', logoError);
            // Continue with success message even if logo upload fails
          }
        }
        
        setSuccessMessage('Settings saved successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error saving company settings:', error);
        setErrorMessage('Failed to save settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      setFormData(prev => ({
        ...prev,
        logoUrl: URL.createObjectURL(file)
      }));
    }
  };

  // Render tabs
  const renderTabs = () => {
    return (
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Company Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          Business Hours
        </button>
        <button 
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
      </div>
    );
  };

  // Render company profile form
  const renderProfileForm = () => {
    return (
      <div className="form-section">
        <h3>Company Information</h3>
        
        <div className="logo-upload">
          <div className="logo-preview">
            {formData.logoUrl && (
              <img src={formData.logoUrl} alt="Company logo" />
            )}
          </div>
          <div className="logo-actions">
            <label htmlFor="logo-upload" className="upload-btn">
              Upload Logo
              <input 
                type="file" 
                id="logo-upload" 
                accept="image/*" 
                onChange={handleLogoChange} 
                style={{ display: 'none' }}
              />
            </label>
            {formData.logoUrl && (
              <button 
                className="remove-btn"
                onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName">Company Name*</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={errors.companyName ? 'error' : ''}
            />
            {errors.companyName && <div className="error-message">{errors.companyName}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="address">Street Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City*</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <div className="error-message">{errors.city}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State*</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={errors.state ? 'error' : ''}
            />
            {errors.state && <div className="error-message">{errors.state}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code*</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={errors.zipCode ? 'error' : ''}
            />
            {errors.zipCode && <div className="error-message">{errors.zipCode}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Company Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render business hours form
  const renderBusinessHoursForm = () => {
    const days = [
      { id: 'monday', label: 'Monday' },
      { id: 'tuesday', label: 'Tuesday' },
      { id: 'wednesday', label: 'Wednesday' },
      { id: 'thursday', label: 'Thursday' },
      { id: 'friday', label: 'Friday' },
      { id: 'saturday', label: 'Saturday' },
      { id: 'sunday', label: 'Sunday' }
    ];
    
    return (
      <div className="form-section">
        <h3>Business Hours</h3>
        <p className="section-description">Set your regular business hours. Customers will be able to book appointments during these times.</p>
        
        <div className="business-hours">
          {days.map(day => (
            <div key={day.id} className="hours-row">
              <div className="day-label">{day.label}</div>
              <div className="hours-inputs">
                <div className="toggle-container">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={formData.businessHours[day.id].isOpen}
                      onChange={() => handleBusinessHoursChange(day.id, 'isOpen')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {formData.businessHours[day.id].isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                {formData.businessHours[day.id].isOpen && (
                  <>
                    <div className="time-input">
                      <label>Open</label>
                      <input
                        type="time"
                        value={formData.businessHours[day.id].open}
                        onChange={(e) => handleBusinessHoursChange(day.id, 'open', e.target.value)}
                      />
                    </div>
                    <div className="time-input">
                      <label>Close</label>
                      <input
                        type="time"
                        value={formData.businessHours[day.id].close}
                        onChange={(e) => handleBusinessHoursChange(day.id, 'close', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render preferences form
  const renderPreferencesForm = () => {
    return (
      <div className="form-section">
        <h3>Regional Settings</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="CAD">Canadian Dollar (CAD)</option>
              <option value="AUD">Australian Dollar (AUD)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="taxRate">Tax Rate (%)</label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              min="0"
              max="20"
              step="0.01"
              className={errors.taxRate ? 'error' : ''}
            />
            {errors.taxRate && <div className="error-message">{errors.taxRate}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeZone">Time Zone</label>
            <select
              id="timeZone"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
            </select>
          </div>
        </div>
        
        <h3>Display Preferences</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateFormat">Date Format</label>
            <select
              id="dateFormat"
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="timeFormat">Time Format</label>
            <select
              id="timeFormat"
              name="timeFormat"
              value={formData.timeFormat}
              onChange={handleChange}
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Render notifications form
  const renderNotificationsForm = () => {
    const notificationTypes = [
      { id: 'newBooking', label: 'New Booking' },
      { id: 'bookingCancellation', label: 'Booking Cancellation' },
      { id: 'bookingReminder', label: 'Booking Reminder' },
      { id: 'paymentReceived', label: 'Payment Received' },
      { id: 'reviewReceived', label: 'Review Received' }
    ];
    
    return (
      <div className="form-section">
        <h3>Notification Preferences</h3>
        <p className="section-description">Choose which notifications you want to receive and how.</p>
        
        <div className="notifications-table">
          <div className="notifications-header">
            <div className="notification-type">Notification Type</div>
            <div className="notification-channel">Email</div>
            <div className="notification-channel">SMS</div>
          </div>
          
          {notificationTypes.map(type => (
            <div key={type.id} className="notification-row">
              <div className="notification-type">{type.label}</div>
              <div className="notification-channel">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications[type.id]}
                    onChange={() => handleNotificationChange('emailNotifications', type.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-channel">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications[type.id]}
                    onChange={() => handleNotificationChange('smsNotifications', type.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render social media form
  const renderSocialMediaForm = () => {
    return (
      <div className="form-section">
        <h3>Social Media Profiles</h3>
        <p className="section-description">Connect your social media accounts to enhance your online presence.</p>
        
        <div className="form-row">
          <div className="form-group social-input">
            <label htmlFor="facebook">
              <i className="social-icon facebook">f</i> Facebook
            </label>
            <input
              type="text"
              id="facebook"
              value={formData.socialMedia.facebook}
              onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group social-input">
            <label htmlFor="twitter">
              <i className="social-icon twitter">t</i> Twitter
            </label>
            <input
              type="text"
              id="twitter"
              value={formData.socialMedia.twitter}
              onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group social-input">
            <label htmlFor="instagram">
              <i className="social-icon instagram">i</i> Instagram
            </label>
            <input
              type="text"
              id="instagram"
              value={formData.socialMedia.instagram}
              onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
              placeholder="https://instagram.com/yourprofile"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group social-input">
            <label htmlFor="linkedin">
              <i className="social-icon linkedin">in</i> LinkedIn
            </label>
            <input
              type="text"
              id="linkedin"
              value={formData.socialMedia.linkedin}
              onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileForm();
      case 'hours':
        return renderBusinessHoursForm();
      case 'preferences':
        return renderPreferencesForm();
      case 'notifications':
        return renderNotificationsForm();
      case 'social':
        return renderSocialMediaForm();
      default:
        return renderProfileForm();
    }
  };

  if (loading && !formData.companyName) {
    return <div className="loading-message">Loading company settings...</div>;
  }

  return (
    <div className="company-settings">
      <div className="settings-header">
        <h2>Company Settings</h2>
        <p>Manage your company information, business hours, and preferences</p>
      </div>
      
      {renderTabs()}
      
      <div className="settings-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {errorMessage && (
          <div className="global-error-message">
            {errorMessage}
            <button 
              className="retry-button" 
              onClick={fetchCompanySettings}
              style={{ marginLeft: '10px' }}
            >
              Retry
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {renderTabContent()}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanySettings; 