import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
    return <div className="loader">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-number">{order.orderNumber}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="order-status" style={{ borderColor: getStatusColor(order.status) }}>
                  <span style={{ color: getStatusColor(order.status) }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <label>Items</label>
                  <p>{order.items.length} item(s)</p>
                </div>
                <div className="detail-item">
                  <label>Total</label>
                  <p className="order-total">${order.total.toFixed(2)}</p>
                </div>
                <div className="detail-item">
                  <label>Payment</label>
                  <p>{order.paymentStatus}</p>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.productId} className="preview-item">
                    {item.image && <img src={item.image} alt={item.productName} />}
                    <div>
                      <p className="item-name">{item.productName}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="more-items">+{order.items.length - 3} more items</p>
                )}
              </div>

              <Link to={`/order/${order._id}`} className="view-order-btn">
                <FiEye /> View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
