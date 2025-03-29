import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token validity
      const verifyToken = async () => {
        try {
          const response = await axios.get('/admin/verify-token', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.valid) {
            window.location.href = '/admin/dashboard';
          }
        } catch (err) {
          // Token invalid, continue with login
          localStorage.removeItem('adminToken');
        }
      };
      
      verifyToken();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/admin/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        window.location.href = '/admin/dashboard';
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form-container">
        <div className="admin-login-logo">
          <img src="/logo.png" alt="Sparkle & Tidy Experts" />
        </div>
        <h1>Admin Portal</h1>
        
        {error && <div className="admin-login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="admin-login-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 