import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route 
            path="/admin/dashboard/*" 
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

// Navigation helper component
const Navigate = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  
  return <div>Redirecting...</div>;
};

export default App; 