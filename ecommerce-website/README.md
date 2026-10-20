# ShopHub - E-Commerce Website

A fully functional, production-ready e-commerce website built with React, Express.js, MongoDB, and modern web technologies.

## 🚀 Features

### Customer Features
- ✅ User authentication (Register, Login, Logout)
- ✅ Browse and search products
- ✅ Filter by category and price
- ✅ Product details with reviews and ratings
- ✅ Shopping cart management
- ✅ Checkout with multiple payment methods
- ✅ Order tracking
- ✅ User profile management
- ✅ Product reviews and ratings
- ✅ Responsive design (mobile, tablet, desktop)

### Admin Features
- ✅ Product management (Create, Read, Update, Delete)
- ✅ Order management
- ✅ Order status tracking
- ✅ Payment management
- ✅ User role-based access control

### Technical Features
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting
- ✅ CORS support
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ MongoDB with Mongoose ODM
- ✅ RESTful API architecture
- ✅ React Context for state management
- ✅ Responsive CSS design

## 📁 Project Structure

```
ecommerce-website/
├── backend/
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT verification
│   │   └── errorHandler.js
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/       # React components
    │   │   ├── Header.js
    │   │   ├── ProductCard.js
    │   │   └── ProtectedRoute.js
    │   ├── context/          # React Context
    │   │   ├── AuthContext.js
    │   │   └── CartContext.js
    │   ├── pages/            # Page components
    │   │   ├── Home.js
    │   │   ├── Products.js
    │   │   ├── ProductDetail.js
    │   │   ├── Cart.js
    │   │   ├── Checkout.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Orders.js
    │   │   ├── OrderDetail.js
    │   │   ├── Profile.js
    │   │   └── NotFound.js
    │   ├── App.js
    │   ├── index.js
    │   └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Rate Limiting:** express-rate-limit
- **CORS:** cors middleware
- **Environment:** dotenv

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Styling:** CSS3
- **Icons:** react-icons

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

## 🚀 Getting Started

### Backend Setup

1. **Clone the repository**
```bash
cd ecommerce-website/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit `.env` with your settings:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key
PORT=5000
```

5. **Start the server**
```bash
npm start        # Production
npm run dev      # Development with nodemon
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ecommerce-website/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### Products
- `GET /api/products` - Get all products (with filters, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/review` - Add review (protected)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/item/:productId` - Update item quantity (protected)
- `DELETE /api/cart/:productId` - Remove item from cart (protected)
- `DELETE /api/cart` - Clear cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get single order (protected)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `PUT /api/orders/:id/payment` - Update payment status (admin only)
- `GET /api/orders/admin/all` - Get all orders (admin only)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in
2. Backend issues JWT token
3. Token stored in localStorage
4. Token sent with each protected request in Authorization header
5. Backend verifies token before processing request

### Protected Routes
- `/checkout`
- `/orders`
- `/order/:id`
- `/profile`

### Admin Routes
- Product management (create, update, delete)
- Order management
- User role-based access

## 💳 Payment Methods

The application supports multiple payment methods:
- Stripe (credit card)
- PayPal
- Bank Transfer

Currently, payment processing is simulated. Integration with actual payment providers can be added.

## 📊 Database Models

### User Model
- name, email, password (hashed)
- role (customer, admin)
- phone, address
- profileImage
- createdAt

### Product Model
- name, description, price
- originalPrice, category
- images, stock
- rating, reviews
- sku, tags
- isActive, createdAt, updatedAt

### Cart Model
- userId (unique)
- items (array of products with quantity)
- createdAt, updatedAt
- total (calculated field)

### Order Model
- orderNumber (unique)
- userId
- items (product details at time of order)
- shippingAddress, billingAddress
- subtotal, tax, shippingCost, total
- status (pending, processing, shipped, delivered, cancelled)
- paymentMethod, paymentStatus
- stripePaymentId, trackingNumber
- createdAt, updatedAt

## 🎨 Styling

The application uses vanilla CSS with:
- Responsive grid layout
- Mobile-first approach
- CSS Flexbox and Grid
- Smooth transitions and animations
- Clean, modern design system
- Accessible color contrasts

## 🔄 Order Flow

1. **Browse:** Customer browses products
2. **Add to Cart:** Customer adds products to cart
3. **Checkout:** Customer proceeds to checkout
4. **Enter Address:** Customer provides shipping/billing address
5. **Payment:** Customer selects payment method
6. **Confirm Order:** Order is created in database
7. **Track Order:** Customer can view order status
8. **Receive:** Order progresses through fulfillment stages

## ✅ Best Practices Implemented

- **Security:** Password hashing, JWT authentication, input validation
- **Error Handling:** Comprehensive error middleware
- **Rate Limiting:** Protection against brute force attacks
- **Code Organization:** Modular structure, separation of concerns
- **Performance:** Pagination, query optimization
- **UX:** Loading states, error messages, confirmation dialogs
- **Responsive Design:** Mobile-first CSS approach
- **API Design:** RESTful conventions, proper HTTP methods
- **Database:** Mongoose schemas with validation

## 🚢 Deployment

### Backend Deployment (Heroku, Railway, Render)
1. Create .env with production variables
2. Push to git repository
3. Deploy using platform's CLI or GitHub integration
4. Set environment variables on deployment platform

### Frontend Deployment (Vercel, Netlify)
1. Update API URL for production backend
2. Build the application: `npm run build`
3. Deploy build directory
4. Set environment variables if needed

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or connection string is correct
- Check `.env` file MONGODB_URI value

### CORS Error
- Ensure backend CORS configuration matches frontend URL
- Check that frontend makes requests to correct backend URL

### JWT Token Invalid
- Clear localStorage and log in again
- Check JWT_SECRET in backend matches
- Verify token hasn't expired

### Products Not Showing
- Check database has products inserted
- Verify MongoDB connection
- Check browser console for API errors

## 📝 Sample Data

To populate the database with sample products, you can create a seed script or manually insert data using MongoDB Compass or CLI.

Sample product document:
```json
{
  "name": "Wireless Headphones",
  "description": "Premium noise-canceling wireless headphones",
  "price": 199.99,
  "originalPrice": 249.99,
  "category": "Electronics",
  "stock": 50,
  "rating": 4.5,
  "reviews": [],
  "sku": "WH-001",
  "isActive": true
}
```

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created as a comprehensive e-commerce solution demonstrating modern web development practices.

## 💡 Future Enhancements

- [ ] Real payment integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Product recommendations
- [ ] Wishlist feature
- [ ] Advanced search and filters
- [ ] Product variants (size, color)
- [ ] Coupon/discount codes
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Multi-language support
- [ ] Blockchain wallet integration
- [ ] AI-powered chatbot
