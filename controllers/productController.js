const { db } = require('../config/database');

// Format JSON fields in product row
function formatProduct(row) {
  if (!row) return null;
  return {
    ...row,
    sizes: row.sizes ? JSON.parse(row.sizes) : [],
    colors: row.colors ? JSON.parse(row.colors) : [],
    additional_images: row.additional_images ? JSON.parse(row.additional_images) : [],
    is_featured: Boolean(row.is_featured),
    is_bestseller: Boolean(row.is_bestseller)
  };
}

// Get products with comprehensive filtering & sorting
exports.getProducts = async (req, res) => {
  try {
    const { category, subcategory, size, search, sort, featured, bestseller, limit = 50, offset = 0 } = req.query;

    let conditions = [];
    let params = [];

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category.toLowerCase());
    }

    if (subcategory) {
      conditions.push('subcategory = ?');
      params.push(subcategory);
    }

    if (featured === '1' || featured === 'true') {
      conditions.push('is_featured = 1');
    }

    if (bestseller === '1' || bestseller === 'true') {
      conditions.push('is_bestseller = 1');
    }

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (size) {
      conditions.push('sizes LIKE ?');
      params.push(`%"${size}"%`);
    }

    let whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    let orderBy = 'ORDER BY id DESC';
    if (sort === 'price-low') orderBy = 'ORDER BY price ASC';
    else if (sort === 'price-high') orderBy = 'ORDER BY price DESC';
    else if (sort === 'bestseller') orderBy = 'ORDER BY is_bestseller DESC, id DESC';
    else if (sort === 'newest') orderBy = 'ORDER BY created_at DESC';

    const sql = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const rows = await db.all(sql, params);
    const products = rows.map(formatProduct);

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const countRow = await db.get(countSql, params.slice(0, -2));

    res.json({
      success: true,
      total: countRow ? countRow.total : products.length,
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// Get single product by slug or ID
exports.getProductBySlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    let product;

    if (!isNaN(identifier)) {
      product = await db.get('SELECT * FROM products WHERE id = ?', [identifier]);
    } else {
      product = await db.get('SELECT * FROM products WHERE slug = ?', [identifier]);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const formatted = formatProduct(product);

    // Fetch related products in the same category
    const relatedRows = await db.all(
      'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4',
      [product.category, product.id]
    );

    res.json({
      success: true,
      product: formatted,
      related: relatedRows.map(formatProduct)
    });
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const { group } = req.query; // 'men', 'kids'
    let sql = 'SELECT * FROM categories';
    let params = [];

    if (group) {
      sql += ' WHERE parent_group = ?';
      params.push(group.toLowerCase());
    }

    sql += ' ORDER BY id ASC';
    const categories = await db.all(sql, params);

    res.json({ success: true, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};
