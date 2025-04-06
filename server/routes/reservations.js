const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, guests } = req.body;
    
    if (!name || !email || !phone || !guests) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, phone, and guests are required'
      });
    }

    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : []
    });
  }
});

module.exports = router;