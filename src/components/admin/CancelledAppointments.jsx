import React, { useState, useEffect } from 'react';
import './CancelledAppointments.css';

const CancelledAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30');
  const [cancelReason, setCancelReason] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCancelled: 0,
    lostRevenue: 0,
    clientCancellations: 0,
    businessCancellations: 0
  });

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
            clientName: 'Sarah Johnson',
            clientEmail: 'sarah.j@example.com',
            clientPhone: '2105557890',
            date: '2025-03-18',
            timeSlot: '10:00 AM',
            duration: '2 hours',
            address: '8901 Broadway St, San Antonio, TX 78215',
            serviceType: 'Standard Cleaning',
            status: 'cancelled',
            price: 280.00,
            assignedTo: 'Unassigned',
            cancelledBy: 'client',
            cancellationReason: 'Schedule conflict',
            cancellationNotes: 'Client had a last-minute work emergency and needs to reschedule.',
            refundStatus: 'full',
            refundAmount: 280.00,
            cancelledAt: '2025-03-16T14:30:00'
          },
          {
            id: 2,
            clientName: 'Thomas Wilson',
            clientEmail: 'thomas.w@example.com',
            clientPhone: '2105551122',
            date: '2025-03-12',
            timeSlot: '1:00 PM',
            duration: '3 hours',
            address: '5432 Medical Dr, San Antonio, TX 78229',
            serviceType: 'Deep Cleaning',
            status: 'cancelled',
            price: 450.00,
            assignedTo: 'Maria Garcia',
            cancelledBy: 'business',
            cancellationReason: 'Staff unavailable',
            cancellationNotes: 'Assigned cleaner called in sick, no other staff available for this time slot.',
            refundStatus: 'full',
            refundAmount: 450.00,
            cancelledAt: '2025-03-11T09:15:00'
          },
          {
            id: 3,
            clientName: 'Amanda Garcia',
            clientEmail: 'amanda.g@example.com',
            clientPhone: '2105557788',
            date: '2025-03-05',
            timeSlot: '9:00 AM',
            duration: '2 hours',
            address: '1234 Vance Jackson Rd, San Antonio, TX 78213',
            serviceType: 'Standard Cleaning',
            status: 'cancelled',
            price: 325.00,
            assignedTo: 'John Smith',
            cancelledBy: 'client',
            cancellationReason: 'No longer needed',
            cancellationNotes: 'Client decided to handle cleaning themselves.',
            refundStatus: 'partial',
            refundAmount: 162.50,
            cancelledAt: '2025-03-03T16:45:00'
          },
          {
            id: 4,
            clientName: 'Michael Brown',
            clientEmail: 'michael.b@example.com',
            clientPhone: '2105559900',
            date: '2025-02-28',
            timeSlot: '2:00 PM',
            duration: '4 hours',
            address: '5678 Fredericksburg Rd, San Antonio, TX 78240',
            serviceType: 'Move-out Cleaning',
            status: 'cancelled',
            price: 575.00,
            assignedTo: 'Lisa Williams',
            cancelledBy: 'client',
            cancellationReason: 'Moving date changed',
            cancellationNotes: 'Client\'s closing date was pushed back by two weeks.',
            refundStatus: 'none',
            refundAmount: 0.00,
            cancelledAt: '2025-02-26T11:20:00'
          },
          {
            id: 5,
            clientName: 'Jessica Martinez',
            clientEmail: 'jessica.m@example.com',
            clientPhone: '2105553344',
            date: '2025-02-20',
            timeSlot: '11:00 AM',
            duration: '3 hours',
            address: '7890 Callaghan Rd, San Antonio, TX 78229',
            serviceType: 'Deep Cleaning',
            status: 'cancelled',
            price: 425.00,
            assignedTo: 'David Johnson',
            cancelledBy: 'business',
            cancellationReason: 'Weather conditions',
            cancellationNotes: 'Severe weather warning issued for the area. Rescheduled for safety reasons.',
            refundStatus: 'full',
            refundAmount: 425.00,
            cancelledAt: '2025-02-19T18:00:00'
          }
        ];
        
        setAppointments(mockAppointments);
        
        // Calculate stats
        const totalCancelled = mockAppointments.length;
        const lostRevenue = mockAppointments.reduce((sum, appointment) => sum + appointment.price, 0);
        const clientCancellations = mockAppointments.filter(appointment => appointment.cancelledBy === 'client').length;
        const businessCancellations = mockAppointments.filter(appointment => appointment.cancelledBy === 'business').length;
        
        setStats({
          totalCancelled,
          lostRevenue,
          clientCancellations,
          businessCancellations
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Filter appointments based on date range, cancellation reason, and search query
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
    
    // Then filter by cancellation reason and search query
    return dateFiltered.filter(appointment => {
      const matchesReason = cancelReason === 'all' || 
                           (cancelReason === 'client' && appointment.cancelledBy === 'client') ||
                           (cancelReason === 'business' && appointment.cancelledBy === 'business');
      
      const matchesSearch = 
        appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.cancellationReason.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesReason && matchesSearch;
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
        case 'cancelledAt':
          comparison = new Date(a.cancelledAt) - new Date(b.cancelledAt);
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

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleCancelReasonChange = (e) => {
    setCancelReason(e.target.value);
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

  const getRefundStatusClass = (status) => {
    switch (status) {
      case 'full':
        return 'status-full';
      case 'partial':
        return 'status-partial';
      case 'none':
        return 'status-none';
      default:
        return '';
    }
  };

  const getCancelledByClass = (cancelledBy) => {
    return cancelledBy === 'client' ? 'cancelled-by-client' : 'cancelled-by-business';
  };

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;
    
    return (
      <div className={`appointment-details-panel ${isDetailsOpen ? 'open' : ''}`}>
        <div className="details-header">
          <h2>Cancelled Appointment Details</h2>
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
              <span className="detail-label">Price:</span>
              <span className="detail-value">${selectedAppointment.price.toFixed(2)}</span>
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
            <h3>Cancellation Details</h3>
            <div className="detail-row">
              <span className="detail-label">Cancelled By:</span>
              <span className="detail-value">
                <span className={`cancelled-by ${getCancelledByClass(selectedAppointment.cancelledBy)}`}>
                  {selectedAppointment.cancelledBy === 'client' ? 'Client' : 'Business'}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Cancelled At:</span>
              <span className="detail-value">{formatDateTime(selectedAppointment.cancelledAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reason:</span>
              <span className="detail-value">{selectedAppointment.cancellationReason}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Refund:</span>
              <span className="detail-value">
                <span className={`refund-status ${getRefundStatusClass(selectedAppointment.refundStatus)}`}>
                  {selectedAppointment.refundStatus === 'full' ? 'Full' : 
                   selectedAppointment.refundStatus === 'partial' ? 'Partial' : 'None'}
                </span>
                {selectedAppointment.refundAmount > 0 && ` ($${selectedAppointment.refundAmount.toFixed(2)})`}
              </span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Notes</h3>
            <div className="detail-notes">
              {selectedAppointment.cancellationNotes || 'No notes provided'}
            </div>
          </div>
        </div>
        
        <div className="details-actions">
          <button className="action-button reschedule-btn">Reschedule</button>
          <button className="action-button contact-btn">Contact Client</button>
          {selectedAppointment.refundStatus !== 'full' && (
            <button className="action-button refund-btn">Process Refund</button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-spinner">Loading cancelled appointments...</div>;
  }

  const sortedAppointments = getSortedAppointments();

  return (
    <div className="cancelled-appointments">
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
            
            <div className="cancel-reason-filter">
              <select value={cancelReason} onChange={handleCancelReasonChange}>
                <option value="all">All Cancellations</option>
                <option value="client">Client Cancellations</option>
                <option value="business">Business Cancellations</option>
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
          <div className="summary-value">{stats.totalCancelled}</div>
          <div className="summary-label">Total Cancelled</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            ${stats.lostRevenue.toFixed(2)}
          </div>
          <div className="summary-label">Lost Revenue</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {stats.clientCancellations}
          </div>
          <div className="summary-label">Client Cancellations</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {stats.businessCancellations}
          </div>
          <div className="summary-label">Business Cancellations</div>
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
              <th onClick={() => handleSort('price')} className={sortBy === 'price' ? `sorted-${sortOrder}` : ''}>
                Price
                {sortBy === 'price' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Cancelled By</th>
              <th onClick={() => handleSort('cancelledAt')} className={sortBy === 'cancelledAt' ? `sorted-${sortOrder}` : ''}>
                Cancelled At
                {sortBy === 'cancelledAt' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Refund</th>
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
                  <td>${appointment.price.toFixed(2)}</td>
                  <td>
                    <span className={`cancelled-by ${getCancelledByClass(appointment.cancelledBy)}`}>
                      {appointment.cancelledBy === 'client' ? 'Client' : 'Business'}
                    </span>
                  </td>
                  <td>{formatDateTime(appointment.cancelledAt)}</td>
                  <td>
                    <span className={`refund-status ${getRefundStatusClass(appointment.refundStatus)}`}>
                      {appointment.refundStatus === 'full' ? 'Full' : 
                       appointment.refundStatus === 'partial' ? 'Partial' : 'None'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn reschedule-btn" onClick={(e) => { e.stopPropagation(); }}>
                        🔄
                      </button>
                      <button className="action-btn contact-btn" onClick={(e) => { e.stopPropagation(); }}>
                        ✉️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">No cancelled appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderAppointmentDetails()}
    </div>
  );
};

export default CancelledAppointments; 