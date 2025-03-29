import React, { useState, useEffect } from 'react';
import './UpcomingAppointments.css';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
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
            clientName: 'Maume Ayeni',
            clientEmail: 'mobolami@gmail.com',
            clientPhone: '2019253265',
            date: '2025-03-31',
            timeSlot: '3:30 PM',
            duration: '2 hours',
            address: '12406 Revolver Run, San Antonio, TX 78254',
            serviceType: 'Standard Cleaning',
            status: 'confirmed',
            price: 397.29,
            assignedTo: 'Maria Garcia',
            notes: 'Monthly recurring service. No pets.',
            created: '2025-03-15'
          },
          {
            id: 2,
            clientName: 'Ayo Agboola',
            clientEmail: 'ibukunagboola300@gmail.com',
            clientPhone: '2108120033',
            date: '2025-04-07',
            timeSlot: '11:00 AM',
            duration: '3 hours',
            address: '14724 Snowy Egret Fall, San Antonio, TX 78253',
            serviceType: 'Standard Cleaning',
            status: 'pending',
            price: 453.60,
            assignedTo: null,
            notes: 'Has pets. Bi-weekly service.',
            created: '2025-03-20'
          },
          {
            id: 3,
            clientName: 'Sarah Johnson',
            clientEmail: 'sarah.j@example.com',
            clientPhone: '2105557890',
            date: '2025-04-02',
            timeSlot: '9:00 AM',
            duration: '4 hours',
            address: '8901 Broadway St, San Antonio, TX 78215',
            serviceType: 'Deep Cleaning',
            status: 'confirmed',
            price: 550.00,
            assignedTo: 'John Smith',
            notes: 'First-time customer. Needs special attention to kitchen.',
            created: '2025-03-18'
          },
          {
            id: 4,
            clientName: 'Michael Rodriguez',
            clientEmail: 'mrodriguez@example.com',
            clientPhone: '2105551234',
            date: '2025-04-05',
            timeSlot: '1:00 PM',
            duration: '2 hours',
            address: '4567 Stone Oak Pkwy, San Antonio, TX 78258',
            serviceType: 'Standard Cleaning',
            status: 'rescheduled',
            price: 320.00,
            assignedTo: 'Lisa Williams',
            notes: 'Rescheduled from March 29. Has security system.',
            created: '2025-03-10'
          },
          {
            id: 5,
            clientName: 'Jennifer Lee',
            clientEmail: 'jlee@example.com',
            clientPhone: '2105559876',
            date: '2025-04-10',
            timeSlot: '10:00 AM',
            duration: '3 hours',
            address: '7890 Culebra Rd, San Antonio, TX 78251',
            serviceType: 'Move-out Cleaning',
            status: 'confirmed',
            price: 480.00,
            assignedTo: 'David Johnson',
            notes: 'Moving out on April 15. Needs carpet cleaning.',
            created: '2025-03-22'
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

  // Filter appointments based on status and search query
  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = 
      appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date + ' ' + a.timeSlot) - new Date(b.date + ' ' + b.timeSlot);
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
      default:
        comparison = new Date(a.date) - new Date(b.date);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'rescheduled':
        return 'status-rescheduled';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;
    
    return (
      <div className={`appointment-details-panel ${isDetailsOpen ? 'open' : ''}`}>
        <div className="details-header">
          <h2>Appointment Details</h2>
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
            <h3>Appointment Information</h3>
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
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-badge ${getStatusClass(selectedAppointment.status)}`}>
                {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
              </span>
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
              <span className="detail-value">
                {selectedAppointment.assignedTo || 'Not assigned'}
              </span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Billing</h3>
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">${selectedAppointment.price.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Notes</h3>
            <div className="detail-notes">
              {selectedAppointment.notes || 'No notes available'}
            </div>
          </div>
        </div>
        
        <div className="details-actions">
          <button className="action-button edit-btn">Edit Appointment</button>
          <button className="action-button reschedule-btn">Reschedule</button>
          <button className="action-button cancel-btn">Cancel Appointment</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-spinner">Loading appointments...</div>;
  }

  return (
    <div className="upcoming-appointments">
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
          
          <div className="status-filter">
            <select value={filter} onChange={handleFilterChange}>
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="action-controls">
          <button className="new-appointment-btn">+ New Appointment</button>
        </div>
      </div>
      
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} className={sortBy === 'date' ? `sorted-${sortOrder}` : ''}>
                Date & Time
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
              <th>Location</th>
              <th>Status</th>
              <th onClick={() => handleSort('price')} className={sortBy === 'price' ? `sorted-${sortOrder}` : ''}>
                Price
                {sortBy === 'price' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </th>
              <th>Assigned To</th>
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
                  <td className="address-cell">{appointment.address}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </td>
                  <td>${appointment.price.toFixed(2)}</td>
                  <td>{appointment.assignedTo || 'Unassigned'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" onClick={(e) => { e.stopPropagation(); }}>
                        ✏️
                      </button>
                      <button className="action-btn cancel-btn" onClick={(e) => { e.stopPropagation(); }}>
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderAppointmentDetails()}
    </div>
  );
};

export default UpcomingAppointments; 