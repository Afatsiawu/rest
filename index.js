const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');

console.log('Starting server...');
console.log('Environment:', config.nodeEnv);
console.log('MongoDB URI:', config.mongodbUri);
console.log('Port:', config.port);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from both root and public directories
app.use(express.static(__dirname)); // Serves files from root directory (CSS, JS)
app.use(express.static(path.join(__dirname, 'server/models/public'))); // Serves files from public directory (HTML, images)

// MongoDB Schema for Reservations
const reservationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    guests: Number,
    date: Date,
    time: String,
    specialRequests: String,
    createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// MongoDB Schema for Orders
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    deliveryNotes: String,
    pickupTime: String,
    orderType: String, // 'delivery' or 'pickup'
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    subtotal: Number,
    deliveryFee: Number,
    tax: Number,
    total: Number,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Connect to MongoDB
mongoose.connect(config.mongodbUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'server/models/public', 'index.html'));
});

// Serve the order page
app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'server/models/public', 'order.html'));
});

// Handle reservation submission
app.post('/api/reservations', async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (error) {
        console.error('Reservation error:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Handle order submission
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});