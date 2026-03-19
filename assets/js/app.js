// assets/js/app.js — TS Tha Main Logic

// ===== SPLASH SCREEN DISMISS =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.classList.add('fade-out');
      splash.classList.add('hidden'); // Ensure both classes for compatibility
    }
    document.body.style.overflow = ''; // Unlock scroll
  }, 2000);
});

// ===== SCROLL ANIMATIONS OBSERVER (Must be defined before use) =====
const observer = new IntersectionObserver(entries => entries.forEach(e => { 
  if (e.isIntersecting) { 
    e.target.classList.add('visible'); 
  } 
}), { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

// ===== PRODUCT DATA =====
const PRODUCTS = [
  { id:1, name:"TS Classic Oversized Tee", category:"oversized", price:490, originalPrice:650, badge:"Best Seller",
    image:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80&fit=crop",
    sizes:["S","M","L","XL","XXL"], description:"เสื้อโอเวอร์ไซส์ผ้า Cotton 100% น้ำหนักเบา ใส่สบายตลอดวัน" },
  { id:2, name:"TS Street Hoodie Vol.2", category:"hoodie", price:890, originalPrice:null, badge:"New",
    image:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80&fit=crop",
    sizes:["S","M","L","XL"], description:"ฮู้ดดี้สตรีทสไตล์ ผ้าหนา ใส่อุ่นสบาย" },
  { id:3, name:"TS Regular Fit Tee", category:"regular", price:390, originalPrice:null, badge:null,
    image:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80&fit=crop",
    sizes:["S","M","L","XL","XXL"], description:"เสื้อทรงปกติ ใส่ง่าย เข้ากับทุกสไตล์" },
  { id:4, name:"TS Limited Dragon Tee", category:"limited", price:1200, originalPrice:null, badge:"Limited",
    image:"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80&fit=crop",
    sizes:["M","L","XL"], description:"Limited Edition มีแค่ 50 ตัวในโลก" },
  { id:5, name:"TS Box Logo Oversized", category:"oversized", price:550, originalPrice:700, badge:"Sale",
    image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&fit=crop",
    sizes:["S","M","L","XL"], description:"Box Logo Design สไตล์มินิมอล" },
  { id:6, name:"TS Zip Hoodie Classic", category:"hoodie", price:990, originalPrice:null, badge:null,
    image:"https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80&fit=crop",
    sizes:["S","M","L","XL","XXL"], description:"ซิปรูดกลาง ผ้า Fleece นุ่ม" },
  { id:7, name:"TS Graphic Tee Vol.3", category:"regular", price:450, originalPrice:null, badge:"New",
    image:"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80&fit=crop",
    sizes:["S","M","L","XL"], description:"กราฟิกอาร์ท ดีไซน์โดยศิลปินไทย" },
  { id:8, name:"TS Gold Label Limited", category:"limited", price:1500, originalPrice:null, badge:"Limited",
    image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80&fit=crop",
    sizes:["M","L"], description:"Gold Label Series ผ้าพรีเมียม สกรีนทองแท้" },
];

// ===== STATE =====
let cart         = JSON.parse(localStorage.getItem('ts-cart') || '[]');
let sliderIndex  = 0;
const SLIDE_TOTAL = 3;
let sliderInterval;
let selectedSize   = '';
let currentProduct = null;
let currentOrderId = '';
const catLabels    = { oversized:'โอเวอร์ไซส์', hoodie:'ฮู้ดดี้', regular:'ทรงปกติ', limited:'Limited' };

// ===== THEME =====
(function initTheme() {
  const t = localStorage.getItem('ts-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  updateThemeIcon(t);
})();

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ts-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// ===== HERO SLIDER =====
function initSlider() {
  const dotsEl = document.getElementById('sliderDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 0; i < SLIDE_TOTAL; i++) {
    const dot = document.createElement('button');
    dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `slide-${i}`);
    dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); });
    dotsEl.appendChild(dot);
  }
  startAutoSlide();
}

