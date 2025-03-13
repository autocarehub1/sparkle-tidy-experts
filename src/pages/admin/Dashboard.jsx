import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ClientManagement from '../../components/admin/ClientManagement';
import ContractorSchedule from '../../components/admin/ContractorSchedule';
import AppointmentOverview from '../../components/admin/AppointmentOverview';
import UpcomingAppointments from '../../components/admin/UpcomingAppointments';
import CompletedAppointments from '../../components/admin/CompletedAppointments';
import CancelledAppointments from '../../components/admin/CancelledAppointments';
import ServiceManagement from '../../components/admin/ServiceManagement';
import ContractorManagement from '../../components/admin/ContractorManagement';
import ContractorPerformance from '../../components/admin/ContractorPerformance';
import CompanySettings from '../../components/admin/CompanySettings';
import NotificationSettings from '../../components/admin/NotificationSettings';
import FinancialReports from '../../components/admin/FinancialReports';
import BusinessAnalytics from '../../components/admin/BusinessAnalytics';
import NewClientRegistration from '../../components/admin/NewClientRegistration';

const PlaceholderComponent = ({ title }) => {
  return (
    <div className="placeholder-component">
      <div className="placeholder-content">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" 
          alt="Coming Soon" 
          className="placeholder-image"
        />
        <h2>{title}</h2>
        <p>This feature is coming soon. Stay tuned for updates!</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, this would clear auth tokens, etc.
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AppointmentOverview />;
      case 'upcoming':
        return <UpcomingAppointments />;
      case 'completed':
        return <CompletedAppointments />;
      case 'cancelled':
        return <CancelledAppointments />;
      case 'clients':
        return <ClientManagement />;
      case 'new-client':
        return <NewClientRegistration />;
      case 'contractors':
        return <ContractorManagement />;
      case 'schedule':
        return <ContractorSchedule />;
      case 'performance':
        return <ContractorPerformance />;
      case 'company':
        return <CompanySettings />;
      case 'services':
        return <ServiceManagement />;
      case 'notifications':
        return <NotificationSettings />;
      case 'financial':
        return <FinancialReports />;
      case 'analytics':
        return <BusinessAnalytics />;
      default:
        return <AppointmentOverview />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'upcoming':
        return 'Upcoming Appointments';
      case 'completed':
        return 'Completed Appointments';
      case 'cancelled':
        return 'Cancelled Appointments';
      case 'clients':
        return 'Client Management';
      case 'new-client':
        return 'New Client Registration';
      case 'contractors':
        return 'Contractor Management';
      case 'schedule':
        return 'Contractor Schedule';
      case 'performance':
        return 'Contractor Performance';
      case 'company':
        return 'Company Settings';
      case 'services':
        return 'Service Management';
      case 'notifications':
        return 'Notification Settings';
      case 'financial':
        return 'Financial Reports';
      case 'analytics':
        return 'Business Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="header-left">
            <h1>{getPageTitle()}</h1>
          </div>
          
          <div className="header-right">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
              />
            </div>
            
            <div className="notification-container">
              <button className="notification-btn">
                <span className="notification-icon">🔔</span>
                <span className="notification-badge">3</span>
              </button>
            </div>
            
            <div className="user-container">
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
              <div className="user-avatar">
                <span>A</span>
              </div>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        
        <div className="admin-main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 