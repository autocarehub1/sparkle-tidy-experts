import React, { useState, useEffect } from 'react';
import './ContractorManagement.css';
import apiClient from '../../api/axios';
import config from '../../config';

const ContractorManagement = () => {
  const [contractors, setContractors] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'active',
    startDate: '',
    specialties: [],
    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false }
    },
    documents: {
      idVerification: false,
      backgroundCheck: false,
      insurance: false,
      certification: false
    },
    paymentInfo: {
      rate: '',
      paymentMethod: 'direct_deposit',
      accountDetails: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/contractors');
      console.log('Fetched contractors:', response.data);
      setContractors(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contractors:', err);
      setError('Failed to load contractors');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSelectContractor = (contractor) => {
    setSelectedContractor(contractor);
    setFormData({
      firstName: contractor.firstName,
      lastName: contractor.lastName,
      email: contractor.email,
      phone: contractor.phone,
      address: contractor.address || '',
      city: contractor.city || '',
      state: contractor.state || '',
      zipCode: contractor.zipCode || '',
      status: contractor.status,
      startDate: contractor.startDate ? new Date(contractor.startDate).toISOString().split('T')[0] : '',
      specialties: contractor.specialties || [],
      availability: contractor.availability || {
        monday: { morning: false, afternoon: false, evening: false },
        tuesday: { morning: false, afternoon: false, evening: false },
        wednesday: { morning: false, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: false, afternoon: false, evening: false }
      },
      documents: contractor.documents || {
        idVerification: false,
        backgroundCheck: false,
        insurance: false,
        certification: false
      },
      paymentInfo: contractor.paymentInfo || {
        rate: '',
        paymentMethod: 'direct_deposit',
        accountDetails: ''
      },
      notes: contractor.notes || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('availability.')) {
        const [_, day, timeSlot] = name.split('.');
        setFormData(prev => ({
          ...prev,
          availability: {
            ...prev.availability,
            [day]: {
              ...prev.availability[day],
              [timeSlot]: checked
            }
          }
        }));
      } else if (name.startsWith('documents.')) {
        const document = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [document]: checked
          }
        }));
      }
    } else if (name.startsWith('paymentInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        paymentInfo: {
          ...prev.paymentInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddNew = () => {
    setSelectedContractor(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      status: 'active',
      startDate: '',
      specialties: [],
      availability: {
        monday: { morning: false, afternoon: false, evening: false },
        tuesday: { morning: false, afternoon: false, evening: false },
        wednesday: { morning: false, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: false, afternoon: false, evening: false }
      },
      documents: {
        idVerification: false,
        backgroundCheck: false,
        insurance: false,
        certification: false
      },
      paymentInfo: {
        rate: '',
        paymentMethod: 'direct_deposit',
        accountDetails: ''
      },
      notes: ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure paymentInfo.rate is a number
      const submissionData = {
        ...formData,
        paymentInfo: {
          ...formData.paymentInfo,
          rate: Number(formData.paymentInfo.rate)
        }
      };

      console.log('Submitting contractor data:', submissionData);

      if (selectedContractor) {
        // Update existing contractor
        const response = await apiClient.put(
          `/api/contractors/${selectedContractor._id}`,
          submissionData
        );
        const updatedContractor = response.data;
        setContractors(contractors.map(c =>
          c._id === updatedContractor._id ? updatedContractor : c
        ));
      } else {
        // Add new contractor
        const response = await apiClient.post('/api/contractors', submissionData);
        const newContractor = response.data;
        setContractors([...contractors, newContractor]);
      }

      setShowAddForm(false);
      setIsEditing(false);
      setSelectedContractor(null);
      setError('');
    } catch (err) {
      console.error('Error saving contractor:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save contractor information');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contractorId) => {
    if (!window.confirm('Are you sure you want to delete this contractor?')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/api/contractors/${contractorId}`);
      setContractors(contractors.filter(c => c._id !== contractorId));
      if (selectedContractor && selectedContractor._id === contractorId) {
        setSelectedContractor(null);
      }
      setShowAddForm(false);
      setError('');
    } catch (err) {
      console.error('Error deleting contractor:', err);
      setError('Failed to delete contractor');
    } finally {
      setLoading(false);
    }
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = (
      contractor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesFilter = filterStatus === 'all' || contractor.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && contractors.length === 0) {
    return <div className="loading-message">Loading contractors...</div>;
  }

  return (
    <div className="contractor-management">
      <div className="contractor-list-section">
        <div className="contractor-list-header">
          <h2>Contractors</h2>
          <div className="contractor-actions">
            <div className="search-filter-group">
              <input
                type="text"
                placeholder="Search contractors..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <select
                value={filterStatus}
                onChange={handleFilterChange}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button className="add-contractor-btn" onClick={handleAddNew}>
              Add New Contractor
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="contractor-list">
          {filteredContractors.map(contractor => (
            <div
              key={contractor._id}
              className={`contractor-card ${selectedContractor?._id === contractor._id ? 'selected' : ''}`}
              onClick={() => handleSelectContractor(contractor)}
            >
              <div className="contractor-info">
                <h3>{`${contractor.firstName} ${contractor.lastName}`}</h3>
                <p className="contractor-email">{contractor.email}</p>
                <p className="contractor-phone">{contractor.phone}</p>
              </div>
              <div className="contractor-stats">
                <div className="stat">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">{contractor.rating} ⭐</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Jobs</span>
                  <span className="stat-value">{contractor.completedJobs}</span>
                </div>
              </div>
              <div className={`status-badge ${contractor.status}`}>
                {contractor.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contractor-details-section">
        {(selectedContractor || showAddForm) ? (
          <form onSubmit={handleSubmit} className="contractor-form">
            <div className="form-header">
              <h2>{showAddForm ? 'Add New Contractor' : 'Contractor Details'}</h2>
              {selectedContractor && !isEditing && (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Work Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Specialties</label>
                  <div className="specialties-grid">
                    {['Standard Cleaning', 'Deep Cleaning', 'Move-in/Move-out', 'Post-Construction'].map(specialty => (
                      <label key={specialty} className="specialty-checkbox">
                        <input
                          type="checkbox"
                          name="specialties"
                          value={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onChange={(e) => {
                            const updatedSpecialties = e.target.checked
                              ? [...formData.specialties, specialty]
                              : formData.specialties.filter(s => s !== specialty);
                            setFormData(prev => ({
                              ...prev,
                              specialties: updatedSpecialties
                            }));
                          }}
                          disabled={!isEditing && !showAddForm}
                        />
                        <span>{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Availability</h3>
              <div className="availability-grid">
                {Object.entries(formData.availability).map(([day, slots]) => (
                  <div key={day} className="availability-day">
                    <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                    {Object.entries(slots).map(([timeSlot, isAvailable]) => (
                      <label key={`${day}-${timeSlot}`} className="time-slot-checkbox">
                        <input
                          type="checkbox"
                          name={`availability.${day}.${timeSlot}`}
                          checked={isAvailable}
                          onChange={handleInputChange}
                          disabled={!isEditing && !showAddForm}
                        />
                        <span>{timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Documents & Verification</h3>
              <div className="documents-grid">
                {Object.entries(formData.documents).map(([doc, isVerified]) => (
                  <label key={doc} className="document-checkbox">
                    <input
                      type="checkbox"
                      name={`documents.${doc}`}
                      checked={isVerified}
                      onChange={handleInputChange}
                      disabled={!isEditing && !showAddForm}
                    />
                    <span>{doc.split(/(?=[A-Z])/).join(' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="paymentRate">Hourly Rate ($)</label>
                  <input
                    type="number"
                    id="paymentRate"
                    name="paymentInfo.rate"
                    value={formData.paymentInfo.rate}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentInfo.paymentMethod"
                    value={formData.paymentInfo.paymentMethod}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                  >
                    <option value="direct_deposit">Direct Deposit</option>
                    <option value="check">Check</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Notes</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={!isEditing && !showAddForm}
                    rows="4"
                    placeholder="Add any additional notes about the contractor..."
                  ></textarea>
                </div>
              </div>
            </div>

            {(isEditing || showAddForm) && (
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setShowAddForm(false);
                    if (!selectedContractor) {
                      setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        status: 'active',
                        startDate: '',
                        specialties: []
                      });
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="no-selection-message">
            <p>Select a contractor from the list or add a new one to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorManagement; 