function goToSlide(i) {
  sliderIndex = (i + SLIDE_TOTAL) % SLIDE_TOTAL;
  const el = document.getElementById('heroSlider');
  if (el) el.style.transform = `translateX(-${sliderIndex * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d, j) => d.classList.toggle('active', j === sliderIndex));
}

function startAutoSlide() {
  clearInterval(sliderInterval);
  sliderInterval = setInterval(() => goToSlide(sliderIndex + 1), 4500);
}

document.getElementById('sliderPrev')?.addEventListener('click', () => { goToSlide(sliderIndex - 1); startAutoSlide(); });
document.getElementById('sliderNext')?.addEventListener('click', () => { goToSlide(sliderIndex + 1); startAutoSlide(); });
initSlider();

// ===== PRODUCTS =====
function renderProducts(filter) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const list = (!filter || filter === 'all') ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = list.map((p, idx) => `
    <div class="product-card animate-on-scroll" style="transition-delay:${idx * 0.08}s" data-id="${p.id}">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy"/>
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <div class="product-quick-actions">
          <button class="quick-btn" onclick="openProductModal(${p.id})" aria-label="view-${p.id}" title="ดูรายละเอียด">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${catLabels[p.category] || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-row">
          <div class="product-price">
            ${p.originalPrice ? `<span class="original">฿${p.originalPrice.toLocaleString()}</span>` : ''}
            ฿${p.price.toLocaleString()}
          </div>
          <button class="btn-add-cart" onclick="openProductModal(${p.id})" aria-label="order-${p.id}"><i class="fa-solid fa-cart-shopping"></i> สั่งซื้อ</button>
        </div>
      </div>
    </div>
  `).join('');
  // Re-observe new product cards for scroll animation
  document.querySelectorAll('.product-card.animate-on-scroll').forEach(el => observer.observe(el));
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.filter);
  });
});
renderProducts('all');

// ===== PRODUCT MODAL =====
function openProductModal(id) {
  currentProduct = PRODUCTS.find(p => p.id === id);
  if (!currentProduct) return;
  selectedSize = '';
  document.getElementById('productModalContent').innerHTML = `
    <div class="product-modal-img">
      <img src="${currentProduct.image}" alt="${currentProduct.name}"/>
    </div>
    <div class="product-modal-info">
      <div class="product-category">${catLabels[currentProduct.category]}</div>
      <h3 style="font-size:1.4rem;font-weight:800;margin-bottom:8px;">${currentProduct.name}</h3>
      <div style="font-size:1.8rem;font-weight:900;color:var(--gold);margin-bottom:12px;">
        ${currentProduct.originalPrice ? `<span style="font-size:1rem;color:var(--text-muted);text-decoration:line-through;font-weight:400;margin-right:8px;">฿${currentProduct.originalPrice.toLocaleString()}</span>` : ''}
        ฿${currentProduct.price.toLocaleString()}
      </div>
      <p style="color:var(--text-secondary);font-size:0.95rem;line-height:1.7;margin-bottom:16px;">${currentProduct.description}</p>
      <div style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:10px;">เลือกไซส์:</div>
      <div class="size-btns">
        ${currentProduct.sizes.map(s => `<button class="size-btn" onclick="selectSize('${s}',this)" aria-label="size-${s}">${s}</button>`).join('')}
      </div>
      <div id="modalAction" style="display:none; margin-top:16px;">
        <button class="btn-primary" style="width:100%;justify-content:center;font-size:1rem;padding:15px;" onclick="addToCartFromModal()">
          <i class="fa-solid fa-cart-plus"></i> เพิ่มลงตะกร้า
        </button>
      </div>
      <div id="sizeHint" style="text-align:center; color:var(--text-muted); font-size:0.85rem; margin-top:20px;">
        <i class="fa-solid fa-info-circle"></i> กรุณาเลือกไซส์เพื่อดำเนินการต่อ
      </div>
    </div>
  `;
  openModal('productModal');
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // แสดงปุ่มเพิ่มลงตะกร้าเมื่อเลือกไซส์แล้ว
  const action = document.getElementById('modalAction');
  const hint = document.getElementById('sizeHint');
  if(action) action.style.display = 'block';
  if(hint) hint.style.display = 'none';
}

function addToCartFromModal() {
  if (!selectedSize) { showToast('⚠️ กรุณาเลือกไซส์ก่อน', 'warning'); return; }
  addToCart(currentProduct, selectedSize);
  closeModal('productModal');
}

function quickAddToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (p) addToCart(p, p.sizes[0]);
}

// expose to HTML onclick
window.openProductModal  = openProductModal;
window.selectSize        = selectSize;
window.addToCartFromModal = addToCartFromModal;
window.quickAddToCart    = quickAddToCart;

// ===== CART =====
function addToCart(product, size) {
  const ex = cart.find(i => i.id === product.id && i.size === size);
  if (ex) ex.qty++;
  else cart.push({ id:product.id, name:product.name, price:product.price, image:product.image, size, qty:1 });
  saveCart(); updateCartUI();
  showToast('เพิ่ม ' + product.name + ' (' + size + ') แล้ว!', 'success');
}

function saveCart() { localStorage.setItem('ts-cart', JSON.stringify(cart)); }

function updateCartUI() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) { el.textContent = count; el.classList.toggle('active', count > 0); }
  renderCartItems();
}

function renderCartItems() {
  const body   = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body) return;

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <div class="icon">🛒</div><p>ยังไม่มีสินค้าในรถเข็น</p>
      <button class="btn-primary" onclick="closeCart();document.getElementById('shop').scrollIntoView({behavior:'smooth'})">เลือกสินค้า</button>
    </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  body.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-variant">ไซส์: ${item.size}</div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${idx},-1)" aria-label="decrease">–</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx},1)" aria-label="increase">+</button>
          </div>
          <span class="cart-item-price">฿${(item.price * item.qty).toLocaleString()}</span>
          <button class="cart-item-remove" onclick="removeFromCart(${idx})" aria-label="remove">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = `฿${total.toLocaleString()}`;
  if (footer) footer.style.display = 'block';
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(); updateCartUI();
}
function removeFromCart(idx) {
  cart.splice(idx, 1); saveCart(); updateCartUI();
  showToast('ลบสินค้าออกแล้ว');
}

window.changeQty      = changeQty;
window.removeFromCart = removeFromCart;

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeCart = closeCart;

document.getElementById('cartBtn')?.addEventListener('click', openCart);

// ===== CHECKOUT REQUIRES LOGIN =====
let pendingCheckout = false;

document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  const user = auth.currentUser;
  if (!user) {
    // ยังไม่ได้ login → บังคับ login ก่อน แล้วค่อย checkout
    pendingCheckout = true;
    closeCart();
    openModal('loginModal');
    showToast('⚠️ กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning');
  } else {
    closeCart();
    openCheckout();
  }
});

// ===== CHECKOUT =====
function openCheckout() {
  if (!cart.length) return;
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const summary = document.getElementById('checkoutSummary');
  if (summary) summary.innerHTML = `
    ${cart.map(i => `<div class="checkout-summary-item"><span>${i.name} (${i.size}) × ${i.qty}</span><span>฿${(i.price*i.qty).toLocaleString()}</span></div>`).join('')}
    <div class="checkout-summary-total"><span>รวม</span><span style="color:var(--gold)">฿${total.toLocaleString()}</span></div>
  `;
  openModal('checkoutModal');
}

document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('[type="submit"]');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังดำเนินการ...';
  btn.disabled = true;

  const orderData = {
    customer: {
      firstName: document.getElementById('firstName').value,
      lastName:  document.getElementById('lastName').value,
      phone:     document.getElementById('phone').value,
      address:   document.getElementById('address').value,
      district:  document.getElementById('district').value,
      amphoe:    document.getElementById('amphoe').value,
      province:  document.getElementById('province').value,
      zipcode:   document.getElementById('zipcode').value,
      note:      document.getElementById('note').value,
    },
    items: [...cart],
    total: cart.reduce((a, i) => a + i.price * i.qty, 0),
  };

  try {
    const orderId = await createOrder(orderData);   // from firebase.js
    currentOrderId = orderId;
    document.getElementById('displayOrderId').textContent = orderId;
    closeModal('checkoutModal');
    openModal('orderSuccessModal');
    cart = []; saveCart(); updateCartUI();
    e.target.reset();
  } catch (err) {
    console.error(err);
    showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-check"></i> ยืนยันการสั่งซื้อ';
    btn.disabled = false;
  }
});

// ===== COPY ORDER ID =====
function copyOrderId() {
  navigator.clipboard.writeText(currentOrderId).then(() => {
    const btn = document.getElementById('copyBtn');
    if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> คัดลอกแล้ว!'; setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-copy"></i> คัดลอก Order ID'; }, 2000); }
    showToast('✅ คัดลอก Order ID แล้ว!', 'success');
  });
}
window.copyOrderId = copyOrderId;

// ===== TRACK ORDER =====
async function trackOrder() {
  const input  = document.getElementById('trackInput').value.trim();
  const result = document.getElementById('trackResult');
  if (!input) { showToast('⚠️ กรุณาใส่ Order ID'); return; }
  result.innerHTML = '<p style="color:var(--text-muted);text-align:center;">🔍 กำลังค้นหา...</p>';
  try {
    const order = await getOrderByOrderId(input);  // from firebase.js
    if (!order) {
      result.innerHTML = `<div style="text-align:center;color:var(--danger);padding:20px;">
        <i class="fa-solid fa-circle-xmark fa-2x"></i>
        <p style="margin-top:12px;font-weight:600;">ไม่พบ Order ID นี้</p>
      </div>`;
      return;
    }
    const statusLabels = { pending:'⏳ รอดำเนินการ', confirmed:'✅ ยืนยันแล้ว', shipped:'🚚 จัดส่งแล้ว', cancelled:'❌ ยกเลิก' };
    result.innerHTML = `
      <div style="background:var(--bg-secondary);border-radius:14px;padding:20px;border:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <strong>${order.orderId}</strong>
          <span style="color:var(--gold);font-weight:700;">${statusLabels[order.status] || order.status}</span>
        </div>
        <div style="font-size:0.9rem;color:var(--text-secondary);">ผู้รับ: ${order.customer.firstName} ${order.customer.lastName}</div>
        ${order.trackingNumber ? `<div style="margin-top:10px;padding:10px;background:rgba(34,197,94,0.1);border-radius:10px;color:var(--success);font-weight:600;">📦 เลขพัสดุ: ${order.trackingNumber}</div>` : ''}
      </div>
    `;
  } catch (err) {
    result.innerHTML = '<p style="color:var(--danger);text-align:center;">เกิดข้อผิดพลาด</p>';
  }
}
window.trackOrder = trackOrder;

// ===== AUTH =====
async function handleGoogleLogin() {
  try {
    await loginWithGoogle();
    closeModal('loginModal');
    showToast('✅ เข้าสู่ระบบสำเร็จ!', 'success');
  } catch { showToast('❌ เข้าสู่ระบบไม่สำเร็จ', 'error'); }
}
window.handleGoogleLogin = handleGoogleLogin;

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await loginWithEmail(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
    closeModal('loginModal'); showToast('✅ เข้าสู่ระบบสำเร็จ!', 'success');
  } catch { showToast('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error'); }
});

// ✅ ตรวจจำ Auth State — ถ้า Login แล้ว ปุ่ม User = Dropdown, เปล่าไส Login Modal
onAuthChange((user) => {
  const wrap     = document.getElementById('userMenuWrap');
  const icon     = document.getElementById('userIcon');
  const nameEl   = document.getElementById('userDisplayName');
  const emailEl  = document.getElementById('userEmail');
  const avatar   = document.getElementById('userAvatar');

  if (user) {
    // ล็อกอินแล้ว → แสดง dropdown
    if (icon) icon.className = 'fa-solid fa-user-check';
    if (nameEl) nameEl.textContent = user.displayName || 'สมาชิก';
    if (emailEl) emailEl.textContent = user.email;
    if (avatar && user.photoURL) {
      avatar.src = user.photoURL;
      avatar.style.display = 'block';
    }

    // เพิ่มปุ่มพิเศษใน dropdown สำหรับ User ที่ล็อกอินแล้ว
    const dropdown = document.getElementById('userDropdown');
    const existingManage = document.getElementById('manageBtn');
    if (!existingManage) {
        const hr = document.createElement('hr');
        hr.id = 'menuDivider';
        hr.style.borderColor = 'var(--border)';
        hr.style.margin = '8px 0';
        
        const trackBtnMenu = document.createElement('button');
        trackBtnMenu.className = 'user-dropdown-item';
        trackBtnMenu.innerHTML = '<i class="fa-solid fa-box"></i> ติดตามออเดอร์';
        trackBtnMenu.onclick = () => { openModal('trackModal'); wrap.classList.remove('open'); };
        
        // ถ้าเป็น Admin (เมลเจ้าของ) ให้เพิ่มปุ่ม Admin Panel
        if (user.email === 'xzrubik@gmail.com') {
            const adminBtn = document.createElement('button');
            adminBtn.className = 'user-dropdown-item';
            adminBtn.style.color = 'var(--gold)';
            adminBtn.id = 'manageBtn';
            adminBtn.innerHTML = '<i class="fa-solid fa-gauge-high"></i> ระบบหลังบ้าน (Admin)';
            adminBtn.onclick = () => window.location.href = 'admin/index.html';
            
            dropdown.insertBefore(hr, document.getElementById('logoutBtn'));
            dropdown.insertBefore(adminBtn, document.getElementById('logoutBtn'));
            dropdown.insertBefore(trackBtnMenu, document.getElementById('logoutBtn'));
        } else {
            dropdown.insertBefore(hr, document.getElementById('logoutBtn'));
            dropdown.insertBefore(trackBtnMenu, document.getElementById('logoutBtn'));
        }
    }
  } else {
    // ยังไม่ล็อกอิน → ล้างปุ่มพิเศษออก
    if (icon) icon.className = 'fa-solid fa-user';
    if (nameEl) nameEl.textContent = '';
    if (emailEl) emailEl.textContent = '';
    if (avatar) avatar.style.display = 'none';
    
    // ลบปุ่ม Admin/Track ในเมนูออก
    document.getElementById('manageBtn')?.remove();
    document.getElementById('menuDivider')?.remove();
    document.querySelectorAll('.user-dropdown-item').forEach(item => {
        if(item.innerHTML.includes('ติดตามออเดอร์')) item.remove();
    });
  }

  // ถ้า login สำเร็จ และมี pending checkout → ไปหน้า checkout เลย
  if (user && pendingCheckout) {
    pendingCheckout = false;
    closeModal('loginModal');
    setTimeout(() => openCheckout(), 300);
  }
});

// Login Button — ถ้า Login แล้ว เปิด dropdown, ยังไม่ Login เปิด modal
document.getElementById('loginBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const user = auth.currentUser;
  const wrap = document.getElementById('userMenuWrap');
  if (user) {
    wrap?.classList.toggle('open');
  } else {
    openModal('loginModal');
  }
});

// ปิด dropdown เมื่อคลิกที่อื่น
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('userMenuWrap');
  if (wrap && !wrap.contains(e.target)) wrap.classList.remove('open');
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await logoutUser();
  document.getElementById('userMenuWrap')?.classList.remove('open');
  showToast('👋 ออกจากระบบแล้ว', 'success');
});

// ===== MODALS =====
function openModal(id)  { document.getElementById(id)?.classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow = ''; }
window.openModal  = openModal;
window.closeModal = closeModal;

document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id)); closeCart(); } });

// ===== TOAST =====
function showToast(msg, type = 'default') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {success:'<i class="fa-solid fa-circle-check"></i>',error:'<i class="fa-solid fa-circle-xmark"></i>',warning:'<i class="fa-solid fa-triangle-exclamation"></i>',default:'<i class="fa-solid fa-bell"></i>'};
  t.innerHTML = `<span class="toast-icon">${icons[type]||icons.default}</span><span class="toast-text">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
window.showToast = showToast;



// ===== INIT =====
updateCartUI();
// Observe initial static elements
document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
