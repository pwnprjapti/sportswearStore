/**
 * ProActive / Cult.Sport LocalStorage Engine
 * 100% Client-side data management for instant zero-backend demo & testing.
 */

const DEFAULT_SETTINGS = {
  store_name: 'ProActive Sports | Men & Kids Activewear',
  store_tagline: 'High-Performance Gym, Sports & Training Wear for Men & Kids',
  store_phone: '+91 98765 43210',
  whatsapp_number: '919876543210',
  store_email: 'orders@proactivesports.in',
  store_address: 'Shop #8, Stadium Commercial Plaza, Sports Complex Road, New Delhi - 110002',
  currency_symbol: '₹',
  shipping_fee: 50,
  free_shipping_threshold: 799,
  announcement_bar: '⚡ Sports Season Sale: Free Delivery on orders above ₹799! Order directly on WhatsApp for Instant Dispatch.',
  upi_id: 'proactivesports@upi'
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Gym & Training Tees', slug: 'men-gym-tees', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Track Pants & Joggers', slug: 'men-track-pants', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Running & Workout Shorts', slug: 'men-running-shorts', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Jerseys & Compression', slug: 'men-jerseys', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: "Boys' Athletic Sets", slug: 'kids-training-sets', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: "Girls' Active Tracksuits", slug: 'kids-tracksuits', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Football & Cricket Kits', slug: 'kids-sports-jerseys', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=600&q=80' },
  { id: 8, name: 'School Sports & PE Wear', slug: 'kids-pe-wear', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1508215885820-4523e431397b?auto=format&fit=crop&w=600&q=80' }
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    title: 'Pro-Dri Breathable Gym & Training T-Shirt',
    slug: 'pro-dri-breathable-gym-training-tshirt',
    category: 'men',
    subcategory: 'men-gym-tees',
    description: 'Engineered with quick-drying micro-mesh fabric that wicks sweat away from the body during intense gym, cardio, and weight training sessions. Anti-odor and 4-way stretchable.',
    price: 499,
    original_price: 999,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Carbon Black', 'Steel Grey', 'Electric Blue', 'Military Green'],
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 1,
    badge: 'DRI-FIT 50% OFF'
  },
  {
    id: 2,
    title: '4-Way Stretch Performance Track Pants',
    slug: '4-way-stretch-performance-track-pants',
    category: 'men',
    subcategory: 'men-track-pants',
    description: 'Tapered athletic joggers crafted from lightweight stretch polyester-spandex blend. Features deep zippered side pockets to keep mobile secure during running and workouts.',
    price: 799,
    original_price: 1499,
    sizes: ['30 (S)', '32 (M)', '34 (L)', '36 (XL)'],
    colors: ['Jet Black', 'Charcoal Melange', 'Deep Navy'],
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 1,
    badge: 'HOT SELLER'
  },
  {
    id: 3,
    title: '2-in-1 Running Shorts with Compression Liner',
    slug: '2-in-1-running-shorts-with-compression-liner',
    category: 'men',
    subcategory: 'men-running-shorts',
    description: 'Lightweight outer running shorts paired with a built-in anti-chafing compression inner layer. Includes towel loop and hidden interior phone pocket.',
    price: 599,
    original_price: 1199,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Pitch Black', 'Slate Grey', 'Camo Army'],
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 0,
    badge: '2-IN-1 LINER'
  },
  {
    id: 4,
    title: 'Pro Compression Thermal Base-Layer Skin',
    slug: 'pro-compression-thermal-base-layer-skin',
    category: 'men',
    subcategory: 'men-jerseys',
    description: 'Graduated muscle compression base-layer to boost circulation, reduce muscle soreness, and support rapid post-workout recovery. Second-skin fit with flatlock seams.',
    price: 649,
    original_price: 1299,
    sizes: ['M', 'L', 'XL'],
    colors: ['Stealth Black', 'Pure White'],
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 0,
    is_bestseller: 1,
    badge: 'PRO COMPRESSION'
  },
  {
    id: 5,
    title: 'Ultra-Light Sports Windbreaker Jacket',
    slug: 'ultra-light-sports-windbreaker-jacket',
    category: 'men',
    subcategory: 'men-gym-tees',
    description: 'Packable water-resistant and windproof athletic running jacket with reflective safety strips for early morning runs or night cycling. Mesh underarm ventilation.',
    price: 999,
    original_price: 1999,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Neon Lime', 'Shadow Black', 'Cobalt Blue'],
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 0,
    badge: 'WEATHER-PROOF'
  },
  {
    id: 6,
    title: 'Cricket & Multi-Sport Performance Jersey',
    slug: 'cricket-multi-sport-performance-jersey',
    category: 'men',
    subcategory: 'men-jerseys',
    description: 'Sublimated interlock polyester sports jersey built for match day. Lightweight, highly breathable fabric keeps players cool and comfortable through all 40 overs.',
    price: 549,
    original_price: 999,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Royal Blue & Gold', 'India Blue', 'White Test Match'],
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 0,
    is_bestseller: 1,
    badge: 'MATCH DAY'
  },
  {
    id: 7,
    title: "Boys' Quick-Dry Football Jersey & Shorts Set",
    slug: 'boys-quick-dry-football-jersey-shorts-set',
    category: 'kids',
    subcategory: 'kids-sports-jerseys',
    description: 'Complete 2-piece soccer training kit with moisture-wicking breathable jersey and elastic drawstring shorts. Designed for school football academy and daily turf play.',
    price: 599,
    original_price: 1099,
    sizes: ['4-5 Years', '6-7 Years', '8-9 Years', '10-11 Years', '12-13 Years'],
    colors: ['Striker Red', 'Neon Blue', 'Gold & Black'],
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 1,
    badge: 'SOCCER KIT'
  },
  {
    id: 8,
    title: "Girls' Athletic Stretch Tracksuit (Jacket & Jogger)",
    slug: 'girls-athletic-stretch-tracksuit-jacket-jogger',
    category: 'kids',
    subcategory: 'kids-tracksuits',
    description: 'Super-comfortable, flexible zip-up athletic tracksuit set for young champions. Ideal for morning athletics practice, skating, gymnastics, and school travel.',
    price: 849,
    original_price: 1599,
    sizes: ['5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years'],
    colors: ['Berry Pink & Navy', 'Lilac & Grey'],
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 1,
    badge: 'BESTSELLER'
  },
  {
    id: 9,
    title: "Kids' All-Sport Breathable PE & Training T-Shirt",
    slug: 'kids-all-sport-breathable-pe-training-tshirt',
    category: 'kids',
    subcategory: 'kids-pe-wear',
    description: 'Lightweight 100% micro-polyester sports tee suitable for school Sports Day, cricket coaching, and outdoor recreation. Non-abrasive soft flat-lock seams.',
    price: 349,
    original_price: 699,
    sizes: ['3-4 Years', '5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years'],
    colors: ['Safety Orange', 'Vibrant Yellow', 'Royal Blue', 'Red'],
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1508215885820-4523e431397b?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 1,
    is_bestseller: 0,
    badge: 'PE SPORTS'
  },
  {
    id: 10,
    title: "Boys' Basketball Mesh Sleeveless Jersey & Shorts",
    slug: 'boys-basketball-mesh-sleeveless-jersey-shorts',
    category: 'kids',
    subcategory: 'kids-training-sets',
    description: 'Airflow open-mesh basketball coordinates set with ribbed neck and armholes. Rapid dry fabric guarantees lightweight freedom of movement on court.',
    price: 549,
    original_price: 999,
    sizes: ['5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years'],
    colors: ['Chicago Red & White', 'Black & Gold'],
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 0,
    is_bestseller: 1,
    badge: 'BASKETBALL SET'
  },
  {
    id: 11,
    title: "Kids' Athletic Compression Leggings & Shorts Combo",
    slug: 'kids-athletic-compression-leggings-shorts-combo',
    category: 'kids',
    subcategory: 'kids-training-sets',
    description: '2-in-1 athletic tights with shorts overlay. Protects young knees from turf burns while providing moisture-wicking muscle warmth for football and running.',
    price: 499,
    original_price: 899,
    sizes: ['5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years'],
    colors: ['Solid Black', 'Charcoal Grey'],
    stock: 28,
    image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 0,
    is_bestseller: 0,
    badge: 'TURF SAFE'
  },
  {
    id: 12,
    title: "Toddlers' Active Cotton Sports Track Set",
    slug: 'toddlers-active-cotton-sports-track-set',
    category: 'kids',
    subcategory: 'kids-tracksuits',
    description: 'Soft combed cotton fleece sports sweatshirt and jogger pants set for active toddlers. Soft elastic waistband allows easy movement and non-restrictive all-day play.',
    price: 499,
    original_price: 899,
    sizes: ['1-2 Years', '2-3 Years', '3-4 Years'],
    colors: ['Athletic Grey & Navy', 'Mustard & Olive'],
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
    additional_images: [],
    is_featured: 0,
    is_bestseller: 0,
    badge: 'BABY ATHLETE'
  }
];

