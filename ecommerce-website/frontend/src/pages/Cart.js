import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateCartItem, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setLoading(true);
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      alert(error.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setLoading(true);
      await removeFromCart(productId);
    } catch (error) {
      alert(error.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <Link to="/products" className="back-link">
          <FiArrowLeft /> Continue Shopping
        </Link>

        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <Link to="/products" className="back-link">
        <FiArrowLeft /> Continue Shopping
      </Link>

      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items-section">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          {cart.items.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="item-name">
                {item.productId?.name || 'Product'}
              </div>

              <div className="item-price">
                ${item.price.toFixed(2)}
              </div>

              <div className="item-quantity">
                <button
                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                  disabled={loading}
                >
                  -
                </button>
                <input type="number" value={item.quantity} readOnly />
                <button
                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                  disabled={loading}
                >
                  +
                </button>
              </div>

              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="remove-btn"
                onClick={() => handleRemoveItem(item.productId)}
                disabled={loading}
                title="Remove item"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <>
                  <span className="free-shipping">FREE</span>
                </>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          {shipping === 0 && (
            <p className="free-shipping-note">✓ Free shipping on orders over $100</p>
          )}

          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>

          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
