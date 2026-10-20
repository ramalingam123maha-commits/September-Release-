import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products?limit=8&sort=rating');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ShopHub</h1>
          <p>Discover amazing products at great prices</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'].map((cat) => (
            <Link key={cat} to={`/products?category=${cat}`} className="category-card">
              <div className="category-icon">
                {cat === 'Electronics' && '📱'}
                {cat === 'Clothing' && '👗'}
                {cat === 'Books' && '📚'}
                {cat === 'Home' && '🏠'}
                {cat === 'Sports' && '⚽'}
                {cat === 'Toys' && '🎮'}
              </div>
              <h3>{cat}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <p className="subtitle">Top-rated products you'll love</p>

        {loading ? (
          <div className="loader">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <div className="grid grid-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="view-all">
          <Link to="/products" className="btn btn-primary">
            View All Products
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-item">
          <div className="feature-icon">🚚</div>
          <h3>Free Shipping</h3>
          <p>On orders over $100</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">💳</div>
          <h3>Secure Payment</h3>
          <p>100% safe transactions</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔄</div>
          <h3>Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">⭐</div>
          <h3>Quality Guaranteed</h3>
          <p>Authentic products</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
