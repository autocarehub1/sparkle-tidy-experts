import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Dashboard.css';

// Dashboard sub-pages
import Overview from './dashboard/Overview';
import Appointments from './dashboard/Appointments';
import Contractors from './dashboard/Contractors';
import Customers from './dashboard/Customers';
import Settings from './dashboard/Settings';

const Dashboard = () => {
  const [adminName, setAdminName] = useState('Admin');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch admin profile data
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get('/admin/profile');
        if (response.data.name) {
          setAdminName(response.data.name);
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="dashboard-logo">
          <img src="/logo.png" alt="Sparkle & Tidy Experts" />
          <button 
            className="menu-toggle mobile-only" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '×' : '☰'}
          </button>
        </div>
        
        <nav className="dashboard-nav">
          <ul>
            <li>
              <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-chart-line"></i> Overview
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/appointments" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-calendar-alt"></i> Appointments
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/contractors" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-users"></i> Contractors
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/customers" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-user-friends"></i> Customers
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/settings" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-cog"></i> Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="dashboard-sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <button 
            className="menu-toggle mobile-only" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
          <div className="dashboard-header-title">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="dashboard-header-user">
            <span>Welcome, {adminName}</span>
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/contractors" element={<Contractors />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Navigation helper component
const Navigate = ({ to }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  
  return null;
};

export default Dashboard; 