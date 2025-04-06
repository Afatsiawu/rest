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

// Get all reservations
app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Handle reservation submission
app.post('/api/reservations', async (req, res) => {
    try {
        // Basic validation
        const { name, email, phone, guests, date, time } = req.body;
        
        if (!name || !email || !phone || !guests || !date || !time) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate phone number (basic check)
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Validate guests number
        if (guests < 1 || guests > 20) {
            return res.status(400).json({ error: 'Number of guests must be between 1 and 20' });
        }

        // Validate date and time
        const reservationDate = new Date(date);
        if (isNaN(reservationDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json({ 
            message: 'Reservation created successfully', 
            reservation: {
                id: reservation._id,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                guests: reservation.guests,
                date: reservation.date,
                time: reservation.time,
                specialRequests: reservation.specialRequests
            }
        });
    } catch (error) {
        console.error('Reservation error:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Handle order submission
app.post('/api/orders', async (req, res) => {
    try {
        // Basic validation
        const { name, email, phone, orderType, items } = req.body;
        
        if (!name || !email || !phone || !orderType || !items || items.length === 0) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate phone number (basic check)
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Validate order type
        if (!['delivery', 'pickup'].includes(orderType)) {
            return res.status(400).json({ error: 'Invalid order type' });
        }

        // Validate delivery information if order type is delivery
        if (orderType === 'delivery') {
            const { address, city, postalCode } = req.body;
            if (!address || !city || !postalCode) {
                return res.status(400).json({ error: 'Delivery address information is required' });
            }
        }

        // Validate pickup time if order type is pickup
        if (orderType === 'pickup') {
            const { pickupTime } = req.body;
            if (!pickupTime) {
                return res.status(400).json({ error: 'Pickup time is required' });
            }
        }

        // Validate items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'At least one item must be ordered' });
        }

        for (const item of items) {
            if (!item.name || !item.price || !item.quantity) {
                return res.status(400).json({ error: 'Each item must have a name, price, and quantity' });
            }
            if (item.quantity < 1) {
                return res.status(400).json({ error: 'Item quantity must be at least 1' });
            }
        }

        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ 
            message: 'Order created successfully', 
            order: {
                id: order._id,
                name: order.name,
                email: order.email,
                phone: order.phone,
                orderType: order.orderType,
                items: order.items,
                subtotal: order.subtotal,
                deliveryFee: order.deliveryFee,
                tax: order.tax,
                total: order.total,
                status: order.status
            }
        });
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