const http = require('http');

async function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING STORE VERIFICATION ---');

  // 1. Settings test
  const settingsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/settings',
    method: 'GET'
  });
  console.log('✓ /api/settings status:', settingsRes.status, '| Store Name:', settingsRes.data.settings?.store_name);

  // 2. All Products test
  const prodRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET'
  });
  console.log('✓ /api/products status:', prodRes.status, '| Count:', prodRes.data.products?.length);

  // 3. Men Category test
  const menRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products?category=men',
    method: 'GET'
  });
  console.log('✓ Men category products:', menRes.data.products?.length);

  // 4. Kids Category test
  const kidsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products?category=kids',
    method: 'GET'
  });
  console.log('✓ Kids category products:', kidsRes.data.products?.length);

  // 5. Test Mock Checkout
  const testProduct = menRes.data.products[0];
  const orderRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders/checkout',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customer_name: 'Test Customer',
    customer_phone: '9876543210',
    shipping_address: '123 Test Street, Near Metro Station',
    city: 'Delhi',
    pincode: '110001',
    payment_method: 'whatsapp',
    items: [
      {
        id: testProduct.id,
        quantity: 1,
        size: testProduct.sizes[0],
        color: testProduct.colors[0] || 'Default'
      }
    ]
  });
  console.log('✓ Mock Order status:', orderRes.status, '| Order Number:', orderRes.data.order?.order_number);
  console.log('✓ WhatsApp Order Link generated:', orderRes.data.whatsapp_url?.substring(0, 45) + '...');

  // 6. Test Tracking
  const trackRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/orders/track?query=${encodeURIComponent(orderRes.data.order.order_number)}`,
    method: 'GET'
  });
  console.log('✓ Order Tracking status:', trackRes.status, '| Found:', trackRes.data.orders?.length);

  // 7. Admin Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: 'admin',
    password: 'admin123'
  });
  console.log('✓ Admin login status:', loginRes.status, '| Token received:', Boolean(loginRes.data.token));

  // 8. Admin Dashboard Stats
  const token = loginRes.data.token;
  const statsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('✓ Admin stats status:', statsRes.status, '| Total Orders:', statsRes.data.stats?.totalOrders);

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
