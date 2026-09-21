const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public catalog routes
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:identifier', productController.getProductBySlug);

module.exports = router;
