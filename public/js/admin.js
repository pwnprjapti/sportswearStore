// UrbanVogue Admin Dashboard Engine
let adminToken = localStorage.getItem('urbanvogue_admin_token');
let adminProducts = [];
let adminOrders = [];
let currentTab = 'overview';

const subcategoriesByGroup = {
  men: [
    { label: "Gym & Training Tees", value: 'men-gym-tees' },
    { label: "Track Pants & Joggers", value: 'men-track-pants' },
    { label: 'Running & Workout Shorts', value: 'men-running-shorts' },
    { label: 'Sports Jerseys & Compression', value: 'men-jerseys' }
  ],
  kids: [
    { label: "Boys' Athletic Sets", value: 'kids-training-sets' },
    { label: "Girls' Active Tracksuits", value: 'kids-tracksuits' },
    { label: 'Football & Cricket Kits', value: 'kids-sports-jerseys' },
    { label: 'School Sports & PE Wear', value: 'kids-pe-wear' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  checkAuth();
});

// 1. Auth Management
async function checkAuth() {
  if (!adminToken) {
    showLoginView();
    return;
  }

  try {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (res.status === 401 || res.status === 403) {
      handleLogout();
      return;
    }

    const data = await res.json();
    if (data.success) {
      showDashboardView();
      renderDashboardStats(data);
    } else {
      showLoginView();
    }
  } catch (err) {
    console.error('Error verifying auth:', err);
    showLoginView();
  }
}

function showLoginView() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('dashboard-view').classList.add('hidden');
}

function showDashboardView() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
  loadInitialData();
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  const alertBox = document.getElementById('login-alert');
  const btn = document.getElementById('login-btn');

  alertBox.classList.add('hidden');
  btn.disabled = true;
  btn.innerText = 'Signing In...';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success && data.token) {
      adminToken = data.token;
      localStorage.setItem('urbanvogue_admin_token', adminToken);
      showDashboardView();
    } else {
      alertBox.innerText = data.message || 'Invalid credentials';
      alertBox.classList.remove('hidden');
    }
  } catch (err) {
    alertBox.innerText = 'Network error during login';
    alertBox.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Sign In to Dashboard';
  }
}

function handleLogout() {
  adminToken = null;
  localStorage.removeItem('urbanvogue_admin_token');
  showLoginView();
}

// 2. Navigation & Tabs
function switchTab(tabName) {
  currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.className = 'admin-tab-btn active px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-900 text-white shadow-sm flex items-center gap-2';
    } else {
      btn.className = 'admin-tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 flex items-center gap-2';
    }
  });

  // Update tab panels
  document.querySelectorAll('.admin-tab-content').forEach(panel => {
    panel.classList.add('hidden');
  });

  const activePanel = document.getElementById(`tab-${tabName}`);
  if (activePanel) activePanel.classList.remove('hidden');

  if (tabName === 'overview') loadDashboardStats();
  if (tabName === 'products') loadAdminProducts();
  if (tabName === 'orders') loadAdminOrders();
  if (tabName === 'settings') loadAdminSettings();

  if (window.lucide) lucide.createIcons();
}

async function loadInitialData() {
  await loadDashboardStats();
  handleDepartmentChange(); // prefill subcategories dropdown for modal
}

