import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingCart, FiStar, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product._id, quantity);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleAddReview = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      setReviewLoading(true);
      await axios.post(`/api/products/${id}/review`, {
        rating,
        comment,
      });
      setComment('');
      setRating(5);
      fetchProduct();
      setMessage('Review added successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft /> Back
        </button>
        <div className="error-message">Product not found</div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        <FiArrowLeft /> Back
      </button>

      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images">
          {product.images && product.images[0] && (
            <img src={product.images[0].url} alt={product.name} className="main-image" />
          )}
          {!product.images || !product.images[0] && (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <span className="category-badge">{product.category}</span>
            <span className="sku">SKU: {product.sku || 'N/A'}</span>
          </div>

          <div className="product-rating-section">
            <div className="rating">
              <FiStar className="star-icon" />
              <span className="rating-value">{product.rating || 0}</span>
              <span className="review-count">({product.reviews?.length || 0} reviews)</span>
            </div>
          </div>

          <div className="product-price-section">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                <span className="discount">
                  {Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  )}
                  % OFF
                </span>
              </>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-control">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <input type="number" value={quantity} readOnly min="1" />
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                    +
                  </button>
                </div>
              </div>

              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          )}

          {message && <div className="success-message">{message}</div>}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {isAuthenticated && (
          <div className="add-review-form">
            <h3>Add Your Review</h3>
            <div className="form-group">
              <label>Rating:</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {'⭐'.repeat(r)} {r} Star
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Comment:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your comment here..."
                rows="4"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <p className="login-prompt">
            <button onClick={() => navigate('/login')} className="link-btn">
              Login
            </button>
            {' '}to write a review
          </p>
        )}

        <div className="reviews-list">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">{review.userName}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
