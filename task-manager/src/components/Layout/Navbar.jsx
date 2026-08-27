import React, { useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';

const Navbar = ({ onLogout }) => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">📋 Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {user?.name}!</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
