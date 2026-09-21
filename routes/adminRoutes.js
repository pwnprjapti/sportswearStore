const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin Auth
router.post('/login', adminController.login);

// Protected Admin Dashboard
router.use(verifyAdminToken);

router.get('/stats', adminController.getDashboardStats);

// Products
router.get('/products', adminController.getAdminProducts);
router.post('/products', upload.single('image'), adminController.createProduct);
router.put('/products/:id', upload.single('image'), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getAdminOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Store Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
