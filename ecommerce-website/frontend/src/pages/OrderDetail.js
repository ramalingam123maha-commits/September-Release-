import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loader">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>
        <div className="error-message">Order not found</div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        <FiArrowLeft /> Back to Orders
      </button>

      <div className="order-header-section">
        <div>
          <h1>Order Details</h1>
          <p className="order-number">{order.orderNumber}</p>
        </div>
        <div
          className="order-status-large"
          style={{ borderColor: getStatusColor(order.status) }}
        >
          <span style={{ color: getStatusColor(order.status) }}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="order-detail-container">
        {/* Order Items */}
        <section className="detail-section">
          <h2>Items</h2>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item.productId} className="item-row">
                {item.image && <img src={item.image} alt={item.productName} />}
                <div className="item-info">
                  <h4>{item.productName}</h4>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-total">
                  <span>${item.price.toFixed(2)} each</span>
                  <p className="total">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Address */}
        <section className="detail-section">
          <h2>Shipping Address</h2>
          <address className="address-box">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.zipCode}
            <br />
            {order.shippingAddress.country}
          </address>
        </section>

        {/* Billing Address */}
        <section className="detail-section">
          <h2>Billing Address</h2>
          <address className="address-box">
            {order.billingAddress.street}
            <br />
            {order.billingAddress.city}, {order.billingAddress.state}{' '}
            {order.billingAddress.zipCode}
            <br />
            {order.billingAddress.country}
          </address>
        </section>

        {/* Order Summary */}
        <section className="detail-section full-width">
          <h2>Order Summary</h2>
          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {order.shippingCost === 0 ? (
                  <span className="free">FREE</span>
                ) : (
                  `$${order.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Payment Information */}
        <section className="detail-section">
          <h2>Payment Information</h2>
          <div className="info-box">
            <div className="info-row">
              <label>Payment Method</label>
              <span className="capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </span>
            </div>
            <div className="info-row">
              <label>Payment Status</label>
              <span
                className="status-badge"
                style={{
                  backgroundColor:
                    order.paymentStatus === 'completed' ? '#d4edda' : '#fff3cd',
                  color: order.paymentStatus === 'completed' ? '#155724' : '#856404',
                }}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </span>
            </div>
            {order.stripePaymentId && (
              <div className="info-row">
                <label>Transaction ID</label>
                <span className="transaction-id">{order.stripePaymentId}</span>
              </div>
            )}
          </div>
        </section>

        {/* Shipping Information */}
        <section className="detail-section">
          <h2>Shipping Information</h2>
          <div className="info-box">
            <div className="info-row">
              <label>Order Status</label>
              <span className="capitalize">{order.status}</span>
            </div>
            {order.trackingNumber && (
              <div className="info-row">
                <label>Tracking Number</label>
                <span className="tracking-number">{order.trackingNumber}</span>
              </div>
            )}
            <div className="info-row">
              <label>Order Date</label>
              <span>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderDetail;
