const { db } = require('../config/database');

// Helper to generate readable unique order ID
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `UV-${dateStr}-${randomSuffix}`;
}

// Generate ready-to-send WhatsApp message URL
function buildWhatsAppOrderUrl(whatsappNumber, order, items, storeSettings) {
  const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
  
  let itemListText = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.title}*\n   Size: ${item.size || 'Standard'} | Color: ${item.color || 'As shown'} | Qty: ${item.quantity}\n   Price: ${storeSettings.currency_symbol || '₹'}${item.price * item.quantity}`
    )
    .join('\n\n');

  const text = 
`🛍️ *NEW CLOTHING ORDER: #${order.order_number}*
-----------------------------------------
👤 *Customer Name:* ${order.customer_name}
📞 *Mobile:* ${order.customer_phone}
📍 *Delivery Address:* 
${order.shipping_address}, ${order.city || ''} - ${order.pincode || ''}

📦 *ORDERED ITEMS:*
${itemListText}

-----------------------------------------
💰 *Subtotal:* ${storeSettings.currency_symbol || '₹'}${order.subtotal}
🚚 *Delivery Fee:* ${order.shipping_fee > 0 ? (storeSettings.currency_symbol || '₹') + order.shipping_fee : 'FREE'}
💵 *TOTAL AMOUNT:* ${storeSettings.currency_symbol || '₹'}${order.total_amount}
💳 *Payment Method:* ${order.payment_method.toUpperCase()}
${order.notes ? `📝 *Special Note:* ${order.notes}\n` : ''}-----------------------------------------
Please confirm my order and share estimated dispatch timing! Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// Create new customer order
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      city,
      pincode,
      items,
      payment_method = 'whatsapp',
      notes = ''
    } = req.body;

    if (!customer_name || !customer_phone || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile phone number, and delivery address are required.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items before placing order.'
      });
    }

    // Get current store settings for shipping calculation
    const settings = await db.get('SELECT * FROM store_settings WHERE id = 1') || {
      currency_symbol: '₹',
      shipping_fee: 50,
      free_shipping_threshold: 999,
      whatsapp_number: '919876543210'
    };

    // Calculate subtotal and verify item details
    let subtotal = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [cartItem.id]);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ID #${cartItem.id} no longer exists in catalog.`
        });
      }

      const qty = parseInt(cartItem.quantity) || 1;
      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        size: cartItem.size || '',
        color: cartItem.color || '',
        quantity: qty,
        line_total: itemTotal
      });
    }

    // Calculate shipping
    const shipping_fee = subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_fee;
    const total_amount = subtotal + shipping_fee;
    const order_number = generateOrderNumber();

    const insertResult = await db.run(
      `INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email,
        shipping_address, city, pincode, items, subtotal, shipping_fee,
        total_amount, payment_method, payment_status, order_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        customer_name.trim(),
        customer_phone.trim(),
        (customer_email || '').trim(),
        shipping_address.trim(),
        (city || '').trim(),
        (pincode || '').trim(),
        JSON.stringify(validatedItems),
        subtotal,
        shipping_fee,
        total_amount,
        payment_method,
        payment_method === 'online' ? 'pending' : 'pending',
        'pending',
        notes.trim()
      ]
    );

    const orderData = {
      id: insertResult.lastID,
      order_number,
      customer_name,
      customer_phone,
      shipping_address,
      city,
      pincode,
      subtotal,
      shipping_fee,
      total_amount,
      payment_method,
      order_status: 'pending',
      notes
    };

    const whatsappUrl = buildWhatsAppOrderUrl(settings.whatsapp_number, orderData, validatedItems, settings);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: orderData,
      whatsapp_url: whatsappUrl
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'Server error while processing order' });
  }
};

// Track an order by order number or customer phone
exports.trackOrder = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide Order Number or Phone Number' });
    }

    const cleanQuery = query.trim();
    const rows = await db.all(
      `SELECT * FROM orders 
       WHERE order_number = ? OR customer_phone = ? 
       ORDER BY id DESC LIMIT 5`,
      [cleanQuery, cleanQuery]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found matching this details.' });
    }

    const orders = rows.map((row) => ({
      ...row,
      items: JSON.parse(row.items)
    }));

    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error tracking order:', err);
    res.status(500).json({ success: false, message: 'Server error while tracking order' });
  }
};
