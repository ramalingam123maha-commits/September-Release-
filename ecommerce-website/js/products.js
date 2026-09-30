// Product catalog data
const CATEGORIES = [
  { id: 'electronics', icon: '💻', name: 'Electronics', desc: 'Gadgets & devices' },
  { id: 'fashion', icon: '👕', name: 'Fashion', desc: 'Apparel & style' },
  { id: 'home', icon: '🏠', name: 'Home', desc: 'Living essentials' },
  { id: 'sports', icon: '⚽', name: 'Sports', desc: 'Gear & fitness' },
];

const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', category: 'electronics', emoji: '🎧', price: 89.99, oldPrice: 129.99, rating: 4.7, reviews: 320, badge: 'Sale' },
  { id: 2, name: 'Smart Watch Pro', category: 'electronics', emoji: '⌚', price: 199.99, oldPrice: null, rating: 4.8, reviews: 512, badge: 'New' },
  { id: 3, name: 'Bluetooth Speaker', category: 'electronics', emoji: '🔊', price: 49.99, oldPrice: 69.99, rating: 4.5, reviews: 210, badge: 'Sale' },
  { id: 4, name: 'Mirrorless Camera', category: 'electronics', emoji: '📷', price: 649.99, oldPrice: null, rating: 4.9, reviews: 98, badge: null },
  { id: 5, name: 'Classic Denim Jacket', category: 'fashion', emoji: '🧥', price: 59.99, oldPrice: 79.99, rating: 4.4, reviews: 145, badge: 'Sale' },
  { id: 6, name: 'Running Sneakers', category: 'fashion', emoji: '👟', price: 74.99, oldPrice: null, rating: 4.6, reviews: 267, badge: null },
  { id: 7, name: 'Leather Backpack', category: 'fashion', emoji: '🎒', price: 89.99, oldPrice: 119.99, rating: 4.7, reviews: 189, badge: 'Sale' },
  { id: 8, name: 'Sunglasses', category: 'fashion', emoji: '🕶️', price: 34.99, oldPrice: null, rating: 4.3, reviews: 76, badge: null },
  { id: 9, name: 'Ceramic Coffee Mug', category: 'home', emoji: '☕', price: 14.99, oldPrice: null, rating: 4.5, reviews: 342, badge: null },
  { id: 10, name: 'Scented Candle Set', category: 'home', emoji: '🕯️', price: 24.99, oldPrice: 34.99, rating: 4.8, reviews: 421, badge: 'Sale' },
  { id: 11, name: 'Indoor Plant Pot', category: 'home', emoji: '🪴', price: 19.99, oldPrice: null, rating: 4.6, reviews: 158, badge: 'New' },
  { id: 12, name: 'Table Lamp', category: 'home', emoji: '💡', price: 39.99, oldPrice: null, rating: 4.4, reviews: 93, badge: null },
  { id: 13, name: 'Yoga Mat', category: 'sports', emoji: '🧘', price: 29.99, oldPrice: 44.99, rating: 4.7, reviews: 288, badge: 'Sale' },
  { id: 14, name: 'Dumbbell Set', category: 'sports', emoji: '🏋️', price: 89.99, oldPrice: null, rating: 4.8, reviews: 176, badge: null },
  { id: 15, name: 'Football', category: 'sports', emoji: '⚽', price: 24.99, oldPrice: null, rating: 4.5, reviews: 204, badge: null },
  { id: 16, name: 'Water Bottle', category: 'sports', emoji: '🍶', price: 17.99, oldPrice: 24.99, rating: 4.6, reviews: 359, badge: 'Sale' },
];
