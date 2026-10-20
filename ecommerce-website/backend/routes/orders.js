const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Calculate tax and shipping
const calculateTax = (subtotal) => subtotal * 0.1;
const calculateShipping = (subtotal) => (subtotal > 100 ? 0 : 10);

// Create order from cart
router.post(
  '/',
  protect,
  [
    body('shippingAddress', 'Shipping address is required').notEmpty(),
    body('billingAddress', 'Billing address is required').notEmpty(),
    body('paymentMethod', 'Payment method is required').isIn(['stripe', 'paypal', 'bank_transfer']),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { shippingAddress, billingAddress, paymentMethod } = req.body;

      const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Check stock and prepare order items
      const orderItems = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);

        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.productId.name}`,
          });
        }

        orderItems.push({
          productId: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: item.price,
          image: product.images[0]?.url,
        });
      }

      const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      const tax = calculateTax(subtotal);
      const shippingCost = calculateShipping(subtotal);
      const total = subtotal + tax + shippingCost;

      const order = new Order({
        userId: req.user._id,
        items: orderItems,
        shippingAddress,
        billingAddress,
        subtotal,
        tax,
        shippingCost,
        total,
        paymentMethod,
        paymentStatus: 'pending',
      });

      await order.save();

      // Update product stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user orders
router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get single order
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Update order status (admin only)
router.put('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    next(error);
  }
});

// Mark payment as completed (admin only)
router.put('/:id/payment', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { paymentStatus, stripePaymentId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, stripePaymentId, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Payment status updated',
      order,
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders (admin only)
router.get('/admin/all', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      orders,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
