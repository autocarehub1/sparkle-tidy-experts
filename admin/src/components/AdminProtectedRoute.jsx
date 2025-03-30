import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

  useEffect(() => {
    // Check authentication on component mount and path change
    if (!isAuthenticated && !location.pathname.includes('/admin/login')) {
      console.log('User not authenticated, redirecting to login');
    }
  }, [isAuthenticated, location]);

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute; 