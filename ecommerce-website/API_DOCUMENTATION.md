# ShopHub E-Commerce API Documentation

Complete REST API reference for the e-commerce platform.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Status Codes

- `200` - OK - Request successful
- `201` - Created - Resource successfully created
- `400` - Bad Request - Invalid parameters
- `401` - Unauthorized - Missing or invalid token
- `403` - Forbidden - Insufficient permissions
- `404` - Not Found - Resource not found
- `500` - Server Error

---

## Authentication Endpoints

### Register User
Create a new user account.

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### Login User
Authenticate and receive JWT token.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### Get Current User
Get authenticated user's profile.

**Request:**
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "phone": "+1-234-567-8900",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "createdAt": "2023-09-15T10:30:00Z"
}
```

---

### Update Profile
Update user profile information.

**Request:**
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+1-234-567-8900",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  }
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "address": { ... }
  }
}
```

---

## Products Endpoints

### Get All Products
Retrieve products with filtering, sorting, and pagination.

**Request:**
```http
GET /products?category=Electronics&sort=price-low&search=headphones&page=1&limit=12
```

**Query Parameters:**
- `category` - Filter by category (Electronics, Clothing, Books, Home, Sports, Toys)
- `search` - Search in name, description, tags
- `sort` - Sort option (newest, price-low, price-high, rating)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Response (200):**
```json
{
  "total": 45,
  "page": 1,
  "limit": 12,
  "pages": 4,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Wireless Headphones",
      "description": "Premium noise-canceling headphones",
      "price": 199.99,
      "originalPrice": 249.99,
      "category": "Electronics",
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "alt": "Front view"
        }
      ],
      "stock": 50,
      "rating": 4.5,
      "reviews": [],
      "sku": "WH-001",
      "isActive": true
    }
  ]
}
```

---

### Get Single Product
Retrieve detailed product information.

**Request:**
```http
GET /products/507f1f77bcf86cd799439012
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Wireless Headphones",
  "description": "Premium noise-canceling headphones with 30-hour battery life",
  "price": 199.99,
  "originalPrice": 249.99,
  "category": "Electronics",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "Front view"
    }
  ],
  "stock": 50,
  "rating": 4.5,
  "reviews": [
    {
      "userId": "507f1f77bcf86cd799439013",
      "userName": "John Doe",
      "rating": 5,
      "comment": "Excellent product!",
      "createdAt": "2023-09-15T10:30:00Z"
    }
  ],
  "sku": "WH-001",
  "tags": ["audio", "wireless", "headphones"],
  "isActive": true,
  "createdAt": "2023-09-01T08:00:00Z",
  "updatedAt": "2023-09-15T10:30:00Z"
}
```

---

### Create Product
Create a new product (Admin only).

**Request:**
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "Premium noise-canceling headphones",
  "price": 199.99,
  "originalPrice": 249.99,
  "category": "Electronics",
  "stock": 50,
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "Front view"
    }
  ],
  "sku": "WH-001",
  "tags": ["audio", "wireless"]
}
```

**Response (201):**
```json
{
  "message": "Product created successfully",
  "product": { ... }
}
```

---

### Update Product
Update product information (Admin only).

**Request:**
```http
PUT /products/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 179.99,
  "stock": 75
}
```

**Response (200):**
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

### Delete Product
Delete a product (Admin only).

**Request:**
```http
DELETE /products/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

---

### Add Product Review
Add a review and rating to a product.

**Request:**
```http
POST /products/507f1f77bcf86cd799439012/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product! Highly recommended."
}
```

**Response (201):**
```json
{
  "message": "Review added successfully",
  "product": { ... }
}
```

---

## Cart Endpoints

### Get User's Cart
Retrieve the current user's shopping cart.

**Request:**
```http
GET /cart
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "price": 199.99,
      "addedAt": "2023-09-15T10:30:00Z"
    }
  ],
  "total": 399.98,
  "createdAt": "2023-09-15T08:00:00Z",
  "updatedAt": "2023-09-15T10:30:00Z"
}
```

---

### Add Item to Cart
Add a product to the shopping cart.

**Request:**
```http
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "message": "Item added to cart",
  "cart": { ... }
}
```

---

### Update Cart Item Quantity
Update the quantity of an item in the cart.

**Request:**
```http
PUT /cart/item/507f1f77bcf86cd799439012
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "message": "Cart updated",
  "cart": { ... }
}
```

---

### Remove Item from Cart
Remove a product from the shopping cart.

**Request:**
```http
DELETE /cart/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Item removed from cart",
  "cart": { ... }
}
```

---

### Clear Cart
Remove all items from the shopping cart.

**Request:**
```http
DELETE /cart
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Cart cleared",
  "cart": { items: [] }
}
```

---

## Orders Endpoints

