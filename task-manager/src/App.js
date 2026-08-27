import React, { useState, useContext } from 'react';
import { AuthContext } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Layout/Navbar';

function App() {
  const { user, logout } = useContext(AuthContext);
  const [showSignUp, setShowSignUp] = useState(false);

  if (!user) {
    return showSignUp ? (
      <SignUp onSignUpSuccess={() => setShowSignUp(false)} onSwitchToLogin={() => setShowSignUp(false)} />
    ) : (
      <Login onLoginSuccess={() => {}} onSwitchToSignUp={() => setShowSignUp(true)} />
    );
  }

  return (
    <>
      <Navbar onLogout={logout} />
      <Dashboard />
    </>
  );
}

export default App;
