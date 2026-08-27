import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Load users from localStorage on mount
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) setUser(currentUser);
  }, []);

  const signup = (email, password, name) => {
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser = { id: Date.now(), email, password, name };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return newUser;
  };

  const login = (email, password) => {
    // First check localStorage for latest data (in case another tab changed it)
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = storedUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Invalid credentials');
    }
    setUser(foundUser);
    setUsers(storedUsers);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return foundUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
