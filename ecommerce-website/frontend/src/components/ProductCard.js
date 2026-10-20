import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      setLoading(true);
      await addToCart(product._id, quantity);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-image-link">
        <div className="product-image">
          {product.images && product.images[0] && (
            <img src={product.images[0].url} alt={product.name} />
          )}
          {!product.images || !product.images[0] && (
            <div className="no-image">No Image</div>
          )}
          {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
          {product.stock === 0 && <div className="out-of-stock">Out of Stock</div>}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <p className="product-description">{product.description.substring(0, 60)}...</p>

        <div className="product-rating">
          <FiStar size={16} />
          <span>{product.rating || 0}</span>
          <span className="review-count">({product.reviews?.length || 0} reviews)</span>
        </div>

        <div className="product-price">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="product-category">
          <span className="category-badge">{product.category}</span>
        </div>

        {product.stock > 0 ? (
          <div className="product-actions">
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} readOnly min="1" />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                +
              </button>
            </div>
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={loading}
            >
              <FiShoppingCart />
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        ) : (
          <div className="out-of-stock-text">Out of Stock</div>
        )}

        {message && <div className="success-message">{message}</div>}
      </div>
    </div>
  );
};

export default ProductCard;
