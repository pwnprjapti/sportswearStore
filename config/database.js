const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'store.db');
const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Promisified database interface
const db = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  raw: rawDb
};

async function initSchema() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL, -- 'men' or 'kids'
      subcategory TEXT NOT NULL, -- e.g. 'shirts', 'tshirts', 'jeans', 'boys', 'girls', 'toddler'
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      sizes TEXT NOT NULL, -- JSON array
      colors TEXT, -- JSON array
      stock INTEGER DEFAULT 20,
      image_url TEXT NOT NULL,
      additional_images TEXT, -- JSON array
      is_featured INTEGER DEFAULT 0,
      is_bestseller INTEGER DEFAULT 0,
      badge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      parent_group TEXT NOT NULL, -- 'men' or 'kids'
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      shipping_address TEXT NOT NULL,
      city TEXT,
      pincode TEXT,
      items TEXT NOT NULL, -- JSON string
      subtotal REAL NOT NULL,
      shipping_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'whatsapp', 'cod', 'online'
      payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
      order_status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY,
      store_name TEXT NOT NULL,
      store_tagline TEXT,
      store_phone TEXT,
      whatsapp_number TEXT,
      store_email TEXT,
      store_address TEXT,
      currency_symbol TEXT DEFAULT '₹',
      shipping_fee REAL DEFAULT 50,
      free_shipping_threshold REAL DEFAULT 999,
      announcement_bar TEXT,
      upi_id TEXT
    );
  `);

  console.log('Database tables verified/initialized.');
}

module.exports = { db, initSchema };
