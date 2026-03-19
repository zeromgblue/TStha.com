// admin/admin.js — TS Tha Admin Panel Logic (CDN Compat)

const ADMIN_EMAILS = ['xzrubik@gmail.com'];

let allOrders  = [];
let allProducts = [];

// ===== THEME =====
(function initTheme() {
  const t = localStorage.getItem('ts-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  const icon = document.getElementById('adminThemeIcon');
  if (icon) icon.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
})();

document.getElementById('adminThemeToggle')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ts-theme', next);
  const icon = document.getElementById('adminThemeIcon');
  if (icon) icon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

// ===== AUTH GATE =====
onAuthChange((user) => {
  if (user && ADMIN_EMAILS.includes(user.email)) {
    document.getElementById('adminLoginGate').style.display = 'none';
    document.getElementById('adminApp').style.display = 'grid';
    document.getElementById('adminUserName').textContent = user.displayName || user.email;
    initAdmin();
  } else {
    document.getElementById('adminLoginGate').style.display = 'flex';
    document.getElementById('adminApp').style.display = 'none';
  }
});

document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = document.getElementById('adminLoginBtn');
  const errEl = document.getElementById('loginError');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
  btn.disabled  = true;
  errEl.textContent = '';
  try {
    await loginWithEmail(
      document.getElementById('adminEmail').value,
      document.getElementById('adminPassword').value
    );
  } catch {
    errEl.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> เข้าสู่ระบบ';
    btn.disabled  = false;
  }
});

// ✅ Google Sign-in สำหรับ Admin
document.getElementById('adminGoogleBtn')?.addEventListener('click', async () => {
  const btn   = document.getElementById('adminGoogleBtn');
  const errEl = document.getElementById('loginError');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
  btn.disabled  = true;
  errEl.textContent = '';
  try {
    await loginWithGoogle();
  } catch (err) {
    errEl.textContent = 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่';
    btn.innerHTML = '<img src="https://www.google.com/favicon.ico" width="20" alt="Google"/> เข้าสู่ระบบด้วย Google';
    btn.disabled  = false;
  }
});

document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
  await logoutUser();
  showToast('ออกจากระบบแล้ว');
});

// ===== SIDEBAR NAV =====
document.querySelectorAll('.sidebar-link').forEach(btn => {
  btn.addEventListener('click', () => switchPage(btn.dataset.page));
});

function switchPage(page) {
  document.querySelectorAll('.sidebar-link').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.admin-page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  const titles = { dashboard:'Dashboard', orders:'คำสั่งซื้อ', products:'จัดการสินค้า', settings:'ตั้งค่า' };
  document.getElementById('pageTitle').textContent = titles[page] || page;
}
window.switchPage = switchPage;

document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
});

// ===== INIT =====
async function initAdmin() {
  await Promise.all([loadOrders(), loadProducts()]);
}

// ===== ORDERS =====
async function loadOrders() {
  try {
    allOrders = await getAllOrders();
    renderOrders(allOrders);
    updateDashboard(allOrders);
  } catch (err) { console.error(err); }
}
window.loadOrders = loadOrders;

function updateDashboard(orders) {
  const pending = orders.filter(o => o.status === 'pending').length;
  const shipped = orders.filter(o => o.status === 'shipped').length;
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + (o.total || 0), 0);

  document.getElementById('statTotal').textContent    = orders.length;
  document.getElementById('statPending').textContent  = pending;
  document.getElementById('statShipped').textContent  = shipped;
  document.getElementById('statRevenue').textContent  = `฿${revenue.toLocaleString()}`;

  const badge = document.getElementById('pendingBadge');
  if (badge) { badge.textContent = pending; badge.classList.toggle('active', pending > 0); }

  renderRecentOrders(orders.slice(0, 5));
}