const DEFAULT_ORDERS = [
  {
    id: 1,
    order_number: 'CS-9481',
    customer_name: 'Rahul Sharma',
    customer_phone: '9876543210',
    customer_email: 'rahul.sharma@example.com',
    shipping_address: 'Flat 402, Green Valley Apts, Sector 62',
    city: 'Noida',
    pincode: '201301',
    items: [
      { id: 1, title: 'Pro-Dri Breathable Gym & Training T-Shirt', size: 'L', color: 'Carbon Black', price: 499, quantity: 1, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80' }
    ],
    subtotal: 499,
    shipping_fee: 50,
    total_amount: 549,
    payment_method: 'whatsapp',
    payment_status: 'pending',
    order_status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    order_number: 'CS-9482',
    customer_name: 'Pooja Verma',
    customer_phone: '9811223344',
    customer_email: 'pooja.verma@example.com',
    shipping_address: 'B-12, Palm Meadows, Whitefield',
    city: 'Bengaluru',
    pincode: '560066',
    items: [
      { id: 8, title: "Girls' Athletic Stretch Tracksuit (Jacket & Jogger)", size: '7-8 Years', color: 'Berry Pink & Navy', price: 849, quantity: 1, image_url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=800&q=80' }
    ],
    subtotal: 849,
    shipping_fee: 0,
    total_amount: 849,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'shipped',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 3,
    order_number: 'CS-9483',
    customer_name: 'Amit Patel',
    customer_phone: '9900112233',
    customer_email: 'amit.patel@example.com',
    shipping_address: '14/B, Navrangpura Complex, CG Road',
    city: 'Ahmedabad',
    pincode: '380009',
    items: [
      { id: 7, title: "Boys' Quick-Dry Football Jersey & Shorts Set", size: '8-9 Years', color: 'Striker Red', price: 599, quantity: 1, image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80' }
    ],
    subtotal: 599,
    shipping_fee: 50,
    total_amount: 649,
    payment_method: 'upi',
    payment_status: 'paid',
    order_status: 'delivered',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const KEYS = {
  SETTINGS: 'proactive_settings_v2',
  CATEGORIES: 'proactive_categories_v2',
  PRODUCTS: 'proactive_products_v2',
  ORDERS: 'proactive_orders_v2',
  TOKEN: 'urbanvogue_admin_token'
};

const Store = {
  init() {
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    }
  },

  resetDemoData() {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    return true;
  },

  // === SETTINGS ===
  getSettings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  },

  // === CATEGORIES ===
  getCategories() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(KEYS.CATEGORIES)) || DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  // === PRODUCTS ===
  getProducts(filters = {}) {
    this.init();
    let prods = [];
    try {
      prods = JSON.parse(localStorage.getItem(KEYS.PRODUCTS)) || DEFAULT_PRODUCTS;
    } catch {
      prods = DEFAULT_PRODUCTS;
    }

    if (filters.category && filters.category !== 'all') {
      prods = prods.filter(p => p.category === filters.category);
    }

    if (filters.subcategory) {
      prods = prods.filter(p => p.subcategory === filters.subcategory);
    }

    if (filters.size) {
      prods = prods.filter(p => (p.sizes || []).some(s => s.toLowerCase().includes(filters.size.toLowerCase())));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      prods = prods.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }

    if (filters.bestseller === '1' || filters.bestseller === true) {
      prods = prods.filter(p => p.is_bestseller == 1);
    }

    if (filters.featured === '1' || filters.featured === true) {
      prods = prods.filter(p => p.is_featured == 1);
    }

    if (filters.sort) {
      if (filters.sort === 'price-low') {
        prods.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price-high') {
        prods.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'discount') {
        prods.sort((a, b) => {
          const discA = (a.original_price && a.original_price > a.price) ? ((a.original_price - a.price) / a.original_price) : 0;
          const discB = (b.original_price && b.original_price > b.price) ? ((b.original_price - b.price) / b.original_price) : 0;
          return discB - discA;
        });
      } else {
        // newest default (by id descending)
        prods.sort((a, b) => b.id - a.id);
      }
    }

    return prods;
  },

  getProductById(id) {
    const prods = this.getProducts();
    return prods.find(p => p.id == id) || null;
  },

  saveProduct(data) {
    const prods = this.getProducts();
    const id = data.id ? parseInt(data.id) : null;

    const formattedProduct = {
      ...data,
      price: parseFloat(data.price) || 0,
      original_price: data.original_price ? parseFloat(data.original_price) : null,
      stock: parseInt(data.stock) || 0,
      sizes: Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? data.sizes.split(',').map(s => s.trim()).filter(Boolean) : []),
      colors: Array.isArray(data.colors) ? data.colors : (typeof data.colors === 'string' ? data.colors.split(',').map(s => s.trim()).filter(Boolean) : []),
      is_featured: data.is_featured ? 1 : 0,
      is_bestseller: data.is_bestseller ? 1 : 0
    };

    if (id) {
      const idx = prods.findIndex(p => p.id === id);
      if (idx !== -1) {
        prods[idx] = { ...prods[idx], ...formattedProduct, id };
      }
    } else {
      const newId = prods.length > 0 ? Math.max(...prods.map(p => p.id)) + 1 : 1;
      const slug = (data.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + newId;
      prods.unshift({
        ...formattedProduct,
        id: newId,
        slug: data.slug || slug,
        created_at: new Date().toISOString()
      });
    }

    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(prods));
    return formattedProduct;
  },

  deleteProduct(id) {
    let prods = this.getProducts();
    prods = prods.filter(p => p.id != id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(prods));
    return true;
  },

  // === ORDERS ===
  getOrders(filters = {}) {
    this.init();
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem(KEYS.ORDERS)) || DEFAULT_ORDERS;
    } catch {
      orders = DEFAULT_ORDERS;
    }

    if (filters.status && filters.status !== 'all') {
      orders = orders.filter(o => o.order_status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q)
      );
    }

    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return orders;
  },

  createOrder(orderData) {
    const settings = this.getSettings();
    const orders = this.getOrders();

    const items = orderData.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const threshold = settings.free_shipping_threshold || 799;
    const shipping_fee = subtotal >= threshold ? 0 : (settings.shipping_fee || 50);
    const total_amount = subtotal + shipping_fee;

    const orderNumber = 'CS-' + Math.floor(10000 + Math.random() * 90000);

    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      order_number: orderNumber,
      customer_name: orderData.customer_name || 'Customer',
      customer_phone: orderData.customer_phone || '',
      customer_email: orderData.customer_email || '',
      shipping_address: orderData.shipping_address || '',
      city: orderData.city || '',
      pincode: orderData.pincode || '',
      items,
      subtotal,
      shipping_fee,
      total_amount,
      payment_method: orderData.payment_method || 'whatsapp',
      payment_status: 'pending',
      order_status: 'pending',
      created_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    // Deduct stock in products
    const prods = this.getProducts();
    items.forEach(it => {
      const p = prods.find(prod => prod.id == it.id);
      if (p && p.stock > 0) {
        p.stock = Math.max(0, p.stock - it.quantity);
      }
    });
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(prods));

    // Build WhatsApp URL
    const cleanPhone = (settings.whatsapp_number || '919876543210').replace(/[^0-9]/g, '');
    const curr = settings.currency_symbol || '₹';
    const itemsList = items.map(i => `• ${i.title} (${i.size || 'Free Size'}) x${i.quantity} = ${curr}${i.price * i.quantity}`).join('\n');
    const msg =
