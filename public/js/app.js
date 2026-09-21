// Cult.Sport Inspired Activewear Storefront Engine
let storeSettings = {
  store_name: 'Cult.Sport',
  store_phone: '+91 98765 43210',
  whatsapp_number: '919876543210',
  currency_symbol: '₹',
  shipping_fee: 50,
  free_shipping_threshold: 799,
  announcement_bar: 'CULT.SPORT ACTIVEWEAR SALE: FLAT 50% OFF | EXTRA 10% OFF VIA UPI | FREE DELIVERY OVER ₹799'
};

let currentFilters = {
  category: 'all', // 'all', 'men', 'kids'
  subcategory: '',
  size: '',
  sort: 'newest',
  search: '',
  featured: '',
  bestseller: ''
};

let masterProducts = [];
let allProducts = [];
let allCategories = [];
let cart = JSON.parse(localStorage.getItem('cultsport_cart') || '[]');
let modalProduct = null;
let modalSelectedSize = null;
let modalSelectedColor = null;
let modalQty = 1;

let currentHeroSlide = 0;
let heroAutoPlayTimer = null;
const totalHeroSlides = 4;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  
  await loadStoreSettings();
  await loadCategories();
  initHeroSlider();
  await loadFeaturedRails();
  await loadProducts();

  setupEventListeners();
  updateCartUI();
});

// 1. Store Settings
async function loadStoreSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      storeSettings = { ...storeSettings, ...data.settings };
      applyStoreSettings();
    }
  } catch (err) {
    console.warn('Using default Cultstore settings:', err);
  }
}

function applyStoreSettings() {
  const announcementText = document.getElementById('announcement-text');
  if (announcementText && storeSettings.announcement_bar) {
    announcementText.innerText = storeSettings.announcement_bar;
  }

  const floatWa = document.getElementById('floating-whatsapp');
  if (floatWa && storeSettings.whatsapp_number) {
    floatWa.href = `https://wa.me/${storeSettings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Cult.Sport, I want to inquire about sports wear!')}`;
  }
}