### Create Order
Create a new order from the shopping cart.

**Request:**
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe"
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439030",
    "orderNumber": "ORD-1694783400000-1",
    "userId": "507f1f77bcf86cd799439011",
    "items": [ ... ],
    "subtotal": 399.98,
    "tax": 40.00,
    "shippingCost": 0,
    "total": 439.98,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2023-09-15T10:30:00Z"
  }
}
```

---

### Get User's Orders
Retrieve all orders for the current user.

**Request:**
```http
GET /orders
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439030",
    "orderNumber": "ORD-1694783400000-1",
    "userId": "507f1f77bcf86cd799439011",
    "items": [ ... ],
    "total": 439.98,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2023-09-15T10:30:00Z"
  }
]
```

---

### Get Single Order
Retrieve details of a specific order.

**Request:**
```http
GET /orders/507f1f77bcf86cd799439030
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "orderNumber": "ORD-1694783400000-1",
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Wireless Headphones",
      "quantity": 2,
      "price": 199.99,
      "image": "https://example.com/image1.jpg"
    }
  ],
  "shippingAddress": { ... },
  "billingAddress": { ... },
  "subtotal": 399.98,
  "tax": 40.00,
  "shippingCost": 0,
  "total": 439.98,
  "status": "processing",
  "paymentMethod": "stripe",
  "paymentStatus": "completed",
  "trackingNumber": "TRK123456789",
  "createdAt": "2023-09-15T10:30:00Z"
}
```

---

### Update Order Status
Update order status (Admin only).

**Request:**
```http
PUT /orders/507f1f77bcf86cd799439030/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

**Valid statuses:** pending, processing, shipped, delivered, cancelled

**Response (200):**
```json
{
  "message": "Order status updated",
  "order": { ... }
}
```

---

### Update Payment Status
Update payment status (Admin only).

**Request:**
```http
PUT /orders/507f1f77bcf86cd799439030/payment
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "paymentStatus": "completed",
  "stripePaymentId": "pi_1234567890"
}
```

**Valid statuses:** pending, completed, failed, refunded

**Response (200):**
```json
{
  "message": "Payment status updated",
  "order": { ... }
}
```

---

### Get All Orders (Admin)
Retrieve all orders in the system.

**Request:**
```http
GET /orders/admin/all?status=pending&page=1&limit=10
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` - Filter by order status
- `page` - Page number
- `limit` - Items per page

**Response (200):**
```json
{
  "total": 45,
  "page": 1,
  "limit": 10,
  "orders": [ ... ]
}
```

---

## Error Responses

### Validation Error
```json
{
  "errors": [
    {
      "param": "email",
      "msg": "Please provide a valid email"
    }
  ]
}
```

### Authentication Error
```json
{
  "message": "Not authorized to access this route"
}
```

### Not Found Error
```json
{
  "message": "Product not found"
}
```

### Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details here"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes
- **Window:** 15 minutes
- **Applied to:** All endpoints
- **Error Response:**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Pagination Format

All paginated endpoints follow this format:

```json
{
  "total": 100,           // Total number of items
  "page": 1,              // Current page number
  "limit": 12,            // Items per page
  "pages": 9,             // Total number of pages
  "data": [ ... ]         // Array of items
}
```

---

## Filtering & Sorting

### Product Filtering
- `category` - Exact match
- `search` - Full-text search in name, description, tags
- `isActive` - Boolean

### Sorting Options
- `newest` - Latest first (createdAt)
- `price-low` - Lowest price first
- `price-high` - Highest price first
- `rating` - Highest rating first

---

## Constants

### Product Categories
- Electronics
- Clothing
- Books
- Home
- Sports
- Toys

### Order Statuses
- pending
- processing
- shipped
- delivered
- cancelled

### Payment Methods
- stripe
- paypal
- bank_transfer

### Payment Statuses
- pending
- completed
- failed
- refunded

### User Roles
- customer
- admin

---

## Authentication Flow

1. User registers with email and password
2. Password is hashed with bcryptjs
3. System returns JWT token
4. Token stored in browser localStorage
5. Token included in Authorization header for protected requests
6. Backend verifies token signature and expiration
7. If valid, request proceeds; if invalid, returns 401

---

## Best Practices

1. Always include Content-Type header for POST/PUT requests
2. Store token securely (localStorage is basic, use httpOnly cookies for production)
3. Handle expired tokens gracefully
4. Validate input on both frontend and backend
5. Use HTTPS in production
6. Never commit .env files with sensitive data
7. Implement proper error handling
8. Log API requests for debugging

---

## Webhooks (Future)

Planned webhooks for events:
- `order.created`
- `order.shipped`
- `order.delivered`
- `payment.completed`
- `product.low_stock`

---

For more information, see README.md and QUICKSTART.md