`🛍️ *NEW ORDER: #${orderNumber}*
----------------------------------------
*Customer:* ${newOrder.customer_name}
*Phone:* ${newOrder.customer_phone}
*Address:* ${newOrder.shipping_address}, ${newOrder.city} - ${newOrder.pincode}

*Items:*
${itemsList}

*Subtotal:* ${curr}${subtotal}
*Delivery:* ${shipping_fee === 0 ? 'FREE' : curr + shipping_fee}
*Grand Total:* ${curr}${total_amount}
*Payment Mode:* ${newOrder.payment_method.toUpperCase()}
----------------------------------------
Please confirm and dispatch!`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

    return {
      success: true,
      order: newOrder,
      whatsapp_url: whatsappUrl
    };
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const o = orders.find(ord => ord.id == orderId);
    if (o) {
      o.order_status = newStatus;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  trackOrder(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    const orders = this.getOrders();
    return orders.filter(o =>
      o.order_number.toLowerCase() === q ||
      o.customer_phone.toLowerCase().includes(q)
    );
  },

  // === DASHBOARD STATS ===
  getStats() {
    const orders = this.getOrders();
    const products = this.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
    const totalProducts = products.length;

    const lowStockProducts = products.filter(p => p.stock <= 5);
    const recentOrders = orders.slice(0, 5);

    return {
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts
      },
      lowStockProducts,
      recentOrders
    };
  },

  // === ADMIN AUTH ===
  adminLogin(username, password) {
    if ((username === 'admin' && password === 'admin123') || (username === 'admin' && password === 'admin')) {
      const token = 'demo_admin_jwt_' + Date.now();
      localStorage.setItem(KEYS.TOKEN, token);
      return { success: true, token };
    }
    return { success: false, message: 'Invalid credentials. Use admin / admin123' };
  },

  verifyAdmin() {
    return Boolean(localStorage.getItem(KEYS.TOKEN));
  },

  adminLogout() {
    localStorage.removeItem(KEYS.TOKEN);
  }
};

// Auto-initialize on load
Store.init();
window.Store = Store;
