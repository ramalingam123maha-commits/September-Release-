import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setUser({ id: userId });
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = () => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <div className="app">
      {user && (
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">Fit-Freak</h1>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}
      
      {currentPage === 'login' && !user && (
        <div className="auth-page">
          <Login onSuccess={handleLoginSuccess} />
          <div className="auth-toggle">
            <p>Don't have an account? <button onClick={() => setCurrentPage('register')}>Register</button></p>
          </div>
        </div>
      )}
      
      {currentPage === 'register' && !user && (
        <div className="auth-page">
          <Register onSuccess={handleRegisterSuccess} />
          <div className="auth-toggle">
            <p>Already have an account? <button onClick={() => setCurrentPage('login')}>Login</button></p>
          </div>
        </div>
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard userId={user.id} />
      )}
    </div>
  );
}

export default App;
