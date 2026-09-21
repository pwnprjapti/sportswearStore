const bcrypt = require('bcryptjs');
const { db, initSchema } = require('../config/database');

async function seed() {
  try {
    await initSchema();

    // 1. Seed Store Settings for Sports Wear Niche
    await db.run('DELETE FROM store_settings');
    await db.run(
      `INSERT INTO store_settings (
        id, store_name, store_tagline, store_phone, whatsapp_number,
        store_email, store_address, currency_symbol, shipping_fee,
        free_shipping_threshold, announcement_bar, upi_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'ProActive Sports | Men & Kids Activewear',
        'High-Performance Gym, Sports & Training Wear for Men & Kids',
        '+91 98765 43210',
        '919876543210',
        'orders@proactivesports.in',
        'Shop #8, Stadium Commercial Plaza, Sports Complex Road, New Delhi - 110002',
        '₹',
        50,
        799,
        '⚡ Sports Season Sale: Free Delivery on orders above ₹799! Order directly on WhatsApp for Instant Dispatch.',
        'proactivesports@upi'
      ]
    );
    console.log('✓ Sports store settings seeded');

    // 2. Default Admin
    const existingAdmin = await db.get('SELECT id FROM admins WHERE username = ?', ['admin']);
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', passwordHash]);
      console.log('✓ Default admin created');
    }

    // 3. Clear and Seed Sports Categories (Men & Kids Only)
    await db.run('DELETE FROM categories');
    const categories = [
      // Men's Sports
      { name: 'Gym & Training Tees', slug: 'men-gym-tees', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Track Pants & Joggers', slug: 'men-track-pants', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80' },
      { name: 'Running & Workout Shorts', slug: 'men-running-shorts', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&w=600&q=80' },
      { name: 'Jerseys & Compression', slug: 'men-jerseys', parent_group: 'men', image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
      // Kids' Sports
      { name: "Boys' Athletic Sets", slug: 'kids-training-sets', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80' },
      { name: "Girls' Active Tracksuits", slug: 'kids-tracksuits', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=600&q=80' },
      { name: 'Football & Cricket Kits', slug: 'kids-sports-jerseys', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=600&q=80' },
      { name: 'School Sports & PE Wear', slug: 'kids-pe-wear', parent_group: 'kids', image_url: 'https://images.unsplash.com/photo-1508215885820-4523e431397b?auto=format&fit=crop&w=600&q=80' }
    ];

    for (const cat of categories) {
      await db.run(
        'INSERT INTO categories (name, slug, parent_group, image_url) VALUES (?, ?, ?, ?)',
        [cat.name, cat.slug, cat.parent_group, cat.image_url]
      );
    }
    console.log(`✓ Seeded ${categories.length} sports categories`);

    // 4. Clear and Seed Sports Products (Men's & Children's Activewear Only)
    await db.run('DELETE FROM products');
    const products = [
      // === MEN'S SPORTS WEAR ===
      {
        title: 'Pro-Dri Breathable Gym & Training T-Shirt',
        slug: 'pro-dri-breathable-gym-training-tshirt',
        category: 'men',
        subcategory: 'men-gym-tees',
        description: 'Engineered with quick-drying micro-mesh fabric that wicks sweat away from the body during intense gym, cardio, and weight training sessions. Anti-odor and 4-way stretchable.',
        price: 499,
        original_price: 999,
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Carbon Black', 'Steel Grey', 'Electric Blue', 'Military Green']),
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 1,
        badge: 'DRI-FIT 50% OFF'
      },
      {
        title: '4-Way Stretch Performance Track Pants',
        slug: '4-way-stretch-performance-track-pants',
        category: 'men',
        subcategory: 'men-track-pants',
        description: 'Tapered athletic joggers crafted from lightweight stretch polyester-spandex blend. Features deep zippered side pockets to keep mobile secure during running and workouts.',
        price: 799,
        original_price: 1499,
        sizes: JSON.stringify(['30 (S)', '32 (M)', '34 (L)', '36 (XL)']),
        colors: JSON.stringify(['Jet Black', 'Charcoal Melange', 'Deep Navy']),
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 1,
        badge: 'HOT SELLER'
      },
      {
        title: '2-in-1 Running Shorts with Compression Liner',
        slug: '2-in-1-running-shorts-with-compression-liner',
        category: 'men',
        subcategory: 'men-running-shorts',
        description: 'Lightweight outer running shorts paired with a built-in anti-chafing compression inner layer. Includes towel loop and hidden interior phone pocket.',
        price: 599,
        original_price: 1199,
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Pitch Black', 'Slate Grey', 'Camo Army']),
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 0,
        badge: '2-IN-1 LINER'
      },
      {
        title: 'Pro Compression Thermal Base-Layer Skin',
        slug: 'pro-compression-thermal-base-layer-skin',
        category: 'men',
        subcategory: 'men-jerseys',
        description: 'Graduated muscle compression base-layer to boost circulation, reduce muscle soreness, and support rapid post-workout recovery. Second-skin fit with flatlock seams.',
        price: 649,
        original_price: 1299,
        sizes: JSON.stringify(['M', 'L', 'XL']),
        colors: JSON.stringify(['Stealth Black', 'Pure White']),
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 0,
        is_bestseller: 1,
        badge: 'PRO COMPRESSION'
      },
      {
        title: 'Ultra-Light Sports Windbreaker Jacket',
        slug: 'ultra-light-sports-windbreaker-jacket',
        category: 'men',
        subcategory: 'men-gym-tees',
        description: 'Packable water-resistant and windproof athletic running jacket with reflective safety strips for early morning runs or night cycling. Mesh underarm ventilation.',
        price: 999,
        original_price: 1999,
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Neon Lime', 'Shadow Black', 'Cobalt Blue']),
        stock: 20,
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 0,
        badge: 'WEATHER-PROOF'
      },
      {
        title: 'Cricket & Multi-Sport Performance Jersey',
        slug: 'cricket-multi-sport-performance-jersey',
        category: 'men',
        subcategory: 'men-jerseys',
        description: 'Sublimated interlock polyester sports jersey built for match day. Lightweight, highly breathable fabric keeps players cool and comfortable through all 40 overs.',
        price: 549,
        original_price: 999,
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Royal Blue & Gold', 'India Blue', 'White Test Match']),
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 0,
        is_bestseller: 1,
        badge: 'MATCH DAY'
      },

      // === CHILDREN'S / KIDS' SPORTS WEAR ===
      {
        title: "Boys' Quick-Dry Football Jersey & Shorts Set",
        slug: 'boys-quick-dry-football-jersey-shorts-set',
        category: 'kids',
        subcategory: 'kids-sports-jerseys',
        description: 'Complete 2-piece soccer training kit with moisture-wicking breathable jersey and elastic drawstring shorts. Designed for school football academy and daily turf play.',
        price: 599,
        original_price: 1099,
        sizes: JSON.stringify(['4-5 Years', '6-7 Years', '8-9 Years', '10-11 Years', '12-13 Years']),
        colors: JSON.stringify(['Striker Red', 'Neon Blue', 'Gold & Black']),
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 1,
        badge: 'SOCCER KIT'
      },
      {
        title: "Girls' Athletic Stretch Tracksuit (Jacket & Jogger)",
        slug: 'girls-athletic-stretch-tracksuit-jacket-jogger',
        category: 'kids',
        subcategory: 'kids-tracksuits',
        description: 'Super-comfortable, flexible zip-up athletic tracksuit set for young champions. Ideal for morning athletics practice, skating, gymastics, and school travel.',
        price: 849,
        original_price: 1599,
        sizes: JSON.stringify(['5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years']),
        colors: JSON.stringify(['Berry Pink & Navy', 'Lilac & Grey']),
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 1,
        badge: 'BESTSELLER'
      },
      {
        title: "Kids' All-Sport Breathable PE & Training T-Shirt",
        slug: 'kids-all-sport-breathable-pe-training-tshirt',
        category: 'kids',
        subcategory: 'kids-pe-wear',
        description: 'Lightweight 100% micro-polyester sports tee suitable for school Sports Day, cricket coaching, and outdoor recreation. Non-abrasive soft flat-lock seams.',
        price: 349,
        original_price: 699,
        sizes: JSON.stringify(['3-4 Years', '5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years']),
        colors: JSON.stringify(['Safety Orange', 'Vibrant Yellow', 'Royal Blue', 'Red']),
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1508215885820-4523e431397b?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 1,
        is_bestseller: 0,
        badge: 'PE SPORTS'
      },
      {
        title: "Boys' Basketball Mesh Sleeveless Jersey & Shorts",
        slug: 'boys-basketball-mesh-sleeveless-jersey-shorts',
        category: 'kids',
        subcategory: 'kids-training-sets',
        description: 'Airflow open-mesh basketball coordinates set with ribbed neck and armholes. Rapid dry fabric guarantees lightweight freedom of movement on court.',
        price: 549,
        original_price: 999,
        sizes: JSON.stringify(['5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years']),
        colors: JSON.stringify(['Chicago Red & White', 'Black & Gold']),
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 0,
        is_bestseller: 1,
        badge: 'BASKETBALL SET'
      },
      {
        title: "Kids' Athletic Compression Leggings & Shorts Combo",
        slug: 'kids-athletic-compression-leggings-shorts-combo',
        category: 'kids',
        subcategory: 'kids-training-sets',
        description: '2-in-1 athletic tights with shorts overlay. Protects young knees from turf burns while providing moisture-wicking muscle warmth for football and running.',
        price: 499,
        original_price: 899,
        sizes: JSON.stringify(['5-6 Years', '7-8 Years', '9-10 Years', '11-12 Years']),
        colors: JSON.stringify(['Solid Black', 'Charcoal Grey']),
        stock: 28,
        image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 0,
        is_bestseller: 0,
        badge: 'TURF SAFE'
      },
      {
        title: "Toddlers' Active Cotton Sports Track Set",
        slug: 'toddlers-active-cotton-sports-track-set',
        category: 'kids',
        subcategory: 'kids-tracksuits',
        description: 'Soft combed cotton fleece sports sweatshirt and jogger pants set for active toddlers. Soft elastic waistband allows easy movement and non-restrictive all-day play.',
        price: 499,
        original_price: 899,
        sizes: JSON.stringify(['1-2 Years', '2-3 Years', '3-4 Years']),
        colors: JSON.stringify(['Athletic Grey & Navy', 'Mustard & Olive']),
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
        additional_images: JSON.stringify([]),
        is_featured: 0,
        is_bestseller: 0,
        badge: 'BABY ATHLETE'
      }
    ];

    for (const prod of products) {
      await db.run(
        `INSERT INTO products (
          title, slug, category, subcategory, description, price,
          original_price, sizes, colors, stock, image_url,
          additional_images, is_featured, is_bestseller, badge
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.title,
          prod.slug,
          prod.category,
          prod.subcategory,
          prod.description,
          prod.price,
          prod.original_price,
          prod.sizes,
          prod.colors,
          prod.stock,
          prod.image_url,
          prod.additional_images,
          prod.is_featured,
          prod.is_bestseller,
          prod.badge
        ]
      );
    }
    console.log(`✓ Seeded ${products.length} Sports Wear products (Men & Children only)`);
    console.log('\n--- SPORTS WEAR DATABASE SEEDED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