// 3. Overview Tab: Stats & Recent
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      renderDashboardStats(data);
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function renderDashboardStats(data) {
  const { stats, lowStockProducts, recentOrders } = data;

  document.getElementById('stat-revenue').innerText = `₹${stats.totalRevenue || 0}`;
  document.getElementById('stat-orders').innerText = stats.totalOrders || 0;
  document.getElementById('stat-pending').innerText = stats.pendingOrders || 0;
  document.getElementById('stat-products').innerText = stats.totalProducts || 0;

  // Render Low Stock Box
  const lowStockContainer = document.getElementById('overview-low-stock');
  if (lowStockProducts && lowStockProducts.length > 0) {
    lowStockContainer.innerHTML = lowStockProducts.map(p => `
      <div class="flex items-center justify-between p-2.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <img src="${p.image_url}" class="w-9 h-9 object-cover rounded-lg flex-shrink-0" />
          <div class="min-w-0">
            <h5 class="font-bold text-slate-900 truncate">${p.title}</h5>
            <span class="text-[10px] text-slate-500 uppercase">${p.category}</span>
          </div>
        </div>
        <span class="px-2 py-0.5 bg-rose-600 text-white font-black text-[11px] rounded-full">
          ${p.stock} left
        </span>
      </div>
    `).join('');
  } else {
    lowStockContainer.innerHTML = '<p class="text-xs text-emerald-600 font-semibold py-2">✓ All items well stocked!</p>';
  }

  // Render Recent Orders
  const recentOrdersContainer = document.getElementById('overview-recent-orders');
  if (recentOrders && recentOrders.length > 0) {
    recentOrdersContainer.innerHTML = recentOrders.map(o => {
      let badge = 'bg-amber-100 text-amber-800';
      if (o.order_status === 'confirmed') badge = 'bg-sky-100 text-sky-800';
      if (o.order_status === 'shipped') badge = 'bg-purple-100 text-purple-800';
      if (o.order_status === 'delivered') badge = 'bg-emerald-100 text-emerald-800';
      if (o.order_status === 'cancelled') badge = 'bg-rose-100 text-rose-800';

      const cleanPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${o.customer_name}, regards from UrbanVogue about your order #${o.order_number}`)}`;

      return `
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900">#${o.order_number}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge}">${o.order_status}</span>
            </div>
            <p class="text-slate-600 mt-0.5 font-medium">
              ${o.customer_name} • ${o.customer_phone} • <strong>₹${o.total_amount}</strong>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <a href="${waLink}" target="_blank" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>WhatsApp</span>
            </a>
            <select onchange="updateOrderStatusQuick(${o.id}, this.value)" class="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none">
              <option value="pending" ${o.order_status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${o.order_status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="shipped" ${o.order_status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${o.order_status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.order_status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>
      `;
    }).join('');
  } else {
    recentOrdersContainer.innerHTML = '<p class="text-xs text-slate-500 py-4">No customer orders placed yet.</p>';
  }

  if (window.lucide) lucide.createIcons();
}

