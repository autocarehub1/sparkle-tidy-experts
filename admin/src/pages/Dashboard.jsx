import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';

// Placeholder components for dashboard sections
const PlaceholderComponent = ({ title }) => (
  <div className="placeholder-component">
    <div className="placeholder-header">
      <h2>{title}</h2>
    </div>
    <div className="placeholder-content">
      <p>This section is under development. It will be available in the next update.</p>
      <div className="placeholder-image"></div>
    </div>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Set active tab based on URL
    const path = location.pathname.split('/').pop();
    if (path && path !== 'dashboard') {
      setActiveTab(path);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PlaceholderComponent title="Dashboard Overview" />;
      case 'appointments':
        return <PlaceholderComponent title="Appointments Management" />;
      case 'clients':
        return <PlaceholderComponent title="Client Management" />;
      case 'contractors':
        return <PlaceholderComponent title="Contractor Management" />;
      case 'services':
        return <PlaceholderComponent title="Service Management" />;
      case 'reports':
        return <PlaceholderComponent title="Reports & Analytics" />;
      case 'settings':
        return <PlaceholderComponent title="System Settings" />;
      default:
        return <PlaceholderComponent title="Dashboard Overview" />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'appointments': return 'Appointments Management';
      case 'clients': return 'Client Management';
      case 'contractors': return 'Contractor Management';
      case 'services': return 'Service Management';
      case 'reports': return 'Reports & Analytics';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`dashboard-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="dashboard-logo">
          <span>S&T Experts</span>
        </div>
        <nav className="dashboard-nav">
          <ul>
            <li>
              <a 
                href="#overview" 
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}
              >
                <i className="fas fa-tachometer-alt"></i> Overview
              </a>
            </li>
            <li>
              <a 
                href="#appointments" 
                className={activeTab === 'appointments' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('appointments'); }}
              >
                <i className="fas fa-calendar-alt"></i> Appointments
              </a>
            </li>
            <li>
              <a 
                href="#clients" 
                className={activeTab === 'clients' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('clients'); }}
              >
                <i className="fas fa-users"></i> Clients
              </a>
            </li>
            <li>
              <a 
                href="#contractors" 
                className={activeTab === 'contractors' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('contractors'); }}
              >
                <i className="fas fa-hard-hat"></i> Contractors
              </a>
            </li>
            <li>
              <a 
                href="#services" 
                className={activeTab === 'services' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('services'); }}
              >
                <i className="fas fa-broom"></i> Services
              </a>
            </li>
            <li>
              <a 
                href="#reports" 
                className={activeTab === 'reports' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}
              >
                <i className="fas fa-chart-bar"></i> Reports
              </a>
            </li>
            <li>
              <a 
                href="#settings" 
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}
              >
                <i className="fas fa-cog"></i> Settings
              </a>
            </li>
          </ul>
        </nav>
        <div className="dashboard-sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-header">
          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="dashboard-header-title">
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="dashboard-header-user">
            {user && (
              <>
                <span>{user.name}</span>
                <div className="user-avatar">{user.name[0]}</div>
              </>
            )}
          </div>
        </div>
        
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 