import React, { useState, useEffect } from 'react';
import './CompletedAppointments.css';

const CompletedAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState('last30');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchAppointments = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockAppointments = [
          {
            id: 1,
            clientName: 'Robert Chen',
            clientEmail: 'robert.c@example.com',
            clientPhone: '2105554321',
            date: '2025-03-15',
            timeSlot: '3:00 PM',
            duration: '2 hours',
            address: '1234 Huebner Rd, San Antonio, TX 78248',
            serviceType: 'Move-out Cleaning',
            status: 'completed',
            price: 650.00,
            assignedTo: 'Maria Garcia',
            rating: 5,
            feedback: 'Excellent service! The team was thorough and professional.',
            paymentStatus: 'paid',
            paymentMethod: 'Credit Card',
            completedAt: '2025-03-15T17:30:00'
          },
          {
            id: 2,
            clientName: 'Emily Wilson',
            clientEmail: 'emily.w@example.com',
            clientPhone: '2105558765',
            date: '2025-03-10',
            timeSlot: '9:00 AM',
            duration: '3 hours',
            address: '5678 Babcock Rd, San Antonio, TX 78240',
            serviceType: 'Deep Cleaning',
            status: 'completed',
            price: 495.00,
            assignedTo: 'John Smith',
            rating: 4,
            feedback: 'Good job overall. Missed a few spots in the bathroom.',
            paymentStatus: 'paid',
            paymentMethod: 'PayPal',
            completedAt: '2025-03-10T12:15:00'
          },
          {
            id: 3,
            clientName: 'Daniel Martinez',
            clientEmail: 'daniel.m@example.com',
            clientPhone: '2105553456',
            date: '2025-03-05',
            timeSlot: '1:00 PM',
            duration: '2 hours',
            address: '9012 Wurzbach Rd, San Antonio, TX 78240',
            serviceType: 'Standard Cleaning',
            status: 'completed',
            price: 320.00,
            assignedTo: 'Lisa Williams',
            rating: 5,
            feedback: 'Very satisfied with the cleaning. Will definitely book again!',
            paymentStatus: 'paid',
            paymentMethod: 'Credit Card',
            completedAt: '2025-03-05T15:10:00'
          },
          {
            id: 4,
            clientName: 'Jessica Thompson',
            clientEmail: 'jessica.t@example.com',
            clientPhone: '2105557890',
            date: '2025-02-28',
            timeSlot: '10:00 AM',
            duration: '4 hours',
            address: '3456 Medical Dr, San Antonio, TX 78229',
            serviceType: 'Deep Cleaning',
            status: 'completed',
            price: 580.00,
            assignedTo: 'David Johnson',
            rating: 3,
            feedback: 'Service was okay. Expected more attention to detail for the price.',
            paymentStatus: 'pending',
            paymentMethod: 'Invoice',
            completedAt: '2025-02-28T14:30:00'
          },
          {
            id: 5,
            clientName: 'Michael Rodriguez',
            clientEmail: 'michael.r@example.com',
            clientPhone: '2105551234',
            date: '2025-02-20',
            timeSlot: '2:00 PM',
            duration: '2 hours',
            address: '4567 Stone Oak Pkwy, San Antonio, TX 78258',
            serviceType: 'Standard Cleaning',
            status: 'completed',
            price: 380.00,
            assignedTo: 'Maria Garcia',
            rating: 5,
            feedback: 'Fantastic job! My house has never been cleaner.',
            paymentStatus: 'paid',
            paymentMethod: 'Credit Card',
            completedAt: '2025-02-20T16:15:00'
          }
        ];
        
        setAppointments(mockAppointments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Filter appointments based on payment status and search query
  const getFilteredAppointments = () => {
    // First filter by date range
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 60)); // already subtracted 30, so 60 more
    
    let dateFiltered = [...appointments];
    
    if (dateRange === 'last30') {
      dateFiltered = appointments.filter(appointment => 
        new Date(appointment.date) >= thirtyDaysAgo
      );
    } else if (dateRange === 'last90') {
      dateFiltered = appointments.filter(appointment => 
        new Date(appointment.date) >= ninetyDaysAgo
      );
    }
    
    // Then filter by payment status and search query
    return dateFiltered.filter(appointment => {
      const matchesFilter = filter === 'all' || appointment.paymentStatus === filter;
      const matchesSearch = 
        appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  };

  // Sort appointments
  const getSortedAppointments = () => {
    const filtered = getFilteredAppointments();
    
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'client':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'service':
          comparison = a.serviceType.localeCompare(b.serviceType);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateTimeString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString('en-US', options);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  };

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;
    
    return (
      <div className={`appointment-details-panel ${isDetailsOpen ? 'open' : ''}`}>
        <div className="details-header">
          <h2>Completed Appointment Details</h2>
          <button className="close-details-btn" onClick={handleCloseDetails}>×</button>
        </div>
        
        <div className="details-content">
          <div className="details-section">
            <h3>Client Information</h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedAppointment.clientName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{selectedAppointment.clientEmail}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{selectedAppointment.clientPhone}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Service Information</h3>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate(selectedAppointment.date)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{selectedAppointment.timeSlot}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{selectedAppointment.duration}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Service:</span>
              <span className="detail-value">{selectedAppointment.serviceType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Completed:</span>
              <span className="detail-value">{formatDateTime(selectedAppointment.completedAt)}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Location</h3>
            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{selectedAppointment.address}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Assignment</h3>
            <div className="detail-row">
              <span className="detail-label">Assigned To:</span>
              <span className="detail-value">{selectedAppointment.assignedTo}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Billing</h3>
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">${selectedAppointment.price.toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment:</span>
              <span className="detail-value">
                <span className={`payment-status ${getPaymentStatusClass(selectedAppointment.paymentStatus)}`}>
                  {selectedAppointment.paymentStatus.charAt(0).toUpperCase() + selectedAppointment.paymentStatus.slice(1)}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Method:</span>
              <span className="detail-value">{selectedAppointment.paymentMethod}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Client Feedback</h3>
            <div className="detail-row">
              <span className="detail-label">Rating:</span>
              <span className="detail-value">{renderStarRating(selectedAppointment.rating)}</span>
            </div>
            <div className="detail-notes">
              {selectedAppointment.feedback || 'No feedback provided'}
            </div>
          </div>
        </div>
        
        <div className="details-actions">
          <button className="action-button invoice-btn">View Invoice</button>
          <button className="action-button feedback-btn">Send Feedback Request</button>
          {selectedAppointment.paymentStatus === 'pending' && (
            <button className="action-button payment-btn">Record Payment</button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-spinner">Loading completed appointments...</div>;
  }

  const sortedAppointments = getSortedAppointments();

  return (
    <div className="completed-appointments">
      <div className="appointments-controls">
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="filter-group">
            <div className="date-range-filter">
              <select value={dateRange} onChange={handleDateRangeChange}>
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
              </select>
            </div>
            
            <div className="payment-filter">
              <select value={filter} onChange={handleFilterChange}>
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="action-controls">
          <button className="export-btn">Export Data</button>
        </div>
      </div>
      
      <div className="appointments-summary">
        <div className="summary-card">
          <div className="summary-value">{appointments.length}</div>
          <div className="summary-label">Total Completed</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            ${appointments.reduce((sum, appointment) => sum + appointment.price, 0).toFixed(2)}
          </div>
          <div className="summary-label">Total Revenue</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {(appointments.reduce((sum, appointment) => sum + appointment.rating, 0) / appointments.length).toFixed(1)}
          </div>
          <div className="summary-label">Avg. Rating</div>
        </div>
      </div>
      
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className={sortBy === 'date' ? `sorted-${sortOrder}` : ''}>
                Date
                {sortBy === 'date' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSort('client')} className={sortBy === 'client' ? `sorted-${sortOrder}` : ''}>
                Client
                {sortBy === 'client' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th onClick={() => handleSort('service')} className={sortBy === 'service' ? `sorted-${sortOrder}` : ''}>
                Service
                {sortBy === 'service' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Assigned To</th>
              <th onClick={() => handleSort('price')} className={sortBy === 'price' ? `sorted-${sortOrder}` : ''}>
                Price
                {sortBy === 'price' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Payment</th>
              <th onClick={() => handleSort('rating')} className={sortBy === 'rating' ? `sorted-${sortOrder}` : ''}>
                Rating
                {sortBy === 'rating' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map(appointment => (
                <tr 
                  key={appointment.id} 
                  onClick={() => handleAppointmentClick(appointment)}
                  className={selectedAppointment?.id === appointment.id ? 'selected' : ''}
                >
                  <td>
                    <div className="appointment-date">{formatDate(appointment.date)}</div>
                    <div className="appointment-time">{appointment.timeSlot}</div>
                  </td>
                  <td>{appointment.clientName}</td>
                  <td>{appointment.serviceType}</td>
                  <td>{appointment.assignedTo}</td>
                  <td>${appointment.price.toFixed(2)}</td>
                  <td>
                    <span className={`payment-status ${getPaymentStatusClass(appointment.paymentStatus)}`}>
                      {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td>{renderStarRating(appointment.rating)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn invoice-btn" onClick={(e) => { e.stopPropagation(); }}>
                        📄
                      </button>
                      {appointment.paymentStatus === 'pending' && (
                        <button className="action-btn payment-btn" onClick={(e) => { e.stopPropagation(); }}>
                          💰
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">No completed appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderAppointmentDetails()}
    </div>
  );
};

export default CompletedAppointments; 