function renderRecentOrders(orders) {
  const el = document.getElementById('recentOrdersList');
  if (!el) return;
  if (!orders.length) { el.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>ยังไม่มีคำสั่งซื้อ</p></div>'; return; }
  el.innerHTML = `
    <table class="orders-table">
      <thead><tr><th>Order ID</th><th>ลูกค้า</th><th>ยอดรวม</th><th>สถานะ</th><th></th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td><strong>${o.orderId}</strong></td>
            <td>${o.customer?.firstName||''} ${o.customer?.lastName||''}</td>
            <td style="color:var(--gold);font-weight:700;">฿${(o.total||0).toLocaleString()}</td>
            <td>${statusBadge(o.status)}</td>
            <td><button class="action-btn" onclick="openOrderDetail('${o.id}')"><i class="fa-solid fa-eye"></i></button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderOrders(orders) {
  const el = document.getElementById('ordersTable');
  if (!el) return;
  if (!orders.length) { el.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>ไม่พบคำสั่งซื้อ</p></div>'; return; }
  el.innerHTML = `
    <table class="orders-table">
      <thead><tr><th>Order ID</th><th>ลูกค้า</th><th>เบอร์โทร</th><th>สินค้า</th><th>ยอดรวม</th><th>สถานะ</th><th>วันที่</th><th>จัดการ</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td><strong style="color:var(--gold);">${o.orderId}</strong></td>
            <td>${o.customer?.firstName||''} ${o.customer?.lastName||''}</td>
            <td>${o.customer?.phone||'-'}</td>
            <td>${(o.items||[]).length} ชิ้น</td>
            <td style="font-weight:700;">฿${(o.total||0).toLocaleString()}</td>
            <td>${statusBadge(o.status)}</td>
            <td style="color:var(--text-muted);font-size:0.8rem;">${formatDate(o.createdAt)}</td>
            <td><button class="action-btn" onclick="openOrderDetail('${o.id}')"><i class="fa-solid fa-eye"></i></button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function searchOrder() {
  const q = document.getElementById('orderSearchInput').value.toLowerCase().trim();
  if (!q) { renderOrders(allOrders); return; }
  renderOrders(allOrders.filter(o =>
    o.orderId?.toLowerCase().includes(q) ||
    (o.customer?.firstName + ' ' + o.customer?.lastName).toLowerCase().includes(q) ||
    o.customer?.phone?.includes(q)
  ));
}
function filterOrders() {
  const status = document.getElementById('orderStatusFilter').value;
  renderOrders(status === 'all' ? allOrders : allOrders.filter(o => o.status === status));
}
window.searchOrder = searchOrder;
window.filterOrders = filterOrders;

// ===== ORDER DETAIL MODAL =====
function openOrderDetail(docId) {
  const order = allOrders.find(o => o.id === docId);
  if (!order) return;
  const statusLabels = { pending:'⏳ รอดำเนินการ', confirmed:'✅ ยืนยันแล้ว', shipped:'🚚 จัดส่งแล้ว', cancelled:'❌ ยกเลิก' };
  document.getElementById('orderDetailContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <span style="font-size:1.2rem;font-weight:900;color:var(--gold);">${order.orderId}</span>
      ${statusBadge(order.status)}
    </div>
    <div class="order-detail-section">
      <h4>ข้อมูลลูกค้า</h4>
      <div class="order-detail-grid">
        <div class="order-detail-item"><label>ชื่อ-นามสกุล</label><span>${order.customer?.firstName||''} ${order.customer?.lastName||''}</span></div>
        <div class="order-detail-item"><label>เบอร์โทร</label><span>${order.customer?.phone||'-'}</span></div>
        <div class="order-detail-item" style="grid-column:1/-1;"><label>ที่อยู่</label><span>${order.customer?.address||''} ต.${order.customer?.district||''} อ.${order.customer?.amphoe||''} จ.${order.customer?.province||''} ${order.customer?.zipcode||''}</span></div>
        ${order.customer?.note ? `<div class="order-detail-item" style="grid-column:1/-1;"><label>หมายเหตุ</label><span>${order.customer.note}</span></div>` : ''}
      </div>
    </div>
    <div class="order-detail-section">
      <h4>รายการสินค้า</h4>
      <div class="order-items-list">
        ${(order.items||[]).map(i => `
          <div class="order-item-row">
            <span>${i.name} (ไซส์: ${i.size}) × ${i.qty}</span>
            <strong style="color:var(--gold);">฿${(i.price*i.qty).toLocaleString()}</strong>
          </div>
        `).join('')}
      </div>
      <div style="text-align:right;font-size:1.1rem;font-weight:800;">ยอดรวม: <span style="color:var(--gold);">฿${(order.total||0).toLocaleString()}</span></div>
    </div>
    <div class="order-detail-section">
      <h4>เปลี่ยนสถานะ</h4>
      <div class="status-controls">
        <button class="status-btn ${order.status==='pending'?'active':''}" onclick="changeStatus('${docId}','pending')">⏳ รอดำเนินการ</button>
        <button class="status-btn ${order.status==='confirmed'?'active':''}" onclick="changeStatus('${docId}','confirmed')">✅ ยืนยันแล้ว</button>
        <button class="status-btn ${order.status==='shipped'?'active':''}" onclick="changeStatus('${docId}','shipped')">🚚 จัดส่งแล้ว</button>
        <button class="status-btn ${order.status==='cancelled'?'active':''}" onclick="changeStatus('${docId}','cancelled')">❌ ยกเลิก</button>
      </div>
    </div>
    <div class="order-detail-section">
      <h4>เลขพัสดุ</h4>
      <div style="display:flex;gap:10px;">
        <input type="text" id="trackingInput" class="form-input" placeholder="เช่น EY123456789TH" value="${order.trackingNumber||''}" style="flex:1;"/>
        <button class="btn-primary" onclick="saveTracking('${docId}')" style="padding:10px 18px;"><i class="fa-solid fa-floppy-disk"></i> บันทึก</button>
      </div>
    </div>
  `;
  openModal('orderDetailModal');
}
window.openOrderDetail = openOrderDetail;

async function changeStatus(docId, status) {
  try {
    const tracking = allOrders.find(o => o.id === docId)?.trackingNumber || '';
    await updateOrderStatus(docId, status, tracking);
    const o = allOrders.find(o => o.id === docId);
    if (o) o.status = status;
    showToast(`✅ เปลี่ยนสถานะสำเร็จ`, 'success');
    openOrderDetail(docId);
    updateDashboard(allOrders);
    renderOrders(allOrders);
  } catch { showToast('❌ เกิดข้อผิดพลาด', 'error'); }
}
window.changeStatus = changeStatus;

async function saveTracking(docId) {
  const tracking = document.getElementById('trackingInput').value.trim();
  const o = allOrders.find(x => x.id === docId);
  try {
    await updateOrderStatus(docId, o?.status || 'shipped', tracking);
    if (o) o.trackingNumber = tracking;
    showToast('✅ บันทึกเลขพัสดุแล้ว!', 'success');
  } catch { showToast('❌ เกิดข้อผิดพลาด', 'error'); }
}
window.saveTracking = saveTracking;

// ===== PRODUCTS =====
async function loadProducts() {
  try {
    allProducts = await getAllProducts();
    renderProductsAdmin(allProducts);
  } catch (err) { console.error(err); }
}

function renderProductsAdmin(products) {
  const grid = document.getElementById('productsAdminGrid');
  if (!grid) return;
  if (!products.length) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="icon">👕</div><p>ยังไม่มีสินค้า</p></div>'; return; }
  grid.innerHTML = products.map(p => `
    <div class="product-admin-card">
      <img src="${p.image||'https://via.placeholder.com/300x200?text=No+Image'}" alt="${p.name}"/>
      <div class="product-admin-info">
        <div class="product-admin-name">${p.name}</div>
        <div class="product-admin-price">฿${(p.price||0).toLocaleString()}</div>
        <div class="product-admin-actions">
          <button class="action-btn" style="flex:1;" onclick="deleteProductItem('${p.id}')" aria-label="delete">
            <i class="fa-solid fa-trash"></i> ลบ
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteProductItem(docId) {
  if (!confirm('ลบสินค้านี้ใช่ไหม?')) return;
  try {
    await deleteProduct(docId);
    allProducts = allProducts.filter(p => p.id !== docId);
    renderProductsAdmin(allProducts);
    showToast('🗑️ ลบสินค้าแล้ว', 'success');
  } catch { showToast('❌ เกิดข้อผิดพลาด', 'error'); }
}
window.deleteProductItem = deleteProductItem;

document.getElementById('addProductForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name:        document.getElementById('prodName').value,
    price:       Number(document.getElementById('prodPrice').value),
    category:    document.getElementById('prodCategory').value,
    sizes:       document.getElementById('prodSizes').value.split(',').map(s => s.trim()),
    description: document.getElementById('prodDesc').value,
    image:       document.getElementById('prodImage').value,
  };
  try {
    await addProduct(data, null);
    showToast('✅ เพิ่มสินค้าสำเร็จ!', 'success');
    closeModal('addProductModal');
    e.target.reset();
    await loadProducts();
  } catch { showToast('❌ เกิดข้อผิดพลาด', 'error'); }
});

// ===== HELPERS =====
function statusBadge(status) {
  const map = {
    pending:   ['status-pending',   '⏳ รอดำเนินการ'],
    confirmed: ['status-confirmed', '✅ ยืนยันแล้ว'],
    shipped:   ['status-shipped',   '🚚 จัดส่งแล้ว'],
    cancelled: ['status-cancelled', '❌ ยกเลิก'],
  };
  const [cls, label] = map[status] || ['status-pending', 'ไม่ระบุ'];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function formatDate(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' });
}

function showToast(msg, type = 'default') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${{success:'✅',error:'❌',warning:'⚠️',default:'💬'}[type]||'💬'}</span><span class="toast-text">${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function openModal(id)  { document.getElementById(id)?.classList.add('open');    document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; }
window.openModal  = openModal;
window.closeModal = closeModal;

document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target===o) closeModal(o.id); }));
document.addEventListener('keydown', e => { if (e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id)); });
