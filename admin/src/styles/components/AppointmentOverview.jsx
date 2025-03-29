import React, { useState, useEffect } from 'react';
import './AppointmentOverview.css';

const AppointmentOverview = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    unassignedAppointments: 0,
    totalClients: 0,
    activeClients: 0,
    totalContractors: 0,
    activeContractors: 0,
    revenue: {
      current: 0,
      previous: 0,
      change: 0
    }
  });
  
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data (mock data for now)
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchDashboardData = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock stats data
        const mockStats = {
          totalAppointments: 48,
          upcomingAppointments: 12,
          completedAppointments: 32,
          unassignedAppointments: 4,
          totalClients: 24,
          activeClients: 18,
          totalContractors: 6,
          activeContractors: 4,
          revenue: {
            current: 8750,
            previous: 7200,
            change: 21.53
          }
        };
        
        // Mock recent appointments data
        const mockRecentAppointments = [
          {
            id: 1,
            clientName: 'Maume Ayeni',
            date: '2024-11-15',
            timeSlot: '10:00 AM - 12:00 PM',
            serviceType: 'Standard Cleaning',
            status: 'scheduled',
            assignedTo: 'Maria Garcia',
            price: 397.29
          },
          {
            id: 2,
            clientName: 'Ayo Agboola',
            date: '2024-10-24',
            timeSlot: '1:00 PM - 3:00 PM',
            serviceType: 'Standard Cleaning',
            status: 'scheduled',
            assignedTo: 'John Smith',
            price: 453.60
          },
          {
            id: 3,
            clientName: 'Sarah Johnson',
            date: '2024-10-19',
            timeSlot: '9:00 AM - 11:00 AM',
            serviceType: 'Deep Cleaning',
            status: 'scheduled',
            assignedTo: 'David Johnson',
            price: 520.00
          },
          {
            id: 4,
            clientName: 'Michael Rodriguez',
            date: '2024-10-28',
            timeSlot: '2:00 PM - 4:00 PM',
            serviceType: 'Standard Cleaning',
            status: 'unassigned',
            assignedTo: null,
            price: 380.00
          },
          {
            id: 5,
            clientName: 'Jennifer Lee',
            date: '2024-10-15',
            timeSlot: '11:00 AM - 1:00 PM',
            serviceType: 'Standard Cleaning',
            status: 'completed',
            assignedTo: 'Lisa Williams',
            price: 275.50
          }
        ];
        
        setStats(mockStats);
        setRecentAppointments(mockRecentAppointments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="appointment-overview">
      {loading ? (
        <div className="loading-message">Loading dashboard data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon appointments-icon">📅</div>
              <div className="stat-content">
                <div className="stat-title">Appointments</div>
                <div className="stat-value">{stats.totalAppointments}</div>
                <div className="stat-details">
                  <span className="stat-detail">
                    <span className="detail-label">Upcoming:</span>
                    <span className="detail-value">{stats.upcomingAppointments}</span>
                  </span>
                  <span className="stat-detail">
                    <span className="detail-label">Unassigned:</span>
                    <span className="detail-value">{stats.unassignedAppointments}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon clients-icon">👥</div>
              <div className="stat-content">
                <div className="stat-title">Clients</div>
                <div className="stat-value">{stats.totalClients}</div>
                <div className="stat-details">
                  <span className="stat-detail">
                    <span className="detail-label">Active:</span>
                    <span className="detail-value">{stats.activeClients}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon contractors-icon">👷</div>
              <div className="stat-content">
                <div className="stat-title">Contractors</div>
                <div className="stat-value">{stats.totalContractors}</div>
                <div className="stat-details">
                  <span className="stat-detail">
                    <span className="detail-label">Active:</span>
                    <span className="detail-value">{stats.activeContractors}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon revenue-icon">💰</div>
              <div className="stat-content">
                <div className="stat-title">Monthly Revenue</div>
                <div className="stat-value">{formatCurrency(stats.revenue.current)}</div>
                <div className="stat-details">
                  <span className={`stat-change ${stats.revenue.change >= 0 ? 'positive' : 'negative'}`}>
                    {stats.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue.change)}%
                  </span>
                  <span className="stat-period">vs last month</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="recent-appointments">
            <h3>Recent Appointments</h3>
            <div className="appointments-table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Service</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.clientName}</td>
                      <td>{formatDate(appointment.date)}</td>
                      <td>{appointment.timeSlot}</td>
                      <td>{appointment.serviceType}</td>
                      <td>
                        {appointment.assignedTo || (
                          <span className="unassigned">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatCurrency(appointment.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-button">
                <span className="action-icon">➕</span>
                <span className="action-text">New Appointment</span>
              </button>
              <button className="action-button">
                <span className="action-icon">👤</span>
                <span className="action-text">Add Client</span>
              </button>
              <button className="action-button">
                <span className="action-icon">📋</span>
                <span className="action-text">Generate Report</span>
              </button>
              <button className="action-button">
                <span className="action-icon">📧</span>
                <span className="action-text">Send Reminders</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentOverview; 