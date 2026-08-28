import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user, logout, getProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      getProfile();
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Secure Login System</h1>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user.username}!</h2>
          <div className="user-info">
            <div className="info-item">
              <label>Username:</label>
              <p>{user.username}</p>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <p>{user.email}</p>
            </div>
            <div className="info-item">
              <label>Account Created:</label>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {user.lastLogin && (
              <div className="info-item">
                <label>Last Login:</label>
                <p>{new Date(user.lastLogin).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="features-section">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🔐 Secure Authentication</h4>
              <p>Password hashing with bcrypt and JWT tokens</p>
            </div>
            <div className="feature-card">
              <h4>🛡️ Account Protection</h4>
              <p>Login attempt limits and account lockout</p>
            </div>
            <div className="feature-card">
              <h4>⚡ Rate Limiting</h4>
              <p>API rate limiting to prevent brute force attacks</p>
            </div>
            <div className="feature-card">
              <h4>📧 Email Validation</h4>
              <p>Email format validation on registration</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
