import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
    billingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
    paymentMethod: 'stripe',
    sameAsBilling: true,
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="error-message">
          <p>Your cart is empty. Please add items before checking out.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value,
      },
    });
  };

  const handleSameAsBillingChange = (e) => {
    const checked = e.target.checked;
    setFormData({
      ...formData,
      sameAsBilling: checked,
      billingAddress: checked
        ? formData.shippingAddress
        : formData.billingAddress,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shippingAddress.street || !formData.shippingAddress.city) {
      alert('Please fill in all shipping address fields');
      return;
    }

    if (!formData.sameAsBilling) {
      if (!formData.billingAddress.street || !formData.billingAddress.city) {
        alert('Please fill in all billing address fields');
        return;
      }
    }

    try {
      setLoading(true);
      const orderData = {
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsBilling
          ? formData.shippingAddress
          : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
      };

      const response = await axios.post('/api/orders', orderData);
      await clearCart();

      // Redirect to order detail
      navigate(`/order/${response.data.order._id}`, {
        state: { orderNumber: response.data.order.orderNumber },
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <button
        onClick={() => navigate('/cart')}
        className="back-btn"
      >
        <FiArrowLeft /> Back to Cart
      </button>

      <h1 className="page-title">Checkout</h1>

      <div className="checkout-container">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Shipping Address */}
          <section className="form-section">
            <h2>Shipping Address</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.shippingAddress.street}
                  onChange={(e) => handleInputChange(e, 'shippingAddress')}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange(e, 'shippingAddress')}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleInputChange(e, 'shippingAddress')}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) => handleInputChange(e, 'shippingAddress')}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.shippingAddress.country}
                  onChange={(e) => handleInputChange(e, 'shippingAddress')}
                  className="form-input"
                />
              </div>
            </div>
          </section>

          {/* Billing Address */}
          <section className="form-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={formData.sameAsBilling}
                onChange={handleSameAsBillingChange}
              />
              <label htmlFor="sameAsBilling">Billing address same as shipping</label>
            </div>

            {!formData.sameAsBilling && (
              <>
                <h2>Billing Address</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.billingAddress.street}
                      onChange={(e) => handleInputChange(e, 'billingAddress')}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleInputChange(e, 'billingAddress')}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.billingAddress.state}
                      onChange={(e) => handleInputChange(e, 'billingAddress')}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.billingAddress.zipCode}
                      onChange={(e) => handleInputChange(e, 'billingAddress')}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.billingAddress.country}
                      onChange={(e) => handleInputChange(e, 'billingAddress')}
                      className="form-input"
                    />
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Payment Method */}
          <section className="form-section">
            <h2>Payment Method</h2>

            <div className="payment-options">
              {['stripe', 'paypal', 'bank_transfer'].map((method) => (
                <label key={method} className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                  />
                  <span className="method-label">
                    {method === 'stripe' && '💳 Credit Card (Stripe)'}
                    {method === 'paypal' && '🅿️ PayPal'}
                    {method === 'bank_transfer' && '🏦 Bank Transfer'}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        {/* Order Summary */}
        <aside className="order-summary-sidebar">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {cart.items.map((item) => (
              <div key={item.productId} className="summary-item">
                <span className="item-info">
                  {item.productId?.name || 'Product'} × {item.quantity}
                </span>
                <span className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

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
                <span className="free-shipping">FREE</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