// 2. Fetch Categories
async function loadCategories() {
  try {
    const res = await fetch('/api/products/categories');
    const data = await res.json();
    if (data.success) {
      allCategories = data.categories;
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

// 3. Load Products from API
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  const countPill = document.getElementById('product-count-pill');
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
      <div class="w-7 h-7 border-3 border-slate-300 border-t-rose-500 rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-black uppercase tracking-wider text-slate-600">Loading Cult Activewear...</p>
    </div>
  `;

  try {
    const query = new URLSearchParams();
    if (currentFilters.category !== 'all') query.append('category', currentFilters.category);
    if (currentFilters.subcategory) query.append('subcategory', currentFilters.subcategory);
    if (currentFilters.size) query.append('size', currentFilters.size);
    if (currentFilters.sort) query.append('sort', currentFilters.sort);
    if (currentFilters.search) query.append('search', currentFilters.search);
    if (currentFilters.featured) query.append('featured', currentFilters.featured);
    if (currentFilters.bestseller) query.append('bestseller', currentFilters.bestseller);

    const res = await fetch(`/api/products?${query.toString()}`);
    const data = await res.json();

    if (data.success && data.products.length > 0) {
      allProducts = data.products;
      if (countPill) countPill.innerText = `${data.products.length} Items`;
      renderProductGrid(data.products);
      if (emptyState) emptyState.classList.add('hidden');
      grid.classList.remove('hidden');
    } else {
      allProducts = [];
      if (countPill) countPill.innerText = `0 Items`;
      grid.innerHTML = '';
      grid.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
    }

    updateFilterStatusBar();
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// ==========================================
// CULTSTORE AUTO-SLIDING HERO CAROUSEL
// ==========================================
function initHeroSlider() {
  const track = document.getElementById('hero-slider-track');
  const container = document.querySelector('.hero-carousel-container');
  if (!track || !container) return;

  setHeroSlide(0);
  startHeroAutoPlay();

  // Pause on mouse hover (desktop)
  container.addEventListener('mouseenter', stopHeroAutoPlay);
  container.addEventListener('mouseleave', startHeroAutoPlay);

  // Touch swipe support (mobile / tablet)
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopHeroAutoPlay();
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextHeroSlide();
      } else {
        prevHeroSlide();
      }
    }
    startHeroAutoPlay();
  }, { passive: true });
}

function startHeroAutoPlay() {
  stopHeroAutoPlay();
  heroAutoPlayTimer = setInterval(() => {
    nextHeroSlide();
  }, 4500);
}

function stopHeroAutoPlay() {
  if (heroAutoPlayTimer) {
    clearInterval(heroAutoPlayTimer);
    heroAutoPlayTimer = null;
  }
}

function setHeroSlide(index) {
  const track = document.getElementById('hero-slider-track');
  if (!track) return;

  currentHeroSlide = (index + totalHeroSlides) % totalHeroSlides;
  track.style.transform = `translateX(-${currentHeroSlide * 100}%)`;

  const dots = document.querySelectorAll('.hero-dot-btn');
  dots.forEach((dot, idx) => {
    if (idx === currentHeroSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function nextHeroSlide() {
  setHeroSlide(currentHeroSlide + 1);
}

function prevHeroSlide() {
  setHeroSlide(currentHeroSlide - 1);
}

// ==========================================
// CULTSTORE HORIZONTAL SLIDING PRODUCT RAILS
// ==========================================
async function loadFeaturedRails() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success && data.products) {
      masterProducts = data.products;
      renderSlidingRails(data.products);
    }
  } catch (err) {
    console.error('Error loading sliding rails:', err);
  }
}

function renderSlidingRails(products) {
  const menTrack = document.getElementById('trending-men-slider');
  const kidsTrack = document.getElementById('popular-kids-slider');
  const curr = storeSettings.currency_symbol || '₹';

  if (menTrack) {
    const menProducts = products.filter(p => p.category === 'men');
    menTrack.innerHTML = menProducts.map((prod, idx) => createRailCardHtml(prod, idx, curr)).join('');
  }

  if (kidsTrack) {
    const kidsProducts = products.filter(p => p.category === 'kids');
    kidsTrack.innerHTML = kidsProducts.map((prod, idx) => createRailCardHtml(prod, idx, curr)).join('');
  }

  if (window.lucide) lucide.createIcons();
}

function createRailCardHtml(prod, idx, curr) {
  let discountBadge = '';
  let pctOff = 50;
  if (prod.original_price && prod.original_price > prod.price) {
    pctOff = Math.round(((prod.original_price - prod.price) / prod.original_price) * 100);
    discountBadge = `<span class="badge-discount-cult absolute top-2 left-2 z-10">${pctOff}% OFF</span>`;
  } else if (prod.badge) {
    discountBadge = `<span class="badge-tag-cult absolute top-2 left-2 z-10">${prod.badge}</span>`;
  }

  const mockRatings = ['4.8 (1.2k)', '4.9 (850)', '4.7 (2.1k)', '4.8 (940)', '4.9 (1.5k)', '4.7 (620)'];
  const rating = mockRatings[idx % mockRatings.length];
  const categoryTag = prod.category === 'men' ? 'MEN' : 'KIDS';

  return `
    <div class="rail-product-card cult-card group cursor-pointer" onclick="openProductModal(${prod.id})">
      <div class="cult-card-img">
        ${discountBadge}
        <div class="badge-rating absolute bottom-2 left-2 z-10">
          <span class="text-amber-500 font-bold">★</span>
          <span>${rating}</span>
        </div>
        <img
          src="${prod.image_url}"
          alt="${prod.title}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'"
        />
      </div>

      <div class="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div>
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            ${categoryTag} ACTIVEWEAR
          </span>
          <h3 class="font-semibold text-xs text-slate-900 line-clamp-1 group-hover:text-rose-500 transition-colors">
            ${prod.title}
          </h3>
        </div>

        <div>
          <div class="flex items-baseline gap-1.5 pt-0.5">
            <span class="text-xs sm:text-sm font-black text-slate-900">${curr}${prod.price}</span>
            ${prod.original_price ? `<span class="text-[10px] text-slate-400 line-through font-normal">${curr}${prod.original_price}</span>` : ''}
          </div>

          <button
            onclick="event.stopPropagation(); quickAddToCart(${prod.id})"
            class="w-full mt-2 py-1.5 bg-slate-100 hover:bg-black hover:text-white text-slate-900 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function scrollRail(sliderId, direction) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  const scrollAmount = 260 * direction;
  slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// Expose navigation functions globally
window.setHeroSlide = setHeroSlide;
window.nextHeroSlide = nextHeroSlide;
window.prevHeroSlide = prevHeroSlide;
window.scrollRail = scrollRail;

// 4. Render Simple, Clean Cult.Sport Product Cards
function renderProductGrid(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const curr = storeSettings.currency_symbol || '₹';
  const mockRatings = ['4.8 (1.2k)', '4.9 (850)', '4.7 (2.1k)', '4.8 (940)', '4.9 (1.5k)', '4.7 (620)'];

  grid.innerHTML = products.map((prod, idx) => {
    let discountBadge = '';
    let pctOff = 50;
    if (prod.original_price && prod.original_price > prod.price) {
      pctOff = Math.round(((prod.original_price - prod.price) / prod.original_price) * 100);
      discountBadge = `<span class="badge-discount-cult absolute top-2 left-2 z-10">${pctOff}% OFF</span>`;
    } else if (prod.badge) {
      discountBadge = `<span class="badge-tag-cult absolute top-2 left-2 z-10">${prod.badge}</span>`;
    }

    const rating = mockRatings[idx % mockRatings.length];
    const categoryTag = prod.category === 'men' ? 'MEN' : 'KIDS';

    return `
      <div class="cult-card group cursor-pointer" onclick="openProductModal(${prod.id})">
        
        <!-- Clean Image Box -->
        <div class="cult-card-img">
          ${discountBadge}

          <!-- Rating -->
          <div class="badge-rating absolute bottom-2 left-2 z-10">
            <span class="text-amber-500 font-bold">★</span>
            <span>${rating}</span>
          </div>

          <img
            src="${prod.image_url}"
            alt="${prod.title}"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'"
          />
        </div>

        <!-- Details -->
        <div class="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5">
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              ${categoryTag} ACTIVEWEAR
            </span>
            <h3 class="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-rose-500 transition-colors">
              ${prod.title}
            </h3>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-1.5 pt-1">
            <span class="text-xs sm:text-sm font-black text-slate-900">${curr}${prod.price}</span>
            ${prod.original_price ? `<span class="text-[10px] text-slate-400 line-through">${curr}${prod.original_price}</span>` : ''}
            <span class="text-[10px] font-bold text-rose-500">(${pctOff}% OFF)</span>
          </div>

          <!-- Button -->
          <button onclick="event.stopPropagation(); quickAddToCart(${prod.id})" class="w-full py-1.5 mt-1 bg-slate-100 hover:bg-black hover:text-white text-slate-900 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Add</span>
          </button>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// 5. Product Detail Modal
function openProductModal(productId) {
  const product = (masterProducts.length > 0 ? masterProducts.find(p => p.id === productId) : null) || allProducts.find(p => p.id === productId);
  if (!product) return;

  modalProduct = product;
  modalSelectedSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Standard';
  modalSelectedColor = (product.colors && product.colors.length > 0) ? product.colors[0] : null;
  modalQty = 1;

  const curr = storeSettings.currency_symbol || '₹';
  const modal = document.getElementById('product-modal');

  document.getElementById('modal-img').src = product.image_url;
  document.getElementById('modal-title').innerText = product.title;
  document.getElementById('modal-desc').innerText = product.description || 'Lightweight, quick-drying 4-way stretch active fabric.';
  document.getElementById('modal-price').innerText = `${curr}${product.price}`;

  const origPriceEl = document.getElementById('modal-original-price');
  const discountEl = document.getElementById('modal-discount');
  const badgeEl = document.getElementById('modal-badge');

  if (product.original_price && product.original_price > product.price) {
    origPriceEl.innerText = `${curr}${product.original_price}`;
    origPriceEl.classList.remove('hidden');
    const pct = Math.round(((product.original_price - product.price) / product.original_price) * 100);
    discountEl.innerText = `${pct}% OFF`;
    discountEl.classList.remove('hidden');
    badgeEl.innerText = `${pct}% OFF`;
    badgeEl.classList.remove('hidden');
  } else {
    origPriceEl.classList.add('hidden');
    discountEl.classList.add('hidden');
    if (product.badge) {
      badgeEl.innerText = product.badge;
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }
  }

  document.getElementById('modal-category').innerText = product.category === 'men' ? "CULT.SPORT MEN" : "CULT.SPORT KIDS";
  document.getElementById('modal-qty').innerText = modalQty;

  // Sizes
  const sizeContainer = document.getElementById('modal-sizes-container');
  const sizeLabel = document.getElementById('selected-size-label');
  sizeLabel.innerText = modalSelectedSize;

  if (product.sizes && product.sizes.length > 0) {
    sizeContainer.innerHTML = product.sizes.map(s => `
      <button onclick="selectModalSize('${s}')" class="size-pill px-3 py-1.5 rounded-lg text-xs font-black ${s === modalSelectedSize ? 'active' : 'bg-slate-50 text-slate-800'}">
        ${s}
      </button>
    `).join('');
  } else {
    sizeContainer.innerHTML = '<span class="text-xs text-slate-500">Free Size / Standard</span>';
  }

  // Colors
  const colorsWrapper = document.getElementById('modal-colors-wrapper');
  const colorsContainer = document.getElementById('modal-colors-container');
  const colorLabel = document.getElementById('selected-color-label');

  if (product.colors && product.colors.length > 0) {
    colorsWrapper.classList.remove('hidden');
    colorLabel.innerText = modalSelectedColor;
    colorsContainer.innerHTML = product.colors.map(c => `
      <button onclick="selectModalColor('${c}')" class="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${c === modalSelectedColor ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}">
        ${c}
      </button>
    `).join('');
  } else {
    colorsWrapper.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
  modalProduct = null;
}

function selectModalSize(size) {
  modalSelectedSize = size;
  document.getElementById('selected-size-label').innerText = size;
  document.querySelectorAll('#modal-sizes-container .size-pill').forEach(btn => {
    if (btn.innerText.trim() === size) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function selectModalColor(color) {
  modalSelectedColor = color;
  document.getElementById('selected-color-label').innerText = color;
  document.querySelectorAll('#modal-colors-container button').forEach(btn => {
    if (btn.innerText.trim() === color) {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-900 bg-slate-900 text-white';
    } else {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100';
    }
  });
}

function incrementModalQty() {
  modalQty++;
  document.getElementById('modal-qty').innerText = modalQty;
}

function decrementModalQty() {
  if (modalQty > 1) {
    modalQty--;
    document.getElementById('modal-qty').innerText = modalQty;
  }
}

// 6. Cart Operations
function quickAddToCart(productId) {
  const product = (masterProducts.length > 0 ? masterProducts.find(p => p.id === productId) : null) || allProducts.find(p => p.id === productId);
  if (!product) return;
  const size = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Standard';
  const color = (product.colors && product.colors.length > 0) ? product.colors[0] : '';
  addToCart(product, size, color, 1);
}

function quickAddWithSize(productId, size) {
  const product = (masterProducts.length > 0 ? masterProducts.find(p => p.id === productId) : null) || allProducts.find(p => p.id === productId);
  if (!product) return;
  const color = (product.colors && product.colors.length > 0) ? product.colors[0] : '';
  addToCart(product, size, color, 1);
}

function addCurrentProductToCart() {
  if (!modalProduct) return;
  addToCart(modalProduct, modalSelectedSize, modalSelectedColor, modalQty);
  closeProductModal();
  openCartDrawer();
}

function addToCart(product, size, color, quantity) {
  const existingIdx = cart.findIndex(
    item => item.id === product.id && item.size === size && item.color === color
  );

  if (existingIdx > -1) {
    cart[existingIdx].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      size: size || 'Standard',
      color: color || '',
      quantity: quantity
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added ${product.title} (${size}) to Bag!`);
}

function updateCartQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function removeFromCart(idx) {
  if (!cart[idx]) return;
  cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cultsport_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const mobileBadge = document.getElementById('mobile-bottom-cart-badge');
  const drawerCount = document.getElementById('drawer-item-count');
  const itemsContainer = document.getElementById('cart-items-list');
  const emptyView = document.getElementById('cart-empty-view');
  const footer = document.getElementById('cart-footer');
  const curr = storeSettings.currency_symbol || '₹';

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (badge) {
    badge.innerText = totalItems;
    if (totalItems > 0) badge.classList.remove('scale-0');
    else badge.classList.add('scale-0');
  }

  if (mobileBadge) {
    mobileBadge.innerText = totalItems;
    if (totalItems > 0) mobileBadge.classList.remove('scale-0');
    else mobileBadge.classList.add('scale-0');
  }

  if (drawerCount) drawerCount.innerText = `${totalItems} items`;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const threshold = storeSettings.free_shipping_threshold || 799;
  const baseShipping = storeSettings.shipping_fee || 50;
  const shippingFee = (subtotal >= threshold || totalItems === 0) ? 0 : baseShipping;
  const total = subtotal + shippingFee;

  // Free delivery bar
  const progressMsg = document.getElementById('free-delivery-msg');
  const progressBar = document.getElementById('free-delivery-bar');
  const progressPct = document.getElementById('free-delivery-pct');

  if (progressMsg && progressBar) {
    if (subtotal >= threshold) {
      progressMsg.innerText = '⚡ FREE Delivery Unlocked!';
      progressPct.innerText = '100%';
      progressBar.style.width = '100%';
      progressBar.className = 'bg-emerald-500 h-1.5 rounded-full transition-all';
    } else {
      const remaining = threshold - subtotal;
      const pct = Math.min(Math.round((subtotal / threshold) * 100), 100);
      progressMsg.innerText = `Add ${curr}${remaining} more for FREE Delivery!`;
      progressPct.innerText = `${pct}%`;
      progressBar.style.width = `${pct}%`;
      progressBar.className = 'bg-rose-500 h-1.5 rounded-full transition-all';
    }
  }

  if (cart.length === 0) {
    if (itemsContainer) itemsContainer.innerHTML = '';
    if (emptyView) emptyView.classList.remove('hidden');
    if (footer) footer.classList.add('hidden');
  } else {
    if (emptyView) emptyView.classList.add('hidden');
    if (footer) footer.classList.remove('hidden');

    if (itemsContainer) {
      itemsContainer.innerHTML = cart.map((item, idx) => `
        <div class="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <img src="${item.image_url}" class="w-12 h-12 object-cover rounded-lg bg-slate-200" />
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-black text-slate-900 truncate">${item.title}</h4>
            <span class="text-[10px] text-slate-500">Size: <strong class="text-slate-800">${item.size}</strong></span>
            <div class="flex items-center justify-between mt-1">
              <div class="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                <button onclick="updateCartQty(${idx}, -1)" class="px-2 py-0.5 text-xs font-bold">-</button>
                <span class="px-2.5 py-0.5 text-xs font-black">${item.quantity}</span>
                <button onclick="updateCartQty(${idx}, 1)" class="px-2 py-0.5 text-xs font-bold">+</button>
              </div>
              <span class="text-xs font-black text-slate-950">${curr}${item.price * item.quantity}</span>
            </div>
          </div>
          <button onclick="removeFromCart(${idx})" class="text-slate-400 hover:text-rose-500 p-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');
    }

    document.getElementById('cart-subtotal').innerText = `${curr}${subtotal}`;
    document.getElementById('cart-shipping').innerText = shippingFee === 0 ? 'FREE' : `${curr}${shippingFee}`;
    document.getElementById('cart-total').innerText = `${curr}${total}`;
  }

  const checkoutDisplay = document.getElementById('checkout-total-display');
  if (checkoutDisplay) checkoutDisplay.innerText = `${curr}${total}`;

  if (window.lucide) lucide.createIcons();
}

function openCartDrawer() {
  document.getElementById('cart-drawer-backdrop').classList.remove('hidden');
  document.getElementById('cart-drawer').classList.remove('translate-x-full');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer-backdrop').classList.add('hidden');
  document.getElementById('cart-drawer').classList.add('translate-x-full');
}

// 7. Instant Buy via WhatsApp
function instantWhatsAppBuy() {
  if (!modalProduct) return;
  const curr = storeSettings.currency_symbol || '₹';
  const cleanPhone = (storeSettings.whatsapp_number || '919876543210').replace(/[^0-9]/g, '');

  const text =
`⚡ *CULT.SPORT ORDER ENQUIRY*
-----------------------------------------
🛍️ *Item:* ${modalProduct.title}
📏 *Size:* ${modalSelectedSize}
🎨 *Color:* ${modalSelectedColor || 'Standard'}
🔢 *Quantity:* ${modalQty}
💰 *Total:* ${curr}${modalProduct.price * modalQty}

Please confirm availability and dispatch!`;

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
}

// 8. Checkout Operations
function openCheckoutModal() {
  if (cart.length === 0) return;
  closeCartDrawer();
  document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  const submitBtn = document.getElementById('place-order-btn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'PROCESSING...';

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const city = document.getElementById('cust-city').value.trim();
  const pincode = document.getElementById('cust-pincode').value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'whatsapp';

  try {
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        shipping_address: address,
        city,
        pincode,
        items: cart,
        payment_method: paymentMethod
      })
    });

    const data = await res.json();
    if (data.success && data.order) {
      cart = [];
      saveCart();
      updateCartUI();

      closeCheckoutModal();

      const curr = storeSettings.currency_symbol || '₹';
      document.getElementById('success-order-num').innerText = data.order.order_number;
      document.getElementById('success-cust-name').innerText = data.order.customer_name;
      document.getElementById('success-order-total').innerText = `${curr}${data.order.total_amount}`;

      const waBtn = document.getElementById('success-whatsapp-btn');
      if (data.whatsapp_url) {
        waBtn.href = data.whatsapp_url;
        waBtn.classList.remove('hidden');
        if (paymentMethod === 'whatsapp') {
          window.open(data.whatsapp_url, '_blank');
        }
      }

      if (paymentMethod === 'razorpay' && window.Razorpay && storeSettings.razorpay_key_id) {
        const options = {
          key: storeSettings.razorpay_key_id,
          amount: Math.round(data.order.total_amount * 100),
          currency: 'INR',
          name: storeSettings.store_name || 'Cult.Sport Activewear',
          description: `Order #${data.order.order_number}`,
          handler: function (rzpRes) {
            showToast('Payment Successful! ID: ' + (rzpRes.razorpay_payment_id || ''));
            document.getElementById('order-success-modal').classList.remove('hidden');
          },
          prefill: {
            name: data.order.customer_name,
            contact: data.order.customer_phone
          },
          theme: { color: '#111111' }
        };
        try {
          const rzp = new Razorpay(options);
          rzp.open();
        } catch (e) {
          document.getElementById('order-success-modal').classList.remove('hidden');
        }
      } else {
        document.getElementById('order-success-modal').classList.remove('hidden');
      }
    } else {
      showToast(data.message || 'Order failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'CONFIRM ORDER';
  }
}

function closeSuccessModal() {
  document.getElementById('order-success-modal').classList.add('hidden');
}

// 9. Order Tracking
function openTrackModal() {
  document.getElementById('track-modal').classList.remove('hidden');
}

function closeTrackModal() {
  document.getElementById('track-modal').classList.add('hidden');
}

async function handleTrackOrder() {
  const query = document.getElementById('track-input').value.trim();
  const resultsContainer = document.getElementById('track-results');

  if (!query) {
    resultsContainer.innerHTML = '<p class="text-xs text-rose-600 font-bold">Please enter Order or Phone #</p>';
    return;
  }

  resultsContainer.innerHTML = '<p class="text-xs text-slate-500">Searching...</p>';

  try {
    const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success && data.orders && data.orders.length > 0) {
      const curr = storeSettings.currency_symbol || '₹';
      resultsContainer.innerHTML = data.orders.map(o => `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div class="flex justify-between font-black">
            <span>#${o.order_number}</span>
            <span class="text-rose-500 uppercase">${o.order_status}</span>
          </div>
          <p class="text-slate-600">Total: <strong>${curr}${o.total_amount}</strong></p>
        </div>
      `).join('');
    } else {
      resultsContainer.innerHTML = '<p class="text-xs text-slate-500">No Cult.Sport orders found.</p>';
    }
  } catch (err) {
    resultsContainer.innerHTML = '<p class="text-xs text-rose-500">Error tracking order.</p>';
  }
}

// 10. Filter Handlers
function filterByGroup(group) {
  currentFilters.category = group;
  currentFilters.subcategory = '';

  // Update Desktop Nav Links
  document.querySelectorAll('.nav-cult-link').forEach(btn => {
    if (btn.dataset.group === group) {
      btn.className = 'nav-cult-link active text-xs font-bold text-black uppercase tracking-wider transition-colors';
    } else {
      btn.className = 'nav-cult-link text-xs font-semibold text-slate-500 hover:text-black uppercase tracking-wider transition-colors';
    }
  });

  // Update Department Tabs
  document.querySelectorAll('.cult-tab').forEach(tab => {
    if (tab.dataset.tab === group) {
      tab.className = 'cult-tab px-3 py-1 rounded transition-all active bg-white text-black shadow-xs';
    } else {
      tab.className = 'cult-tab px-3 py-1 rounded transition-all text-slate-500 hover:text-black';
    }
  });

  // Update Story Circles
  document.querySelectorAll('.story-circle-item').forEach(b => b.classList.remove('active'));
  if (group === 'all') document.getElementById('story-all')?.classList.add('active');

  // Update Bottom Nav
  document.querySelectorAll('.cult-bottom-item').forEach(item => item.classList.remove('active'));
  if (group === 'all') document.getElementById('bnav-home')?.classList.add('active');
  if (group === 'men') document.getElementById('bnav-men')?.classList.add('active');
  if (group === 'kids') document.getElementById('bnav-kids')?.classList.add('active');

  // Update Section Title
  const title = document.getElementById('catalog-title');
  const sub = document.getElementById('catalog-subtitle');
  if (group === 'men') {
    title.innerText = "Men's Activewear";
    sub.innerText = 'Gym tees, trackpants, workout shorts & compression';
  } else if (group === 'kids') {
    title.innerText = "Kids' Sports Wear";
    sub.innerText = 'Football kits, tracksuits, PE training tees & sets';
  } else {
    title.innerText = "All Sports Activewear";
    sub.innerText = 'Showing activewear collection';
  }

  loadProducts();
}

function filterBySubcategory(slug) {
  currentFilters.subcategory = slug;

  // Highlight active story circle
  document.querySelectorAll('.story-circle-item').forEach(b => b.classList.remove('active'));
  const targetStory = document.getElementById(`story-${slug}`);
  if (targetStory) targetStory.classList.add('active');

  loadProducts();
  scrollToProducts();
}

function filterSpecial(type) {
  currentFilters.category = 'all';
  currentFilters.subcategory = '';
  if (type === 'bestseller') {
    currentFilters.bestseller = '1';
    currentFilters.featured = '';
    document.getElementById('catalog-title').innerText = '🔥 CULT BESTSELLERS';
  }
  loadProducts();
  scrollToProducts();
}

function handleFilterChange() {
  currentFilters.size = document.getElementById('size-filter').value;
  currentFilters.sort = document.getElementById('sort-filter').value;
  loadProducts();
}

function resetFilters() {
  currentFilters = {
    category: 'all',
    subcategory: '',
    size: '',
    sort: 'newest',
    search: '',
    featured: '',
    bestseller: ''
  };
  document.getElementById('size-filter').value = '';
  document.getElementById('sort-filter').value = 'newest';
  const sInput = document.getElementById('search-input');
  if (sInput) sInput.value = '';

  filterByGroup('all');
}

function updateFilterStatusBar() {
  const statusBar = document.getElementById('filter-status-bar');
  const statusText = document.getElementById('filter-status-text');
  if (!statusBar || !statusText) return;

  const filters = [];
  if (currentFilters.category !== 'all') filters.push(currentFilters.category === 'men' ? "Men" : "Kids");
  if (currentFilters.subcategory) filters.push(currentFilters.subcategory.replace('men-', '').replace('kids-', '').replace('-', ' ').toUpperCase());
  if (currentFilters.size) filters.push(`Size: ${currentFilters.size}`);
  if (currentFilters.search) filters.push(`"${currentFilters.search}"`);
  if (currentFilters.bestseller) filters.push('Best Sellers');

  if (filters.length > 0) {
    statusText.innerText = filters.join(' • ');
    statusBar.classList.remove('hidden');
    statusBar.classList.add('flex');
  } else {
    statusBar.classList.add('hidden');
  }
}

function scrollToProducts() {
  const sec = document.getElementById('catalog-section');
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentFilters.search = e.target.value.trim();
        loadProducts();
      }, 300);
    });
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast-item bg-slate-950 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-2xl flex items-center gap-2 border border-slate-800';
  t.innerHTML = `<span class="text-rose-500 font-black">✓</span><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
