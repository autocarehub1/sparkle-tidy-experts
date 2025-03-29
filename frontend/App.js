import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/admin/*" element={<AdminRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

// Redirects to the admin panel on a different port
const AdminRedirect = () => {
  React.useEffect(() => {
    const adminUrl = process.env.NODE_ENV === 'production'
      ? 'https://admin.sparkletidy.com'
      : 'http://localhost:3001';
      
    window.location.href = adminUrl + window.location.pathname;
  }, []);
  
  return <div>Redirecting to admin panel...</div>;
};

export default App; 