const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);
}

// 1. Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username.trim()]);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      admin: { id: admin.id, username: admin.username }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// 2. Dashboard Analytics & Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrdersRow = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalRevenueRow = await db.get(
      "SELECT SUM(total_amount) as total FROM orders WHERE order_status != 'cancelled'"
    );
    const pendingOrdersRow = await db.get(
      "SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'"
    );
    const totalProductsRow = await db.get('SELECT COUNT(*) as count FROM products');

    const lowStockProducts = await db.all(
      'SELECT id, title, category, stock, price, image_url FROM products WHERE stock <= 5 ORDER BY stock ASC'
    );

    const recentOrdersRaw = await db.all(
      'SELECT * FROM orders ORDER BY id DESC LIMIT 6'
    );

    const recentOrders = recentOrdersRaw.map((o) => ({
      ...o,
      items: JSON.parse(o.items)
    }));

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrdersRow ? totalOrdersRow.count : 0,
        totalRevenue: (totalRevenueRow && totalRevenueRow.total) ? totalRevenueRow.total : 0,
        pendingOrders: pendingOrdersRow ? pendingOrdersRow.count : 0,
        totalProducts: totalProductsRow ? totalProductsRow.count : 0,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Server error fetching statistics' });
  }
};

// 3. Admin Products Management
exports.getAdminProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let conditions = [];
    let params = [];

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    let whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT * FROM products ${whereClause} ORDER BY id DESC`;

    const rows = await db.all(sql, params);
    const products = rows.map((r) => ({
      ...r,
      sizes: r.sizes ? JSON.parse(r.sizes) : [],
      colors: r.colors ? JSON.parse(r.colors) : [],
      additional_images: r.additional_images ? JSON.parse(r.additional_images) : []
    }));

    res.json({ success: true, products });
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// 4. Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      category, // 'men' or 'kids'
      subcategory,
      description,
      price,
      original_price,
      sizes, // can be array or JSON string or comma-separated
      colors,
      stock = 10,
      image_url,
      is_featured = 0,
      is_bestseller = 0,
      badge = ''
    } = req.body;

    if (!title || !category || !price) {
      return res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
    }

    // Handle image from file upload or URL
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
    }

    // Parse sizes
    let parsedSizes = [];
    if (Array.isArray(sizes)) {
      parsedSizes = sizes;
    } else if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = sizes.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    // Default sizes based on category if empty
    if (parsedSizes.length === 0) {
      parsedSizes = category === 'men' ? ['M', 'L', 'XL'] : ['3-4Y', '5-6Y', '7-8Y'];
    }

    // Parse colors
    let parsedColors = [];
    if (Array.isArray(colors)) {
      parsedColors = colors;
    } else if (typeof colors === 'string') {
      try {
        parsedColors = JSON.parse(colors);
      } catch (e) {
        parsedColors = colors.split(',').map((c) => c.trim()).filter(Boolean);
      }
    }

    const slug = slugify(title);

    const result = await db.run(
      `INSERT INTO products (
        title, slug, category, subcategory, description, price,
        original_price, sizes, colors, stock, image_url,
        additional_images, is_featured, is_bestseller, badge
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        slug,
        category.toLowerCase(),
        subcategory || (category === 'men' ? 'mens-shirts' : 'boys-casuals'),
        description || '',
        parseFloat(price),
        original_price ? parseFloat(original_price) : null,
        JSON.stringify(parsedSizes),
        JSON.stringify(parsedColors),
        parseInt(stock) || 10,
        finalImageUrl,
        JSON.stringify([]),
        is_featured ? 1 : 0,
        is_bestseller ? 1 : 0,
        badge || ''
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      productId: result.lastID
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, message: 'Failed to create product: ' + err.message });
  }
};

// 5. Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      subcategory,
      description,
      price,
      original_price,
      sizes,
      colors,
      stock,
      image_url,
      is_featured,
      is_bestseller,
      badge
    } = req.body;

    const existing = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let finalImageUrl = existing.image_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (image_url) {
      finalImageUrl = image_url;
    }

    let parsedSizes = existing.sizes;
    if (sizes) {
      if (Array.isArray(sizes)) parsedSizes = JSON.stringify(sizes);
      else if (typeof sizes === 'string') {
        try {
          parsedSizes = JSON.stringify(JSON.parse(sizes));
        } catch {
          parsedSizes = JSON.stringify(sizes.split(',').map((s) => s.trim()).filter(Boolean));
        }
      }
    }

    let parsedColors = existing.colors;
    if (colors) {
      if (Array.isArray(colors)) parsedColors = JSON.stringify(colors);
      else if (typeof colors === 'string') {
        try {
          parsedColors = JSON.stringify(JSON.parse(colors));
        } catch {
          parsedColors = JSON.stringify(colors.split(',').map((c) => c.trim()).filter(Boolean));
        }
      }
    }

    await db.run(
      `UPDATE products SET
        title = ?, category = ?, subcategory = ?, description = ?,
        price = ?, original_price = ?, sizes = ?, colors = ?,
        stock = ?, image_url = ?, is_featured = ?, is_bestseller = ?,
        badge = ?
      WHERE id = ?`,
      [
        title ? title.trim() : existing.title,
        category ? category.toLowerCase() : existing.category,
        subcategory || existing.subcategory,
        description !== undefined ? description : existing.description,
        price ? parseFloat(price) : existing.price,
        original_price !== undefined ? (original_price ? parseFloat(original_price) : null) : existing.original_price,
        parsedSizes,
        parsedColors,
        stock !== undefined ? parseInt(stock) : existing.stock,
        finalImageUrl,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : existing.is_bestseller,
        badge !== undefined ? badge : existing.badge,
        id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// 6. Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

// 7. Orders Management
exports.getAdminOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let conditions = [];
    let params = [];

    if (status && status !== 'all') {
      conditions.push('order_status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    let whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT * FROM orders ${whereClause} ORDER BY id DESC`;

    const rows = await db.all(sql, params);
    const orders = rows.map((o) => ({
      ...o,
      items: JSON.parse(o.items)
    }));

    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

// 8. Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    let updates = [];
    let params = [];

    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No status update provided' });
    }

    params.push(id);
    await db.run(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
};

// 9. Store Settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await db.get('SELECT * FROM store_settings WHERE id = 1');
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, message: 'Server error fetching store settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      store_name,
      store_tagline,
      store_phone,
      whatsapp_number,
      store_email,
      store_address,
      currency_symbol,
      shipping_fee,
      free_shipping_threshold,
      announcement_bar,
      upi_id
    } = req.body;

    await db.run(
      `UPDATE store_settings SET
        store_name = ?, store_tagline = ?, store_phone = ?,
        whatsapp_number = ?, store_email = ?, store_address = ?,
        currency_symbol = ?, shipping_fee = ?, free_shipping_threshold = ?,
        announcement_bar = ?, upi_id = ?
      WHERE id = 1`,
      [
        store_name,
        store_tagline,
        store_phone,
        whatsapp_number,
        store_email,
        store_address,
        currency_symbol || '₹',
        parseFloat(shipping_fee) || 0,
        parseFloat(free_shipping_threshold) || 0,
        announcement_bar,
        upi_id
      ]
    );

    res.json({ success: true, message: 'Store settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};
