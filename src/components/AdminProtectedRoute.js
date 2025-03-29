import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          window.location.href = '/admin/login';
          return;
        }
        
        // Verify the token with the server
        const response = await axios.get('/admin/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AdminProtectedRoute; 