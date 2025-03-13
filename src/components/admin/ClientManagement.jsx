import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientManagement.css';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'residential',
    squareFootage: '',
    preferredService: 'standard',
    preferredDay: '',
    preferredTime: '',
    specialInstructions: '',
    pets: false,
    status: 'active'
  });
  const [error, setError] = useState('');

  // Fetch clients data from the API
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/clients', {
        params: {
          search: searchTerm
        }
      });
      setClients(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search for clients
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length > 2) {
      // Debounce search to avoid too many requests
      const timeoutId = setTimeout(() => {
        fetchClients();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  // Select a client to view details
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      propertyType: client.propertyType || 'residential',
      squareFootage: client.squareFootage || '',
      preferredService: client.preferredService || 'standard',
      preferredDay: client.preferredDay || '',
      preferredTime: client.preferredTime || '',
      specialInstructions: client.specialInstructions || '',
      pets: client.pets || false,
      status: client.status || 'active'
    });
    setIsEditing(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Save client changes
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/clients/${selectedClient._id}`, formData);
      
      if (response.data.success) {
        // Update the client in the list
        setClients(prevClients => 
          prevClients.map(client => 
            client._id === selectedClient._id ? response.data.client : client
          )
        );
        
        // Update the selected client
        setSelectedClient(response.data.client);
        setIsEditing(false);
        setError('');
      } else {
        setError(response.data.message || 'Failed to update client');
      }
    } catch (err) {
      console.error('Error updating client:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update client. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new client button handler
  const handleAddNewClient = () => {
    // Redirect to the new client registration page
    // This is handled by the Dashboard component's tab system
    // We'll use a callback to the parent component
    if (window.parent && typeof window.parent.setActiveTab === 'function') {
      window.parent.setActiveTab('new-client');
    } else {
      // Fallback if we can't access the parent's setActiveTab function
      window.location.href = '/admin/dashboard?tab=new-client';
    }
  };

  // Delete client handler
  const handleDeleteClient = async () => {
    if (!selectedClient || !window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.delete(`/api/clients/${selectedClient._id}`);
      
      if (response.data.success) {
        // Remove the client from the list
        setClients(prevClients => 
          prevClients.filter(client => client._id !== selectedClient._id)
        );
        
        // Clear the selected client
        setSelectedClient(null);
        setError('');
      } else {
        setError(response.data.message || 'Failed to delete client');
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete client. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get client full name
  const getClientName = (client) => {
    return `${client.firstName} ${client.lastName}`;
  };

  return (
    <div className="client-management">
      <div className="client-list-section">
        <div className="client-list-header">
          <h2>Client List</h2>
          <div className="client-actions">
            <input
              type="text"
              placeholder="Search clients..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="add-client-btn" onClick={handleAddNewClient}>
              Add New Client
            </button>
          </div>
        </div>

        {loading && !selectedClient ? (
          <div className="loading-message">Loading clients...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : clients.length === 0 ? (
          <div className="no-results">No clients found. Try a different search or add a new client.</div>
        ) : (
          <div className="client-list">
            {clients.map(client => (
              <div
                key={client._id}
                className={`client-item ${selectedClient && selectedClient._id === client._id ? 'selected' : ''}`}
                onClick={() => handleSelectClient(client)}
              >
                <div className="client-name">{getClientName(client)}</div>
                <div className="client-email">{client.email}</div>
                <div className="client-phone">{client.phone}</div>
                <div className="client-status">{client.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="client-details-section">
        {selectedClient ? (
          <>
            <div className="client-details-header">
              <h2>{isEditing ? 'Edit Client' : 'Client Details'}</h2>
              <div className="header-actions">
                {isEditing ? (
                  <>
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button className="save-btn" onClick={handleSaveChanges} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="edit-client-btn" onClick={handleEditToggle}>
                      Edit Client
                    </button>
                    <button className="delete-client-btn" onClick={handleDeleteClient}>
                      Delete Client
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="client-details-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address</h3>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Service Preferences</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Property Type</label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Square Footage</label>
                    <input
                      type="number"
                      name="squareFootage"
                      value={formData.squareFootage}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Service</label>
                    <select
                      name="preferredService"
                      value={formData.preferredService}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="standard">Standard Cleaning</option>
                      <option value="deep">Deep Cleaning</option>
                      <option value="move-in">Move-In Cleaning</option>
                      <option value="move-out">Move-Out Cleaning</option>
                      <option value="commercial">Commercial Cleaning</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Day</label>
                    <select
                      name="preferredDay"
                      value={formData.preferredDay}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                    <label>Preferred Time</label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="">No Preference</option>
                      <option value="Morning">Morning (8am - 12pm)</option>
                      <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                      <option value="Evening">Evening (4pm - 8pm)</option>
                    </select>
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
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <label htmlFor="pets">Has Pets</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Special Instructions</h3>
                <div className="form-row">
                  <div className="form-group full-width">
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>

              {selectedClient.createdAt && (
                <div className="form-section">
                  <h3>Account Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Client Since</label>
                      <div className="info-value">{formatDate(selectedClient.createdAt)}</div>
                    </div>
                    <div className="form-group">
                      <label>Last Service Date</label>
                      <div className="info-value">{formatDate(selectedClient.lastServiceDate)}</div>
                    </div>
                    <div className="form-group">
                      <label>Total Services</label>
                      <div className="info-value">{selectedClient.totalServices || 0}</div>
                    </div>
                    <div className="form-group">
                      <label>Total Spent</label>
                      <div className="info-value">
                        ${(selectedClient.totalSpent || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-client-selected">
            <p>Select a client from the list to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement; 