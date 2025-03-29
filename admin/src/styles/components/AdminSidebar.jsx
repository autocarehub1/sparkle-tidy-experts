import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleGroup = (group) => {
    if (expandedGroup === group) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(group);
    }
  };

  // Define menu structure with groups and items
  const menuGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      items: [
        { id: 'overview', label: 'Overview', icon: '📈' }
      ]
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: '📅',
      items: [
        { id: 'upcoming', label: 'Upcoming', icon: '⏰' },
        { id: 'completed', label: 'Completed', icon: '✅' },
        { id: 'cancelled', label: 'Cancelled', icon: '❌' }
      ]
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: '👥',
      items: [
        { id: 'clients', label: 'All Clients', icon: '👤' },
        { id: 'new-client', label: 'Add New Client', icon: '➕' }
      ]
    },
    {
      id: 'team',
      label: 'Team',
      icon: '👷',
      items: [
        { id: 'contractors', label: 'Contractors', icon: '🧹' },
        { id: 'schedule', label: 'Schedule', icon: '📆' },
        { id: 'performance', label: 'Performance', icon: '📊' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      items: [
        { id: 'company', label: 'Company', icon: '🏢' },
        { id: 'services', label: 'Services', icon: '🧽' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📝',
      items: [
        { id: 'financial', label: 'Financial', icon: '💰' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
      ]
    }
  ];

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'S&T' : 'Sparkle & Tidy'}</h2>
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="menu-groups">
            {menuGroups.map(group => (
              <li key={group.id} className="menu-group">
                <div 
                  className={`group-header ${expandedGroup === group.id ? 'expanded' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="group-label">
                    <span className="nav-icon">{group.icon}</span>
                    {!collapsed && <span className="nav-text">{group.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className="expand-icon">
                      {expandedGroup === group.id ? '▼' : '▶'}
                    </span>
                  )}
                </div>
                
                {(expandedGroup === group.id || !collapsed) && (
                  <ul className={`group-items ${expandedGroup === group.id ? 'expanded' : ''}`}>
                    {group.items.map(item => (
                      <li 
                        key={item.id}
                        className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <span className="item-icon">{item.icon}</span>
                        {!collapsed && <span className="item-label">{item.label}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="sidebar-footer">
        <Link to="/" className="view-website">
          <span className="nav-icon">🏠</span>
          {!collapsed && <span className="nav-text">View Website</span>}
        </Link>
        <div className="user-info">
          <div className="user-avatar">👤</div>
          {!collapsed && (
            <div className="user-details">
              <div className="user-name">Admin User</div>
              <div className="user-role">Administrator</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 