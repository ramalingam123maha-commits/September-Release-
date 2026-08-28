import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

const Login = ({ onLoginSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Task Manager - Login</h1>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
          Login
        </button>
        <p className="text-center mt-4 text-sm">Don't have an account? <button type="button" onClick={onSwitchToSignUp} className="text-blue-500 hover:underline">Sign up</button></p>
      </form>
    </div>
  );
};

export default Login;