// 4. Products Tab
async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-table-body');
  const cat = document.getElementById('admin-product-category').value;
  const search = document.getElementById('admin-product-search').value.trim();

  tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-xs text-slate-400">Loading catalog...</td></tr>';

  try {
    const query = new URLSearchParams();
    if (cat !== 'all') query.append('category', cat);
    if (search) query.append('search', search);

    const res = await fetch(`/api/admin/products?${query.toString()}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success) {
      adminProducts = data.products;
      renderAdminProductsTable(data.products);
    }
  } catch (err) {
    console.error('Error loading admin products:', err);
  }
}

function renderAdminProductsTable(products) {
  const tbody = document.getElementById('admin-products-table-body');
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-xs text-slate-500 font-medium">No clothing items match the query.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="p-3.5">
        <div class="flex items-center gap-3">
          <img src="${p.image_url}" class="w-12 h-12 object-cover rounded-xl bg-slate-200 flex-shrink-0" />
          <div class="min-w-0">
            <h4 class="font-bold text-slate-900 truncate max-w-xs">${p.title}</h4>
            <span class="text-[11px] text-slate-400">${p.subcategory || p.category}</span>
          </div>
        </div>
      </td>
      <td class="p-3.5 font-bold uppercase text-[11px] ${p.category === 'men' ? 'text-sky-700' : 'text-emerald-700'}">
        ${p.category === 'men' ? "🏃 Men Sports" : "⚽ Kids Sports"}
      </td>
      <td class="p-3.5 font-extrabold text-slate-900">
        ₹${p.price}
        ${p.original_price ? `<span class="text-slate-400 font-normal line-through text-[11px] block">₹${p.original_price}</span>` : ''}
      </td>
      <td class="p-3.5">
        <div class="flex flex-wrap gap-1 max-w-xs">
          ${(p.sizes || []).map(s => `<span class="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">${s}</span>`).join('')}
        </div>
      </td>
      <td class="p-3.5 font-bold ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-700'}">
        ${p.stock} units
      </td>
      <td class="p-3.5 text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openProductEditModal(${p.id})" class="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg" title="Edit Product">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteProduct(${p.id}, '${p.title}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete Product">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

let productSearchTimeout;
function handleAdminProductSearch(e) {
  clearTimeout(productSearchTimeout);
  productSearchTimeout = setTimeout(() => {
    loadAdminProducts();
  }, 300);
}

// 5. Product Add / Edit Modal
function openProductEditModal(productId = null) {
  const modal = document.getElementById('product-edit-modal');
  const titleEl = document.getElementById('edit-modal-title');
  const idField = document.getElementById('edit-product-id');

  if (productId) {
    const p = adminProducts.find(x => x.id === productId);
    if (!p) return;

    titleEl.innerText = 'Edit Clothing Item';
    idField.value = p.id;
    document.getElementById('prod-title').value = p.title;
    document.getElementById('prod-category').value = p.category;
    handleDepartmentChange(p.subcategory);
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-orig-price').value = p.original_price || '';
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-sizes').value = (p.sizes || []).join(', ');
    document.getElementById('prod-colors').value = (p.colors || []).join(', ');
    document.getElementById('prod-image-url').value = p.image_url;
    document.getElementById('prod-badge').value = p.badge || '';
    document.getElementById('prod-desc').value = p.description || '';
    document.getElementById('prod-featured').checked = Boolean(p.is_featured);
    document.getElementById('prod-bestseller').checked = Boolean(p.is_bestseller);
  } else {
    titleEl.innerText = 'Add New Clothing Item';
    idField.value = '';
    document.getElementById('product-form').reset();
    handleDepartmentChange();
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeProductEditModal() {
  document.getElementById('product-edit-modal').classList.add('hidden');
}

function handleDepartmentChange(selectedSub = null) {
  const dept = document.getElementById('prod-category').value;
  const subSelect = document.getElementById('prod-subcategory');
  const list = subcategoriesByGroup[dept] || [];

  subSelect.innerHTML = list.map(item => `
    <option value="${item.value}" ${item.value === selectedSub ? 'selected' : ''}>${item.label}</option>
  `).join('');
}

function setPresetSizes(type) {
  const sizesInput = document.getElementById('prod-sizes');
  if (type === 'men') {
    sizesInput.value = 'M, L, XL, XXL';
  } else if (type === 'kids') {
    sizesInput.value = '4-5 Years, 6-7 Years, 8-9 Years, 10-11 Years, 12-13 Years';
  }
}

async function handleSaveProduct(event) {
  event.preventDefault();
  const btn = document.getElementById('save-prod-btn');
  btn.disabled = true;
  btn.innerText = 'Saving...';

  const id = document.getElementById('edit-product-id').value;
  const formData = new FormData();

  formData.append('title', document.getElementById('prod-title').value.trim());
  formData.append('category', document.getElementById('prod-category').value);
  formData.append('subcategory', document.getElementById('prod-subcategory').value);
  formData.append('price', document.getElementById('prod-price').value);
  formData.append('original_price', document.getElementById('prod-orig-price').value);
  formData.append('stock', document.getElementById('prod-stock').value);
  formData.append('sizes', document.getElementById('prod-sizes').value);
  formData.append('colors', document.getElementById('prod-colors').value);
  formData.append('badge', document.getElementById('prod-badge').value.trim());
  formData.append('description', document.getElementById('prod-desc').value.trim());
  formData.append('is_featured', document.getElementById('prod-featured').checked ? '1' : '0');
  formData.append('is_bestseller', document.getElementById('prod-bestseller').checked ? '1' : '0');

  const fileInput = document.getElementById('prod-image-file');
  if (fileInput.files.length > 0) {
    formData.append('image', fileInput.files[0]);
  } else {
    formData.append('image_url', document.getElementById('prod-image-url').value.trim());
  }

  try {
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showAdminToast(id ? 'Product updated successfully' : 'New clothing item added!', 'success');
      closeProductEditModal();
      loadAdminProducts();
      loadDashboardStats();
    } else {
      showAdminToast(data.message || 'Failed to save product', 'error');
    }
  } catch (err) {
    showAdminToast('Network error saving product', 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Save Product';
  }
}

async function deleteProduct(productId, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Product deleted', 'info');
      loadAdminProducts();
      loadDashboardStats();
    } else {
      showAdminToast(data.message || 'Could not delete product', 'error');
    }
  } catch (err) {
    showAdminToast('Network error deleting product', 'error');
  }
}

// 6. Orders Tab
async function loadAdminOrders() {
  const container = document.getElementById('admin-orders-container');
  const status = document.getElementById('admin-order-status-filter').value;
  const search = document.getElementById('admin-order-search').value.trim();

  container.innerHTML = '<p class="text-xs text-slate-400 py-6 text-center">Loading orders...</p>';

  try {
    const query = new URLSearchParams();
    if (status !== 'all') query.append('status', status);
    if (search) query.append('search', search);

    const res = await fetch(`/api/admin/orders?${query.toString()}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success) {
      adminOrders = data.orders;
      renderAdminOrdersList(data.orders);
    }
  } catch (err) {
    console.error('Error loading orders:', err);
  }
}

