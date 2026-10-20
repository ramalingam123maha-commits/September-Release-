# ShopHub E-Commerce - Quick Start Guide

Get the e-commerce website up and running in minutes!

## ⚡ Quick Start (5-10 minutes)

### Prerequisites
- Node.js v14+ and npm
- MongoDB (local or MongoDB Atlas account)

### Step 1: Install Backend Dependencies

```bash
cd ecommerce-website/backend
npm install
```

### Step 2: Configure Backend

Create `.env` file from example:
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

### Step 3: Start Backend Server

```bash
npm start
# Or with auto-reload (install nodemon first):
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Step 4: Install Frontend Dependencies

In a new terminal:
```bash
cd ecommerce-website/frontend
npm install
```

### Step 5: Start Frontend Development Server

```bash
npm start
```

✅ Frontend running on `http://localhost:3000`

## 🧪 Testing the Application

### 1. Create a Test Account

1. Open http://localhost:3000
2. Click "Register"
3. Fill in credentials:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123

### 2. Add Test Products (Admin)

First, create an admin account by directly inserting into MongoDB:

```javascript
// Use MongoDB Compass or CLI to insert:
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10/...", // bcrypted password
  role: "admin"
})

db.products.insertOne({
  name: "Wireless Headphones",
  description: "Premium noise-canceling headphones",
  price: 199.99,
  category: "Electronics",
  stock: 50,
  rating: 4.5,
  isActive: true
})
```

### 3. Test Shopping Flow

1. ✅ Browse Products (Home & Products page)
2. ✅ View Product Details (Click product card)
3. ✅ Add to Cart (Select quantity & add)
4. ✅ View Cart (Cart page)
5. ✅ Checkout (Enter shipping address)
6. ✅ Place Order (Select payment method)
7. ✅ View Orders (My Orders page)

## 📂 Project Structure

```
ecommerce-website/
├── backend/                 # Express.js server
│   ├── server.js           # Main entry point
│   ├── models/             # MongoDB models
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & error handling
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React application
    ├── src/
    │   ├── App.js          # Main component
    │   ├── index.js        # Entry point
    │   ├── pages/          # Route pages
    │   ├── components/     # Reusable components
    │   ├── context/        # State management
    │   └── styles/         # CSS files
    └── package.json
```

## 🛣️ Main Routes

### Customer Routes
- `/` - Home page
- `/products` - Products listing with filters
- `/product/:id` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/order/:id` - Order details
- `/login` - Login page
- `/register` - Registration page
- `/profile` - User profile

### Admin Routes (Protected)
- Accessible after logging in as admin
- Product management capabilities
- Order management

## 🔑 API Endpoints Summary

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
```

### Products
```
GET    /api/products?category=Electronics&sort=price-low&page=1
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/review
```

### Cart
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/item/:productId
DELETE /api/cart/:productId
DELETE /api/cart
```

### Orders
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
```

## 🎨 Key Features Demo

### 1. **Authentication**
- Register new account
- Login/Logout
- Profile management
- Password hashing (bcryptjs)

### 2. **Product Browsing**
- View all products
- Filter by category
- Search products
- Sort by price/rating
- Pagination (12 products per page)
- View detailed product info
- Read/write reviews

### 3. **Shopping Cart**
- Add products
- Update quantities
- Remove items
- View cart total
- Real-time updates

### 4. **Checkout**
- Enter shipping address
- Optional billing address
- Select payment method
- Review order summary
- Auto-calculated tax & shipping

### 5. **Order Management**
- View order history
- Track order status
- View order details
- Download receipts (future enhancement)

## 🔒 Security Features

✅ JWT token authentication
✅ Password hashing with bcryptjs
✅ Rate limiting (15 min window)
✅ Input validation and sanitization
✅ CORS configuration
✅ Error handling middleware
✅ Protected routes
✅ Admin role verification

## 📊 Database Setup

### MongoDB Local Setup
```bash
# Install MongoDB Community Edition
# macOS (Homebrew):
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux:
sudo apt-get install -y mongodb

# Windows:
# Download from https://www.mongodb.com/try/download/community
```

### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Replace MONGODB_URI in .env

## 🚀 Development Tips

### Hot Reload
- Backend: Uses nodemon (auto-restarts on file changes)
- Frontend: React automatically reloads on file changes

### Debugging
- **Backend:** Check terminal logs and MongoDB Compass
- **Frontend:** Use browser DevTools Console
- **API Calls:** Check Network tab in DevTools

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check connection string in .env
- Verify network access if using Atlas

**Port Already in Use**
- Backend (5000): `lsof -i :5000 | kill -9 <PID>`
- Frontend (3000): `lsof -i :3000 | kill -9 <PID>`

**CORS Errors**
- Ensure backend CORS is configured
- Check frontend API URL matches backend

## 📈 Performance Optimization

- Pagination: 12 products per page
- Image optimization: Lazy loading (future)
- Caching: JWT stored in localStorage
- Database indexing: Implemented on key fields

## 🎯 Next Steps

1. ✅ Get app running locally
2. ✅ Test all features
3. ✅ Add sample products
4. ✅ Test user flows
5. ✅ Integrate payment provider (Stripe, PayPal)
6. ✅ Add email notifications
7. ✅ Deploy to production

## 📞 Support & Documentation

- Full README: See `README.md`
- API Documentation: Check route files in `backend/routes/`
- Component Documentation: Check JSDoc comments
- Database Models: Check `backend/models/`

## ✨ Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| User Authentication | ✅ Complete | JWT + bcrypt |
| Product Management | ✅ Complete | CRUD operations |
| Shopping Cart | ✅ Complete | Real-time updates |
| Checkout Process | ✅ Complete | Multi-step flow |
| Order Management | ✅ Complete | Status tracking |
| Payment Integration | 🔄 Placeholder | Ready for Stripe/PayPal |
| Email Notifications | 📋 Ready | Email service ready |
| Admin Dashboard | ✅ API Ready | Frontend UI ready |
| Product Reviews | ✅ Complete | Ratings & comments |
| Responsive Design | ✅ Complete | Mobile-first CSS |

## 🎓 Learning Resources

### For Beginners
- Express.js: https://expressjs.com/
- React: https://react.dev/
- MongoDB: https://docs.mongodb.com/
- JWT: https://jwt.io/

### Advanced Topics
- Security Best Practices: OWASP Top 10
- API Design: REST API conventions
- Database Optimization: MongoDB indexing
- Performance: React optimization techniques

## 🚢 Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure MongoDB Atlas cluster
- [ ] Set up email service
- [ ] Integrate payment provider
- [ ] Set up SSL certificates
- [ ] Configure domain & DNS
- [ ] Set up monitoring & logging
- [ ] Create backup strategy
- [ ] Test on staging
- [ ] Deploy to production

## 📝 Additional Notes

- Default port backend: 5000
- Default port frontend: 3000
- Default tax rate: 10%
- Free shipping threshold: $100
- Default pagination: 12 items per page

Enjoy! 🎉
