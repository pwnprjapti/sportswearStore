const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Public order placement and tracking
router.post('/checkout', orderController.createOrder);
router.get('/track', orderController.trackOrder);

module.exports = router;
