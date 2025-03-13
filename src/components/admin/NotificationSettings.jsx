import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const defaultSettings = {
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
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/notification-settings');
      if (response.data && Object.keys(response.data).length > 0) {
        setSettings(response.data);
      } else {
        console.warn('Empty settings received from API, using defaults');
        // Create default settings in the database
        await axios.put('/api/notification-settings', defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Failed to load notification settings. Using defaults.', 'error');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category, subcategory, field) => {
    setSettings(prev => {
      const updated = { ...prev };
      if (subcategory) {
        updated[category][subcategory][field] = !updated[category][subcategory][field];
      } else {
        updated[category][field] = !updated[category][field];
      }
      return updated;
    });
  };

  const handleRecipientsChange = (category, subcategory, value) => {
    setSettings(prev => {
      const updated = { ...prev };
      updated[category][subcategory].recipients = value.split(',').map(email => email.trim());
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/notification-settings', settings);
      showNotification('Notification settings updated successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading notification settings...</div>;
  }

  return (
    <div className="notification-settings">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <h2>Notification Settings</h2>
      <form onSubmit={handleSubmit}>
        <section className="settings-section">
          <h3>Email Notifications</h3>
          {Object.entries(settings.emailNotifications || {}).map(([key, value]) => (
            <div key={key} className="notification-group">
              <div className="notification-header">
                <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={value.enabled}
                    onChange={() => handleToggle('emailNotifications', key, 'enabled')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {value.enabled && (
                <div className="recipients">
                  <label>Recipients (comma-separated):</label>
                  <input
                    type="text"
                    value={(value.recipients || []).join(', ')}
                    onChange={(e) => handleRecipientsChange('emailNotifications', key, e.target.value)}
                    placeholder="Enter email addresses"
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="settings-section">
          <h3>SMS Notifications</h3>
          {Object.entries(settings.smsNotifications || {}).map(([key, value]) => (
            <div key={key} className="notification-group">
              <div className="notification-header">
                <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={value.enabled}
                    onChange={() => handleToggle('smsNotifications', key, 'enabled')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {value.enabled && (
                <div className="recipients">
                  <label>Phone Numbers (comma-separated):</label>
                  <input
                    type="text"
                    value={(value.recipients || []).join(', ')}
                    onChange={(e) => handleRecipientsChange('smsNotifications', key, e.target.value)}
                    placeholder="Enter phone numbers"
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="settings-section">
          <h3>Push Notifications</h3>
          <div className="notification-group">
            <div className="notification-header">
              <h4>Enable Push Notifications</h4>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications?.enabled || false}
                  onChange={() => handleToggle('pushNotifications', null, 'enabled')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3>Alert Preferences</h3>
          {Object.entries(settings.alertPreferences || {}).map(([key, value]) => (
            <div key={key} className="notification-group">
              <div className="notification-header">
                <h4>{key.split(/(?=[A-Z])/).join(' ')}</h4>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleToggle('alertPreferences', null, key)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </section>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings; 