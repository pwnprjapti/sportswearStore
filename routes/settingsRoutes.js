const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// Public settings route for storefront
router.get('/', async (req, res) => {
  try {
    const settings = await db.get(
      `SELECT id, store_name, store_tagline, store_phone, whatsapp_number,
              store_email, store_address, currency_symbol, shipping_fee,
              free_shipping_threshold, announcement_bar
       FROM store_settings WHERE id = 1`
    );
    res.json({ success: true, settings: settings || {} });
  } catch (err) {
    console.error('Error fetching public store settings:', err);
    res.status(500).json({ success: false, message: 'Could not fetch store settings' });
  }
});

module.exports = router;
