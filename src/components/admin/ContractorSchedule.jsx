import React, { useState, useEffect } from 'react';
import './ContractorSchedule.css';

const ContractorSchedule = () => {
  const [contractors, setContractors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    appointmentId: '',
    contractorId: '',
    notes: ''
  });
  // Add state for active tab
  const [activeTab, setActiveTab] = useState('calendar');

  // Fetch contractors and appointments data (mock data for now)
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchData = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock contractors data
        const mockContractors = [
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '2105551234',
            specialties: ['Standard Cleaning', 'Deep Cleaning'],
            rating: 4.8,
            hireDate: '2023-05-15',
            status: 'active'
          },
          {
            id: 2,
            name: 'Maria Garcia',
            email: 'maria.garcia@example.com',
            phone: '2105555678',
            specialties: ['Standard Cleaning', 'Move-in/Move-out'],
            rating: 4.9,
            hireDate: '2023-02-10',
            status: 'active'
          },
          {
            id: 3,
            name: 'David Johnson',
            email: 'david.johnson@example.com',
            phone: '2105559012',
            specialties: ['Deep Cleaning', 'Commercial Cleaning'],
            rating: 4.7,
            hireDate: '2023-08-22',
            status: 'active'
          },
          {
            id: 4,
            name: 'Lisa Williams',
            email: 'lisa.williams@example.com',
            phone: '2105553456',
            specialties: ['Standard Cleaning', 'Deep Cleaning', 'Commercial Cleaning'],
            rating: 4.6,
            hireDate: '2023-11-05',
            status: 'active'
          }
        ];
        
        // Mock appointments data
        const mockAppointments = [
          {
            id: 1,
            clientName: 'Maume Ayeni',
            clientId: 1,
            date: '2024-11-15',
            timeSlot: '10:00 AM - 12:00 PM',
            serviceType: 'Standard Cleaning',
            address: '12406 Revolver Run, San Antonio, TX 78254',
            status: 'scheduled',
            assignedTo: 2,
            notes: 'Has a dog. Prefers eco-friendly products.'
          },
          {
            id: 2,
            clientName: 'Ayo Agboola',
            clientId: 2,
            date: '2024-10-24',
            timeSlot: '1:00 PM - 3:00 PM',
            serviceType: 'Standard Cleaning',
            address: '14724 Snowy Egret Fall, San Antonio, TX 78253',
            status: 'scheduled',
            assignedTo: 1,
            notes: 'Has cats. Allergic to strong fragrances.'
          },
          {
            id: 3,
            clientName: 'Sarah Johnson',
            clientId: 3,
            date: '2024-10-19',
            timeSlot: '9:00 AM - 11:00 AM',
            serviceType: 'Deep Cleaning',
            address: '8901 Broadway St, San Antonio, TX 78215',
            status: 'scheduled',
            assignedTo: 3,
            notes: 'Prefers service in the morning.'
          },
          {
            id: 4,
            clientName: 'Michael Rodriguez',
            clientId: 4,
            date: '2024-10-28',
            timeSlot: '2:00 PM - 4:00 PM',
            serviceType: 'Standard Cleaning',
            address: '4567 Stone Oak Pkwy, San Antonio, TX 78258',
            status: 'unassigned',
            assignedTo: null,
            notes: 'Has security system. Call before arrival.'
          }
        ];
        
        setContractors(mockContractors);
        setAppointments(mockAppointments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({
        date: day,
        day: day.getDate(),
        month: day.getMonth(),
        year: day.getFullYear(),
        isCurrentMonth: false,
        hasAppointments: appointmentsOnDate(day).length > 0
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push({
        date: day,
        day: i,
        month,
        year,
        isCurrentMonth: true,
        hasAppointments: appointmentsOnDate(day).length > 0
      });
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({
        date: day,
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        hasAppointments: appointmentsOnDate(day).length > 0
      });
    }
    
    setCalendarDays(days);
  }, [currentMonth, appointments]);

  // Helper function to get appointments on a specific date
  const appointmentsOnDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === dateString);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Render month name and year
  const renderMonthYear = () => {
    const options = { month: 'long', year: 'numeric' };
    return currentMonth.toLocaleDateString('en-US', options);
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    const newDate = new Date(day.year, day.month, day.day);
    setSelectedDate(newDate);
    setSelectedContractor(null);
  };

  // Handle contractor selection
  const handleContractorSelect = (contractor) => {
    setSelectedContractor(contractor);
  };

  // Get appointments for selected date
  const getAppointmentsForDate = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === dateString);
  };

  // Get appointments for selected contractor
  const getAppointmentsForContractor = (contractorId) => {
    return appointments.filter(appointment => appointment.assignedTo === contractorId);
  };

  // Handle assignment modal open
  const handleAssignOpen = (appointmentId) => {
    setIsAssigning(true);
    setAssignmentData({
      appointmentId,
      contractorId: '',
      notes: ''
    });
  };

  // Handle assignment form change
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData({
      ...assignmentData,
      [name]: value
    });
  };

  // Handle assignment form submit
  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    
    // In a real application, this would be an API call
    // For now, we'll update the state directly
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === parseInt(assignmentData.appointmentId)) {
        return {
          ...appointment,
          assignedTo: parseInt(assignmentData.contractorId),
          notes: assignmentData.notes || appointment.notes,
          status: 'scheduled'
        };
      }
      return appointment;
    });
    
    setAppointments(updatedAppointments);
    setIsAssigning(false);
  };

  // Render the calendar view
  const renderCalendarView = () => {
    return (
      <div className="contractor-calendar-view">
        <div className="calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <h3>{renderMonthYear()}</h3>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-day-header">Sun</div>
          <div className="calendar-day-header">Mon</div>
          <div className="calendar-day-header">Tue</div>
          <div className="calendar-day-header">Wed</div>
          <div className="calendar-day-header">Thu</div>
          <div className="calendar-day-header">Fri</div>
          <div className="calendar-day-header">Sat</div>
          
          {calendarDays.map((day, index) => (
            <div 
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.hasAppointments ? 'has-appointments' : ''} ${
                day.day === selectedDate.getDate() && 
                day.month === selectedDate.getMonth() && 
                day.year === selectedDate.getFullYear() ? 'selected' : ''
              }`}
              onClick={() => handleDateSelect(day)}
            >
              <span className="day-number">{day.day}</span>
              {day.hasAppointments && <span className="appointment-indicator">•</span>}
            </div>
          ))}
        </div>
        
        <div className="selected-date-info">
          <h3>{formatDate(selectedDate)}</h3>
          <div className="date-appointments">
            {getAppointmentsForDate().length > 0 ? (
              getAppointmentsForDate().map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <h4>{appointment.clientName}</h4>
                    <span className={`appointment-status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Time:</strong> {appointment.timeSlot}</p>
                    <p><strong>Service:</strong> {appointment.serviceType}</p>
                    <p><strong>Address:</strong> {appointment.address}</p>
                    <p><strong>Assigned to:</strong> {
                      appointment.assignedTo 
                        ? contractors.find(c => c.id === appointment.assignedTo)?.name || 'Unknown'
                        : 'Unassigned'
                    }</p>
                    {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                  </div>
                  <div className="appointment-actions">
                    {!appointment.assignedTo && (
                      <button 
                        className="assign-button"
                        onClick={() => handleAssignOpen(appointment.id)}
                      >
                        Assign Contractor
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-appointments">No appointments scheduled for this date.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the contractor list view
  const renderContractorListView = () => {
    return (
      <div className="contractor-list-view">
        <div className="contractor-list">
          {contractors.map(contractor => (
            <div 
              key={contractor.id}
              className={`contractor-card ${selectedContractor?.id === contractor.id ? 'selected' : ''}`}
              onClick={() => handleContractorSelect(contractor)}
            >
              <div className="contractor-header">
                <h3>{contractor.name}</h3>
                <span className={`contractor-status ${contractor.status}`}>
                  {contractor.status}
                </span>
              </div>
              <div className="contractor-details">
                <p><strong>Email:</strong> {contractor.email}</p>
                <p><strong>Phone:</strong> {contractor.phone}</p>
                <p><strong>Specialties:</strong> {contractor.specialties.join(', ')}</p>
                <p><strong>Rating:</strong> {contractor.rating} / 5</p>
                <p><strong>Hire Date:</strong> {new Date(contractor.hireDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
        
        {selectedContractor && (
          <div className="contractor-schedule">
            <h3>Upcoming Appointments for {selectedContractor.name}</h3>
            <div className="contractor-appointments">
              {getAppointmentsForContractor(selectedContractor.id).length > 0 ? (
                getAppointmentsForContractor(selectedContractor.id).map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <h4>{appointment.clientName}</h4>
                      <span className={`appointment-status ${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {appointment.timeSlot}</p>
                      <p><strong>Service:</strong> {appointment.serviceType}</p>
                      <p><strong>Address:</strong> {appointment.address}</p>
                      {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-appointments">No appointments scheduled for this contractor.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the team management view
  const renderTeamManagementView = () => {
    return (
      <div className="team-management-view">
        <div className="team-management-header">
          <h3>Team Management</h3>
          <button className="add-contractor-button">Add New Contractor</button>
        </div>
        
        <div className="team-management-grid">
          {contractors.map(contractor => (
            <div key={contractor.id} className="team-member-card">
              <div className="team-member-header">
                <h4>{contractor.name}</h4>
                <span className={`contractor-status ${contractor.status}`}>
                  {contractor.status}
                </span>
              </div>
              <div className="team-member-details">
                <p><strong>Email:</strong> {contractor.email}</p>
                <p><strong>Phone:</strong> {contractor.phone}</p>
                <p><strong>Specialties:</strong> {contractor.specialties.join(', ')}</p>
                <p><strong>Rating:</strong> {contractor.rating} / 5</p>
                <p><strong>Hire Date:</strong> {new Date(contractor.hireDate).toLocaleDateString()}</p>
              </div>
              <div className="team-member-actions">
                <button className="edit-button">Edit</button>
                <button className="schedule-button">View Schedule</button>
                <button className="status-button">
                  {contractor.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the performance metrics view
  const renderPerformanceView = () => {
    return (
      <div className="performance-metrics-view">
        <div className="performance-header">
          <h3>Contractor Performance Metrics</h3>
          <div className="performance-filters">
            <select className="time-period-filter">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        
        <div className="performance-metrics-grid">
          {contractors.map(contractor => (
            <div key={contractor.id} className="performance-card">
              <div className="performance-header">
                <h4>{contractor.name}</h4>
              </div>
              <div className="performance-stats">
                <div className="stat-item">
                  <span className="stat-label">Appointments Completed</span>
                  <span className="stat-value">{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">On-Time Rate</span>
                  <span className="stat-value">{(Math.random() * 10 + 90).toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Client Satisfaction</span>
                  <span className="stat-value">{contractor.rating} / 5</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Efficiency Score</span>
                  <span className="stat-value">{(Math.random() * 20 + 80).toFixed(1)}%</span>
                </div>
              </div>
              <div className="performance-actions">
                <button className="view-details-button">View Detailed Report</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the assignment modal
  const renderAssignmentModal = () => {
    if (!isAssigning) return null;
    
    const appointment = appointments.find(a => a.id === parseInt(assignmentData.appointmentId));
    
    return (
      <div className="modal-overlay">
        <div className="assignment-modal">
          <h3>Assign Contractor</h3>
          <div className="appointment-summary">
            <p><strong>Client:</strong> {appointment?.clientName}</p>
            <p><strong>Date:</strong> {appointment ? new Date(appointment.date).toLocaleDateString() : ''}</p>
            <p><strong>Time:</strong> {appointment?.timeSlot}</p>
            <p><strong>Service:</strong> {appointment?.serviceType}</p>
          </div>
          <form onSubmit={handleAssignmentSubmit}>
            <div className="form-group">
              <label htmlFor="contractorId">Select Contractor:</label>
              <select 
                id="contractorId"
                name="contractorId"
                value={assignmentData.contractorId}
                onChange={handleAssignmentChange}
                required
              >
                <option value="">-- Select a Contractor --</option>
                {contractors.map(contractor => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name} - {contractor.specialties.join(', ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Additional Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={assignmentData.notes}
                onChange={handleAssignmentChange}
                placeholder="Add any special instructions or notes for the contractor..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setIsAssigning(false)}>Cancel</button>
              <button type="submit" className="submit-button">Assign</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return renderCalendarView();
      case 'contractors':
        return renderContractorListView();
      case 'team':
        return renderTeamManagementView();
      case 'performance':
        return renderPerformanceView();
      default:
        return renderCalendarView();
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="contractor-schedule-container">
      {/* Tabs navigation */}
      <div className="contractor-tabs">
        <button 
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <span className="tab-icon">📅</span> Calendar View
        </button>
        <button 
          className={`tab-button ${activeTab === 'contractors' ? 'active' : ''}`}
          onClick={() => setActiveTab('contractors')}
        >
          <span className="tab-icon">👷</span> Contractor List
        </button>
        <button 
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <span className="tab-icon">👥</span> Team Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <span className="tab-icon">📊</span> Performance Metrics
        </button>
      </div>
      
      {/* Tab content */}
      <div className="contractor-tab-content">
        {renderTabContent()}
      </div>
      
      {/* Assignment modal */}
      {renderAssignmentModal()}
    </div>
  );
};

export default ContractorSchedule; 