function renderAdminOrdersList(orders) {
  const container = document.getElementById('admin-orders-container');
  if (orders.length === 0) {
    container.innerHTML = '<div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-medium">No orders found matching criteria.</div>';
    return;
  }

  container.innerHTML = orders.map(o => {
    const cleanPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
    const waText = `Hi ${o.customer_name}, regarding your UrbanVogue order #${o.order_number}:`;
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

    return `
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black text-sm text-slate-900">#${o.order_number}</span>
              <span class="text-xs text-slate-400">• ${new Date(o.created_at).toLocaleString()}</span>
            </div>
            <p class="text-xs text-slate-700 font-bold mt-0.5">
              👤 ${o.customer_name} &nbsp;|&nbsp; 📞 ${o.customer_phone} ${o.customer_email ? `&nbsp;|&nbsp; ✉️ ${o.customer_email}` : ''}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <a href="${waLink}" target="_blank" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>Chat WhatsApp</span>
            </a>
            <select onchange="updateOrderStatusQuick(${o.id}, this.value)" class="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none">
              <option value="pending" ${o.order_status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="confirmed" ${o.order_status === 'confirmed' ? 'selected' : ''}>✓ Confirmed</option>
              <option value="shipped" ${o.order_status === 'shipped' ? 'selected' : ''}>🚚 Shipped</option>
              <option value="delivered" ${o.order_status === 'delivered' ? 'selected' : ''}>🎉 Delivered</option>
              <option value="cancelled" ${o.order_status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
            </select>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="text-xs text-slate-600">
          <strong class="text-slate-800">📍 Shipping Address:</strong> ${o.shipping_address}, ${o.city || ''} - ${o.pincode || ''}
        </div>

        <!-- Items Table -->
        <div class="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
          ${(o.items || []).map(item => `
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-800">${item.title} (Size: <strong>${item.size}</strong>${item.color ? `, ${item.color}` : ''}) × ${item.quantity}</span>
              <span class="font-extrabold text-slate-900">₹${item.line_total || item.price * item.quantity}</span>
            </div>
          `).join('')}
          <div class="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-700">
            <span>Subtotal: ₹${o.subtotal} | Shipping: ${o.shipping_fee > 0 ? '₹' + o.shipping_fee : 'FREE'} | Payment: <span class="uppercase font-black text-emerald-700">${o.payment_method}</span></span>
            <span class="text-sm font-black text-slate-900">Total: ₹${o.total_amount}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

let orderSearchTimeout;
function handleAdminOrderSearch(e) {
  clearTimeout(orderSearchTimeout);
  orderSearchTimeout = setTimeout(() => {
    loadAdminOrders();
  }, 300);
}

async function updateOrderStatusQuick(orderId, newStatus) {
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ order_status: newStatus })
    });

    const data = await res.json();
    if (data.success) {
      showAdminToast(`Order #${orderId} marked as ${newStatus}`, 'success');
      loadDashboardStats();
    } else {
      showAdminToast(data.message || 'Status update failed', 'error');
    }
  } catch (err) {
    showAdminToast('Network error updating status', 'error');
  }
}

// 7. Store Settings Tab
async function loadAdminSettings() {
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;
      document.getElementById('set-store-name').value = s.store_name || '';
      document.getElementById('set-store-tagline').value = s.store_tagline || '';
      document.getElementById('set-whatsapp-number').value = s.whatsapp_number || '';
      document.getElementById('set-store-phone').value = s.store_phone || '';
      document.getElementById('set-store-address').value = s.store_address || '';
      document.getElementById('set-currency-symbol').value = s.currency_symbol || '₹';
      document.getElementById('set-shipping-fee').value = s.shipping_fee || 50;
      document.getElementById('set-free-threshold').value = s.free_shipping_threshold || 999;
      document.getElementById('set-announcement').value = s.announcement_bar || '';
      document.getElementById('set-upi-id').value = s.upi_id || '';
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
}

async function handleSaveSettings(event) {
  event.preventDefault();
  const btn = document.getElementById('save-settings-btn');
  btn.disabled = true;
  btn.innerText = 'Saving Settings...';

  const payload = {
    store_name: document.getElementById('set-store-name').value.trim(),
    store_tagline: document.getElementById('set-store-tagline').value.trim(),
    whatsapp_number: document.getElementById('set-whatsapp-number').value.trim(),
    store_phone: document.getElementById('set-store-phone').value.trim(),
    store_address: document.getElementById('set-store-address').value.trim(),
    currency_symbol: document.getElementById('set-currency-symbol').value.trim(),
    shipping_fee: document.getElementById('set-shipping-fee').value,
    free_shipping_threshold: document.getElementById('set-free-threshold').value,
    announcement_bar: document.getElementById('set-announcement').value.trim(),
    upi_id: document.getElementById('set-upi-id').value.trim()
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showAdminToast('Store settings saved successfully!', 'success');
      document.getElementById('admin-brand-name').innerText = payload.store_name;
    } else {
      showAdminToast(data.message || 'Failed to save settings', 'error');
    }
  } catch (err) {
    showAdminToast('Network error saving settings', 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Save Store Settings';
  }
}

// 8. Admin Toast
function showAdminToast(message, type = 'success') {
  const container = document.getElementById('admin-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'error' ? 'bg-rose-900' : (type === 'info' ? 'bg-slate-900' : 'bg-emerald-900');
  toast.className = `toast-item flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold ${bg} text-white border border-white/20`;
  toast.innerText = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
