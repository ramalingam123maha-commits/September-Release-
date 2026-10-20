import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart();
    }
  }, [isAuthenticated, token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await axios.post('/api/cart/add', { productId, quantity });
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put(`/api/cart/item/${productId}`, { quantity });
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`/api/cart/${productId}`);
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.delete('/api/cart');
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const getCartTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
