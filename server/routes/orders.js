const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items, total, customer } = req.body;
    
    if (!items || !total || !customer) {
      return res.status(400).json({ 
        error: 'Missing required fields: items, total, and customer are required' 
      });
    }

    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : []
    });
  }
});

module.exports = router;