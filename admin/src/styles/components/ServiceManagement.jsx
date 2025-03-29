import React, { useState, useEffect } from 'react';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    isActive: true,
    image: null,
    features: [''],
    customFields: []
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchServices = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockServices = [
          {
            id: 1,
            name: 'Standard Home Cleaning',
            description: 'A thorough cleaning of your home including dusting, vacuuming, mopping, and bathroom sanitizing.',
            category: 'Residential',
            price: 120,
            duration: 180, // minutes
            isActive: true,
            image: null,
            features: [
              'Dusting all accessible surfaces',
              'Vacuuming carpets and floors',
              'Mopping all hard floors',
              'Cleaning and sanitizing bathrooms',
              'Cleaning and sanitizing kitchen'
            ],
            customFields: [
              { id: 1, name: 'Number of Bedrooms', type: 'number', required: true },
              { id: 2, name: 'Number of Bathrooms', type: 'number', required: true },
              { id: 3, name: 'Pets in Home', type: 'select', required: false, options: ['None', 'Dogs', 'Cats', 'Other'] }
            ]
          },
          {
            id: 2,
            name: 'Deep Cleaning',
            description: 'An intensive cleaning service that covers hard-to-reach areas and tackles tough dirt and grime.',
            category: 'Residential',
            price: 250,
            duration: 300,
            isActive: true,
            image: null,
            features: [
              'All standard cleaning services',
              'Inside cabinet cleaning',
              'Inside oven and refrigerator cleaning',
              'Baseboards and door frames',
              'Window sills and tracks',
              'Light fixtures and ceiling fans'
            ],
            customFields: [
              { id: 1, name: 'Number of Bedrooms', type: 'number', required: true },
              { id: 2, name: 'Number of Bathrooms', type: 'number', required: true },
              { id: 3, name: 'Last Deep Cleaning', type: 'date', required: false }
            ]
          }
        ];
        
        setServices(mockServices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.duration || isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateNew = () => {
    setSelectedService(null);
    setIsEditing(true);
    setFormData({
      id: null,
      name: '',
      description: '',
      category: '',
      price: '',
      duration: '',
      isActive: true,
      image: null,
      features: [''],
      customFields: []
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleEditService = () => {
    setIsEditing(true);
    setFormData({
      ...selectedService,
      price: selectedService.price.toString(),
      duration: selectedService.duration.toString(),
      features: [...selectedService.features, '']
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    
    if (index === updatedFeatures.length - 1 && value.trim() !== '') {
      updatedFeatures.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      // Clean up features (remove empty ones)
      const cleanedFeatures = formData.features.filter(f => f.trim() !== '');
      
      // Prepare data for submission
      const serviceData = {
        ...formData,
        features: cleanedFeatures,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };
      
      // Simulate API call
      setTimeout(() => {
        if (serviceData.id) {
          // Update existing service
          setServices(prev => prev.map(s => s.id === serviceData.id ? serviceData : s));
          setSelectedService(serviceData);
        } else {
          // Create new service
          const newService = {
            ...serviceData,
            id: Date.now()
          };
          setServices(prev => [...prev, newService]);
          setSelectedService(newService);
        }
        
        setIsEditing(false);
        setLoading(false);
        setSuccessMessage(serviceData.id ? 'Service updated successfully!' : 'Service created successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setSuccessMessage('');
  };

  const handleDeleteService = () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setServices(prev => prev.filter(s => s.id !== selectedService.id));
        setSelectedService(null);
        setLoading(false);
        setSuccessMessage('Service deleted successfully!');
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1000);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="service-management">
      <div className="service-list-section">
        <div className="service-list-header">
          <h2>Services</h2>
          <div className="service-actions">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Specialized">Specialized</option>
            </select>
            <button className="add-service-btn" onClick={handleCreateNew}>
              Add New Service
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="no-results">No services found</div>
        ) : (
          <div className="service-list">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service)}
              >
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p className="service-category">{service.category}</p>
                  <p className="service-price">${service.price}</p>
                </div>
                <div className="service-status">
                  <span className={`status-badge ${service.isActive ? 'status-active' : 'status-inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="service-details-section">
        {!selectedService && !isEditing ? (
          <div className="no-selection-message">
            Select a service to view details or create a new one
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="service-form">
            <div className="form-header">
              <h2>{formData.id ? 'Edit Service' : 'New Service'}</h2>
            </div>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Service Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select Category</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (USD) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={errors.price ? 'error' : ''}
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes) *</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="0"
                    className={errors.duration ? 'error' : ''}
                  />
                  {errors.duration && <span className="error-message">{errors.duration}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className={errors.description ? 'error' : ''}
                  ></textarea>
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Service is active
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Service Features</h3>
              {formData.features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Enter a feature"
                  />
                  {index !== formData.features.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="remove-feature-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="service-details-header">
              <h2>{selectedService.name}</h2>
              <div className="header-actions">
                <button className="edit-button" onClick={handleEditService}>
                  Edit Service
                </button>
                <button className="delete-button" onClick={handleDeleteService}>
                  Delete Service
                </button>
              </div>
            </div>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <div className="service-details-content">
              <div className="service-info-section">
                <div className="service-info-row">
                  <div className="info-label">Category:</div>
                  <div className="info-value">{selectedService.category}</div>
                </div>
                <div className="service-info-row">
                  <div className="info-label">Price:</div>
                  <div className="info-value">${selectedService.price}</div>
                </div>
                <div className="service-info-row">
                  <div className="info-label">Duration:</div>
                  <div className="info-value">
                    {Math.floor(selectedService.duration / 60)}h {selectedService.duration % 60}m
                  </div>
                </div>
                <div className="service-info-row">
                  <div className="info-label">Status:</div>
                  <div className="info-value">
                    <span className={`status-badge ${selectedService.isActive ? 'status-active' : 'status-inactive'}`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="service-description-section">
                <h3>Description</h3>
                <p>{selectedService.description}</p>
              </div>
              
              <div className="service-features-section">
                <h3>Features</h3>
                <ul className="features-list">
                  {selectedService.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="service-custom-fields-section">
                <h3>Custom Fields</h3>
                <div className="custom-fields-list">
                  {selectedService.customFields.map((field, index) => (
                    <div key={index} className="custom-field-item">
                      <div className="field-name">{field.name}</div>
                      <div className="field-type">{field.type}</div>
                      <div className="field-required">{field.required ? 'Required' : 'Optional'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement; 