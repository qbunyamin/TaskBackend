const express = require('express');
const router = express.Router();
const Order = require('../db/models/Order');

// Create a new order
router.post('/create', async (req, res) => {
    try {
        const { columnIds } = req.body;

        const newOrder = new Order({
            columnIds: columnIds
        });

        await newOrder.save();

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all orders
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.status(200).json({ success: true, orders: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update an existing order
router.put('/:id/update', async (req, res) => {
    try {
        const { id } = req.params;
        const { columnIds } = req.body;

        await Order.findByIdAndUpdate(id, { columnIds: columnIds });

        res.status(200).json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete an order
router.delete('/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;

        await Order.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
