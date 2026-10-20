const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user cart
router.get('/', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post(
  '/add',
  protect,
  [
    body('productId', 'Product ID is required').notEmpty(),
    body('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      let cart = await Cart.findOne({ userId: req.user._id });

      if (!cart) {
        cart = new Cart({ userId: req.user._id, items: [] });
      }

      const existingItem = cart.items.find((item) => item.productId.toString() === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: product.price,
        });
      }

      cart.updatedAt = Date.now();
      await cart.save();

      res.status(201).json({
        message: 'Item added to cart',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update cart item quantity
router.put(
  '/item/:productId',
  protect,
  [body('quantity', 'Quantity must be at least 1').isInt({ min: 1 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { quantity } = req.body;
      const { productId } = req.params;

      const cart = await Cart.findOne({ userId: req.user._id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const item = cart.items.find((item) => item.productId.toString() === productId);
      if (!item) {
        return res.status(404).json({ message: 'Item not in cart' });
      }

      const product = await Product.findById(productId);
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      item.quantity = quantity;
      cart.updatedAt = Date.now();
      await cart.save();

      res.json({
        message: 'Cart updated',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Remove item from cart
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
