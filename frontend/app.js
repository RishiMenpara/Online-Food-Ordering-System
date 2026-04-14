const API = 'http://localhost:3000/api';

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
async function apiFetch(url, opts = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data;
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function loading(tbodyId, cols) {
  document.getElementById(tbodyId).innerHTML =
    `<tr><td colspan="${cols}"><div class="loading"><div class="spinner"></div>Loading…</div></td></tr>`;
}

function emptyState(tbodyId, cols, msg = 'No data found') {
  document.getElementById(tbodyId).innerHTML =
    `<tr><td colspan="${cols}"><div class="empty-state"><div class="empty-icon">📭</div><p>${msg}</p></div></td></tr>`;
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function filterTable(tableId, inputId, colIndex) {
  const q = document.getElementById(inputId).value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  rows.forEach(r => {
    const cell = r.cells[colIndex];
    r.style.display = cell && cell.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (['delivered', 'paid', 'completed'].some(x => s.includes(x))) return `<span class="badge badge-success">${status}</span>`;
  if (s.includes('pending')) return `<span class="badge badge-warning">${status}</span>`;
  return `<span class="badge badge-violet">${status}</span>`;
}

function payBadge(method) {
  const m = { upi: 'badge-violet', card: 'badge-info', cash: 'badge-teal' };
  return `<span class="badge ${m[method?.toLowerCase()] || 'badge-orange'}">${method}</span>`;
}

// ═══════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════
const TAB_TITLES = {
  dashboard: ['📊 Dashboard', 'Live analytics from your FOS database'],
  customers: ['👤 Customers', 'Table: Customer — CRUD Operations'],
  restaurants: ['🏪 Restaurants', 'Table: Restaurant — Filter & View'],
  menu: ['🍔 Menu Items', 'Table: Menu_Item — JOIN with Restaurant'],
  orders: ['📦 Orders', 'Tables: Orders + Customer + Restaurant — 3-way JOIN'],
  orderitems: ['🧾 Order Items', 'Tables: Order_Item + Menu_Item — Detail View'],
  payments: ['💳 Payments', 'Table: Payment — GROUP BY PaymentMethod'],
  deliveryperson: ['🚴 Delivery Persons', 'Table: Delivery_Person — LEFT JOIN Delivery'],
  delivery: ['🛵 Delivery Tracking', 'Table: Delivery — 4-Table JOIN'],
  queries: ['🔍 SQL Query Lab', 'Run all 80+ DBMS queries live'],
};

function switchTab(name, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  el.classList.add('active');
  const [title, sub] = TAB_TITLES[name] || ['FoodieDB', ''];
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-sub').textContent = sub;
  // Lazy load
  const loaders = {
    dashboard: loadDashboard,
    customers: loadCustomers,
    restaurants: loadRestaurants,
    menu: loadMenu,
    orders: loadOrders,
    orderitems: loadOrderItems,
    payments: loadPayments,
    deliveryperson: loadDeliveryPersons,
    delivery: loadDelivery,
    queries: initQueryLab,
  };
  if (loaders[name]) loaders[name]();
}

// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const d = await apiFetch('/dashboard');
    document.getElementById('stat-customers').textContent = d.totalCustomers;
    document.getElementById('stat-restaurants').textContent = d.totalRestaurants;
    document.getElementById('stat-orders').textContent = d.totalOrders;
    document.getElementById('stat-revenue').textContent = '₹' + Number(d.totalRevenue).toLocaleString();
    document.getElementById('stat-avg').textContent = '₹' + Math.round(d.avgOrder);
    document.getElementById('stat-max').textContent = '₹' + Number(d.maxOrder).toLocaleString();

    // Revenue bar chart
    const maxRev = Math.max(...d.revenueByRestaurant.map(r => r.Revenue));
    const colors = ['var(--grad-hero)', 'var(--grad-orange)', 'var(--grad-teal)', 'var(--grad-pink)', 'var(--grad-green)'];
    document.getElementById('revenue-chart').innerHTML = d.revenueByRestaurant.map((r, i) => `
      <div class="chart-bar-item">
        <span class="chart-bar-label">${r.RestName}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${(r.Revenue / maxRev * 100).toFixed(1)}%;background:${colors[i % colors.length]}"></div>
        </div>
        <span class="chart-bar-value">₹${Number(r.Revenue).toLocaleString()}</span>
      </div>`).join('');

    // Payment methods
    const pmColors = { upi: '#8b5cf6', card: '#3b82f6', cash: '#14b8a6' };
    document.getElementById('payment-chart').innerHTML = d.paymentMethods.map(p => `
      <div class="payment-item">
        <div class="payment-left">
          <div class="payment-dot" style="background:${pmColors[p.PaymentMethod?.toLowerCase()] || '#f97316'}"></div>
          <div>
            <div style="font-weight:700;font-size:0.9rem">${p.PaymentMethod}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${p.TransactionCount || ''} transactions</div>
          </div>
        </div>
        <div style="font-weight:800;font-size:1rem;color:var(--text)">₹${Number(p.Total).toLocaleString()}</div>
      </div>`).join('');
  } catch (e) { toast('Failed to load dashboard: ' + e.message, 'error'); }
}

// ═══════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════
async function loadCustomers() {
  loading('customers-body', 6);
  document.getElementById('customers-view-title').textContent = 'All Customers — SELECT * FROM Customer';
  try {
    const data = await apiFetch('/customers');
    renderCustomers(data, true);
  } catch (e) { emptyState('customers-body', 6, e.message); }
}

async function loadActiveCustomers() {
  loading('customers-body', 6);
  document.getElementById('customers-view-title').textContent = 'Customers Who Have Placed Orders (Subquery: IN)';
  try {
    const data = await apiFetch('/customers/active');
    document.getElementById('customers-body').innerHTML = data.map(r =>
      `<tr><td colspan="2">${r.Name}</td><td colspan="4" style="color:var(--text-muted)">Has placed orders</td></tr>`
    ).join('') || `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>None</p></div></td></tr>`;
  } catch (e) { emptyState('customers-body', 6, e.message); }
}

async function loadHighSpenders() {
  loading('customers-body', 6);
  document.getElementById('customers-view-title').textContent = 'Customers Who Spent Above Average (Subquery)';
  try {
    const data = await apiFetch('/customers/highspenders');
    document.getElementById('customers-body').innerHTML = data.map(r =>
      `<tr><td colspan="2">${r.Name}</td><td colspan="4"><span class="badge badge-violet">⬆ High Spender</span></td></tr>`
    ).join('') || `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>None</p></div></td></tr>`;
  } catch (e) { emptyState('customers-body', 6, e.message); }
}

function renderCustomers(data, showActions = false) {
  if (!data.length) { emptyState('customers-body', 6); return; }
  document.getElementById('customers-body').innerHTML = data.map(r => `
    <tr>
      <td><span class="badge badge-violet">${r.CustomerID}</span></td>
      <td><strong>${r.Name}</strong></td>
      <td>${r.Phone}</td>
      <td>${r.Email}</td>
      <td>${r.Address}</td>
      <td>${showActions ? `
        <div class="btn-group">
          <button class="btn btn-ghost btn-sm" onclick="openEditCustomer(${r.CustomerID},'${r.Phone}','${r.Address}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${r.CustomerID})">🗑</button>
        </div>` : '—'}</td>
    </tr>`).join('');
}

async function addCustomer() {
  const CustomerID = document.getElementById('add-cust-id').value;
  const Name = document.getElementById('add-cust-name').value;
  const Phone = document.getElementById('add-cust-phone').value;
  const Email = document.getElementById('add-cust-email').value;
  const Address = document.getElementById('add-cust-address').value;
  if (!CustomerID || !Name || !Phone || !Email) { toast('Fill all required fields!', 'error'); return; }
  try {
    await apiFetch('/customers', { method: 'POST', body: JSON.stringify({ CustomerID, Name, Phone, Email, Address }) });
    toast('Customer added successfully!', 'success');
    closeModal('modal-add-customer');
    loadCustomers();
  } catch (e) { toast(e.message, 'error'); }
}

function openEditCustomer(id, phone, addr) {
  document.getElementById('edit-cust-id').value = id;
  document.getElementById('edit-cust-phone').value = phone;
  document.getElementById('edit-cust-address').value = addr;
  openModal('modal-edit-customer');
}

async function updateCustomer() {
  const id = document.getElementById('edit-cust-id').value;
  const Phone = document.getElementById('edit-cust-phone').value;
  const Address = document.getElementById('edit-cust-address').value;
  try {
    await apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify({ Phone, Address }) });
    toast('Customer updated!', 'success');
    closeModal('modal-edit-customer');
    loadCustomers();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteCustomer(id) {
  if (!confirm(`Delete Customer ID ${id}? This cannot be undone.`)) return;
  try {
    await apiFetch(`/customers/${id}`, { method: 'DELETE' });
    toast('Customer deleted!', 'success');
    loadCustomers();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════
// RESTAURANTS
// ═══════════════════════════════════════════════════
async function loadRestaurants() {
  loading('restaurants-body', 4);
  document.getElementById('restaurants-view-title').textContent = 'All Restaurants';
  document.getElementById('restaurants-head').innerHTML = '<th>ID</th><th>Name</th><th>Location</th><th>Phone</th>';
  try {
    const data = await apiFetch('/restaurants');
    document.getElementById('restaurants-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-orange">${r.RestaurantID}</span></td>
        <td><strong>${r.RestName}</strong></td>
        <td><span class="badge badge-teal">📍 ${r.Location}</span></td>
        <td>${r.Phone}</td>
      </tr>`).join('') || `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📭</div><p>No restaurants</p></div></td></tr>`;
    loadCityFilter();
  } catch (e) { emptyState('restaurants-body', 4, e.message); }
}

async function loadRestaurantStats() {
  loading('restaurants-body', 4);
  document.getElementById('restaurants-view-title').textContent = 'Revenue Stats per Restaurant (GROUP BY + SUM + COUNT)';
  document.getElementById('restaurants-head').innerHTML = '<th>Restaurant</th><th>Total Orders</th><th>Revenue (₹)</th>';
  try {
    const data = await apiFetch('/restaurants/orderstats');
    document.getElementById('restaurants-body').innerHTML = data.map(r => `
      <tr>
        <td><strong>${r.RestName}</strong></td>
        <td><span class="badge badge-violet">${r.TotalOrders}</span></td>
        <td><strong style="color:var(--teal)">₹${Number(r.Revenue).toLocaleString()}</strong></td>
      </tr>`).join('');
  } catch (e) { emptyState('restaurants-body', 3, e.message); }
}

async function loadRestaurantsWithMenu() {
  loading('restaurants-body', 4);
  document.getElementById('restaurants-view-title').textContent = 'Restaurants With Menu Items (Subquery: IN)';
  document.getElementById('restaurants-head').innerHTML = '<th>Restaurant Name</th>';
  try {
    const data = await apiFetch('/restaurants/withmenu');
    document.getElementById('restaurants-body').innerHTML = data.map(r =>
      `<tr><td><strong>${r.RestName}</strong></td></tr>`).join('');
  } catch (e) { emptyState('restaurants-body', 1, e.message); }
}

async function loadCityFilter() {
  const data = await apiFetch('/restaurants/cities');
  const sel = document.getElementById('city-filter');
  const current = sel.value;
  sel.innerHTML = '<option value="">🌆 All Cities</option>' +
    data.map(c => `<option value="${c.Location}" ${c.Location === current ? 'selected' : ''}>${c.Location}</option>`).join('');
}

async function filterByCity() {
  const city = document.getElementById('city-filter').value;
  loading('restaurants-body', 4);
  try {
    const url = city ? `/restaurants?city=${encodeURIComponent(city)}` : '/restaurants';
    const data = await apiFetch(url);
    document.getElementById('restaurants-head').innerHTML = '<th>ID</th><th>Name</th><th>Location</th><th>Phone</th>';
    document.getElementById('restaurants-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-orange">${r.RestaurantID}</span></td>
        <td><strong>${r.RestName}</strong></td>
        <td><span class="badge badge-teal">📍 ${r.Location}</span></td>
        <td>${r.Phone}</td>
      </tr>`).join('');
  } catch (e) { emptyState('restaurants-body', 4, e.message); }
}

async function addRestaurant() {
  const RestaurantID = document.getElementById('add-rest-id').value;
  const RestName = document.getElementById('add-rest-name').value;
  const Location = document.getElementById('add-rest-loc').value;
  const Phone = document.getElementById('add-rest-phone').value;
  if (!RestaurantID || !RestName) { toast('Fill all fields!', 'error'); return; }
  try {
    await apiFetch('/restaurants', { method: 'POST', body: JSON.stringify({ RestaurantID, RestName, Location, Phone }) });
    toast('Restaurant added!', 'success');
    closeModal('modal-add-restaurant');
    loadRestaurants();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════
// MENU ITEMS
// ═══════════════════════════════════════════════════
async function loadMenu() {
  loading('menu-body', 6);
  document.getElementById('menu-view-title').textContent = 'All Menu Items (JOIN with Restaurant)';
  document.getElementById('menu-head').innerHTML = '<th>ID</th><th>Item Name</th><th>Price (₹)</th><th>Category</th><th>Restaurant</th><th>Actions</th>';
  try {
    const data = await apiFetch('/menu');
    document.getElementById('menu-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-teal">${r.ItemID}</span></td>
        <td><strong>${r.ItemName}</strong></td>
        <td><strong style="color:var(--green)">₹${r.Price}</strong></td>
        <td><span class="badge badge-pink">${r.Category}</span></td>
        <td>${r.RestName}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteMenuItem(${r.ItemID})">🗑</button></td>
      </tr>`).join('') || `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No items</p></div></td></tr>`;
  } catch (e) { emptyState('menu-body', 6, e.message); }
}

async function loadExpensiveItems() {
  loading('menu-body', 6);
  document.getElementById('menu-view-title').textContent = 'Items Above Average Price (Subquery: WHERE Price > AVG)';
  document.getElementById('menu-head').innerHTML = '<th>ID</th><th>Item Name</th><th>Price (₹)</th><th>Category</th><th>Restaurant ID</th><th></th>';
  try {
    const data = await apiFetch('/menu/expensive');
    document.getElementById('menu-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-amber">${r.ItemID}</span></td>
        <td><strong>${r.ItemName}</strong></td>
        <td><strong style="color:var(--orange)">₹${r.Price}</strong></td>
        <td><span class="badge badge-pink">${r.Category}</span></td>
        <td>${r.RestaurantID}</td>
        <td><span class="badge badge-warning">⬆ Above Avg</span></td>
      </tr>`).join('');
  } catch (e) { emptyState('menu-body', 6, e.message); }
}

async function loadMenuCategories() {
  loading('menu-body', 6);
  document.getElementById('menu-view-title').textContent = 'Avg Price Per Category (GROUP BY Category)';
  document.getElementById('menu-head').innerHTML = '<th>Category</th><th>Avg Price (₹)</th><th>Item Count</th>';
  try {
    const data = await apiFetch('/menu/categories');
    document.getElementById('menu-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-pink">${r.Category}</span></td>
        <td><strong style="color:var(--violet)">₹${Number(r.AvgPrice).toFixed(2)}</strong></td>
        <td><span class="badge badge-violet">${r.ItemCount}</span></td>
      </tr>`).join('');
  } catch (e) { emptyState('menu-body', 3, e.message); }
}

async function loadUnorderedItems() {
  loading('menu-body', 6);
  document.getElementById('menu-view-title').textContent = 'Menu Items Never Ordered (Subquery: NOT IN Order_Item)';
  document.getElementById('menu-head').innerHTML = '<th>Item Name</th>';
  try {
    const data = await apiFetch('/menu/unordered');
    document.getElementById('menu-body').innerHTML = data.length
      ? data.map(r => `<tr><td><strong>${r.ItemName}</strong> <span class="badge badge-danger">Never Ordered</span></td></tr>`).join('')
      : `<tr><td><div class="empty-state"><div class="empty-icon">🎉</div><p>All items have been ordered!</p></div></td></tr>`;
  } catch (e) { emptyState('menu-body', 1, e.message); }
}

async function addMenuItem() {
  const ItemID = document.getElementById('add-item-id').value;
  const ItemName = document.getElementById('add-item-name').value;
  const Price = document.getElementById('add-item-price').value;
  const Category = document.getElementById('add-item-cat').value;
  const RestaurantID = document.getElementById('add-item-restid').value;
  if (!ItemID || !ItemName || !Price) { toast('Fill all fields!', 'error'); return; }
  try {
    await apiFetch('/menu', { method: 'POST', body: JSON.stringify({ ItemID, ItemName, Price, Category, RestaurantID }) });
    toast('Menu item added! ✅ Check_Price trigger passed.', 'success');
    closeModal('modal-add-menu');
    loadMenu();
  } catch (e) { toast('❌ Trigger error: ' + e.message, 'error'); }
}

async function deleteMenuItem(id) {
  if (!confirm(`Delete Item ID ${id}?`)) return;
  try {
    await apiFetch(`/menu/${id}`, { method: 'DELETE' });
    toast('Item deleted!', 'success');
    loadMenu();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════
async function loadOrders() {
  loading('orders-body', 5);
  document.getElementById('orders-view-title').textContent = 'All Orders (3-Table JOIN: Orders + Customer + Restaurant)';
  document.getElementById('orders-head').innerHTML = '<th>Order ID</th><th>Date</th><th>Customer</th><th>Restaurant</th><th>Amount (₹)</th>';
  try {
    const data = await apiFetch('/orders');
    document.getElementById('orders-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-violet">#${r.OrderID}</span></td>
        <td>${r.OrderDate?.split('T')[0] || r.OrderDate}</td>
        <td><strong>${r.CustomerName}</strong></td>
        <td>${r.RestaurantName}</td>
        <td><strong style="color:var(--teal)">₹${r.TotalAmount}</strong></td>
      </tr>`).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No orders</p></div></td></tr>`;
  } catch (e) { emptyState('orders-body', 5, e.message); }
}

async function loadHighValueOrders() {
  loading('orders-body', 5);
  document.getElementById('orders-view-title').textContent = 'High Value Orders > ₹400 (VIEW: HighValueOrders)';
  document.getElementById('orders-head').innerHTML = '<th>Order ID</th><th>Date</th><th>Customer</th><th>Amount (₹)</th><th></th>';
  try {
    const data = await apiFetch('/orders/highvalue');
    document.getElementById('orders-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-orange">#${r.OrderID}</span></td>
        <td>${r.OrderDate?.split('T')[0] || r.OrderDate}</td>
        <td><strong>${r.CustomerName}</strong></td>
        <td><strong style="color:var(--orange)">₹${r.TotalAmount}</strong></td>
        <td><span class="badge badge-warning">⭐ High Value</span></td>
      </tr>`).join('');
  } catch (e) { emptyState('orders-body', 5, e.message); }
}

async function loadCustomerStats() {
  loading('orders-body', 5);
  document.getElementById('orders-view-title').textContent = 'Orders Per Customer (GROUP BY + COUNT + SUM)';
  document.getElementById('orders-head').innerHTML = '<th>Customer</th><th>Order Count</th><th>Total Spent (₹)</th>';
  try {
    const data = await apiFetch('/orders/customerstats');
    document.getElementById('orders-body').innerHTML = data.map(r => `
      <tr>
        <td><strong>${r.Name}</strong></td>
        <td><span class="badge badge-violet">${r.OrderCount}</span></td>
        <td><strong style="color:var(--green)">₹${r.TotalSpent}</strong></td>
      </tr>`).join('');
  } catch (e) { emptyState('orders-body', 3, e.message); }
}

async function loadNoDeliveryOrders() {
  loading('orders-body', 5);
  document.getElementById('orders-view-title').textContent = 'Orders Without Delivery (Subquery: NOT IN Delivery)';
  document.getElementById('orders-head').innerHTML = '<th>Order ID</th>';
  try {
    const data = await apiFetch('/orders/nodelivery');
    document.getElementById('orders-body').innerHTML = data.length
      ? data.map(r => `<tr><td><span class="badge badge-danger">#${r.OrderID}</span> <span style="color:var(--text-muted)">No delivery assigned</span></td></tr>`).join('')
      : `<tr><td><div class="empty-state"><div class="empty-icon">✅</div><p>All orders have deliveries!</p></div></td></tr>`;
  } catch (e) { emptyState('orders-body', 1, e.message); }
}

async function loadOrdersByRange() {
  const min = document.getElementById('order-min').value || 0;
  const max = document.getElementById('order-max').value || 99999;
  loading('orders-body', 5);
  document.getElementById('orders-view-title').textContent = `Orders WHERE TotalAmount BETWEEN ₹${min} AND ₹${max}`;
  document.getElementById('orders-head').innerHTML = '<th>Order ID</th><th>Date</th><th>Customer ID</th><th>Restaurant ID</th><th>Amount (₹)</th>';
  try {
    const data = await apiFetch(`/orders/range?min=${min}&max=${max}`);
    document.getElementById('orders-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-violet">#${r.OrderID}</span></td>
        <td>${r.OrderDate?.split('T')[0] || r.OrderDate}</td>
        <td>${r.CustomerID}</td>
        <td>${r.RestaurantID}</td>
        <td><strong style="color:var(--teal)">₹${r.TotalAmount}</strong></td>
      </tr>`).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No orders in this range</p></div></td></tr>`;
  } catch (e) { emptyState('orders-body', 5, e.message); }
}

// ═══════════════════════════════════════════════════
// ORDER ITEMS
// ═══════════════════════════════════════════════════
async function loadOrderItems() {
  loading('orderitems-body', 5);
  try {
    const data = await apiFetch('/orders/items');
    document.getElementById('orderitems-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-violet">#${r.OrderID}</span></td>
        <td><strong>${r.CustomerName}</strong></td>
        <td>${r.ItemName}</td>
        <td><span class="badge badge-teal">×${r.Quantity}</span></td>
        <td><strong style="color:var(--orange)">₹${r.SubTotal}</strong></td>
      </tr>`).join('') || `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No order items</p></div></td></tr>`;
  } catch (e) { emptyState('orderitems-body', 5, e.message); }
}

// ═══════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════
async function loadPayments() {
  loading('payments-body', 5);
  try {
    const [payments, summary] = await Promise.all([
      apiFetch('/payments'),
      apiFetch('/payments/summary')
    ]);
    document.getElementById('payments-body').innerHTML = payments.map(r => `
      <tr>
        <td><span class="badge badge-pink">${r.PaymentID}</span></td>
        <td><strong>${r.CustomerName}</strong></td>
        <td>${payBadge(r.PaymentMethod)}</td>
        <td>${statusBadge(r.PaymentStatus)}</td>
        <td><strong style="color:var(--teal)">₹${r.AmountPaid}</strong></td>
      </tr>`).join('');

    const pmColors = { upi: '#8b5cf6', card: '#3b82f6', cash: '#14b8a6' };
    document.getElementById('payment-summary-list').innerHTML = summary.map(p => `
      <div class="payment-item">
        <div class="payment-left">
          <div class="payment-dot" style="background:${pmColors[p.PaymentMethod?.toLowerCase()] || '#f97316'}"></div>
          <div>
            <div style="font-weight:700">${p.PaymentMethod}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${p.TransactionCount} transactions</div>
          </div>
        </div>
        <div style="font-weight:800;color:var(--violet)">₹${Number(p.TotalAmount).toLocaleString()}</div>
      </div>`).join('');
  } catch (e) { emptyState('payments-body', 5, e.message); }
}

// ═══════════════════════════════════════════════════
// DELIVERY PERSONS
// ═══════════════════════════════════════════════════
async function loadDeliveryPersons() {
  loading('dp-body', 5);
  try {
    const data = await apiFetch('/delivery-persons');
    document.getElementById('dp-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-teal">${r.DeliveryPersonID}</span></td>
        <td><strong>${r.DPName}</strong></td>
        <td>${r.DPPhone}</td>
        <td><span class="badge badge-violet">🚴 ${r.TotalDeliveries}</span></td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteDeliveryPerson(${r.DeliveryPersonID})">🗑</button></td>
      </tr>`).join('');
  } catch (e) { emptyState('dp-body', 5, e.message); }
}

async function addDeliveryPerson() {
  const DeliveryPersonID = document.getElementById('add-dp-id').value;
  const DPName = document.getElementById('add-dp-name').value;
  const DPPhone = document.getElementById('add-dp-phone').value;
  if (!DeliveryPersonID || !DPName || !DPPhone) { toast('Fill all fields!', 'error'); return; }
  try {
    await apiFetch('/delivery-persons', { method: 'POST', body: JSON.stringify({ DeliveryPersonID, DPName, DPPhone }) });
    toast('Delivery person added!', 'success');
    closeModal('modal-add-dp');
    loadDeliveryPersons();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteDeliveryPerson(id) {
  if (!confirm(`Delete Delivery Person ID ${id}?`)) return;
  try {
    await apiFetch(`/delivery-persons/${id}`, { method: 'DELETE' });
    toast('Deleted!', 'success');
    loadDeliveryPersons();
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════
// DELIVERY
// ═══════════════════════════════════════════════════
async function loadDelivery() {
  loading('delivery-body', 7);
  document.getElementById('delivery-view-title').textContent = 'All Deliveries (4-Table JOIN)';
  try {
    const data = await apiFetch('/delivery');
    document.getElementById('delivery-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-orange">${r.DeliveryID}</span></td>
        <td><strong>${r.CustomerName}</strong></td>
        <td>${r.DeliveryPersonName}</td>
        <td>${r.DPPhone}</td>
        <td>${statusBadge(r.DeliveryStatus)}</td>
        <td>${r.DeliveryTime}</td>
        <td>
          <select class="form-select" style="padding:4px 8px;font-size:0.75rem" onchange="updateDeliveryStatus(${r.DeliveryID}, this.value)">
            <option ${r.DeliveryStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option ${r.DeliveryStatus === 'In Transit' ? 'selected' : ''}>In Transit</option>
            <option ${r.DeliveryStatus === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${r.DeliveryStatus === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      </tr>`).join('');
  } catch (e) { emptyState('delivery-body', 7, e.message); }
}

async function loadLateDeliveries() {
  loading('delivery-body', 7);
  document.getElementById('delivery-view-title').textContent = "Late Deliveries (WHERE DeliveryTime > '14:00:00')";
  try {
    const data = await apiFetch('/delivery/late');
    document.getElementById('delivery-body').innerHTML = data.map(r => `
      <tr>
        <td><span class="badge badge-danger">${r.DeliveryID}</span></td>
        <td></td>
        <td>${r.DPName}</td>
        <td></td>
        <td>${statusBadge(r.DeliveryStatus)}</td>
        <td><strong style="color:var(--danger)">${r.DeliveryTime} ⚠️</strong></td>
        <td>—</td>
      </tr>`).join('') || `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">✅</div><p>No late deliveries!</p></div></td></tr>`;
  } catch (e) { emptyState('delivery-body', 7, e.message); }
}

async function updateDeliveryStatus(id, status) {
  try {
    await apiFetch(`/delivery/${id}`, { method: 'PUT', body: JSON.stringify({ DeliveryStatus: status }) });
    toast(`Delivery #${id} → ${status}`, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════
// SQL QUERY LAB
// ═══════════════════════════════════════════════════
const CAT_LABELS = { dml: '📋 DML / Basic', dql: '🔎 DQL / Filter', aggregate: '📊 Aggregate', joins: '🔗 JOINs', subqueries: '🔄 Subqueries', views: '👁 Views' };
let currentQueries = [];

async function initQueryLab() {
  try {
    const cats = await apiFetch('/queries/categories');
    document.getElementById('query-categories').innerHTML = cats.map(c => `
      <button class="query-cat-btn" onclick="loadQueryCategory('${c.key}', this)">
        ${CAT_LABELS[c.key] || c.key} <span style="opacity:0.7">(${c.count})</span>
      </button>`).join('');
    // Auto-load first
    const first = document.querySelector('.query-cat-btn');
    if (first) { first.classList.add('active'); loadQueryCategory(cats[0].key, first); }
  } catch (e) { toast('Failed to load queries: ' + e.message, 'error'); }
}

async function loadQueryCategory(key, btn) {
  document.querySelectorAll('.query-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  try {
    currentQueries = await apiFetch(`/queries/${key}`);
    document.getElementById('query-list').innerHTML = currentQueries.map((q, i) => `
      <div class="query-card" onclick="selectQuery(${i}, this)">
        <div class="query-card-label">${q.label}</div>
        <div class="query-card-sql">${q.sql}</div>
      </div>`).join('');
  } catch (e) { toast(e.message, 'error'); }
}

function selectQuery(index, el) {
  document.querySelectorAll('.query-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('sql-editor').value = currentQueries[index].sql;
}

async function runQuery() {
  const sql = document.getElementById('sql-editor').value.trim();
  if (!sql) { toast('Enter a SQL query first!', 'error'); return; }
  document.getElementById('query-result-wrapper').innerHTML = '<div class="loading"><div class="spinner"></div>Running query…</div>';
  document.getElementById('result-info').innerHTML = '';
  try {
    const result = await apiFetch('/queries/run', { method: 'POST', body: JSON.stringify({ sql }) });
    const { rows, count } = result;
    document.getElementById('result-info').innerHTML = `<span class="result-count">${count}</span> row${count !== 1 ? 's' : ''} returned`;
    if (!rows || rows.length === 0) {
      document.getElementById('query-result-wrapper').innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>Query executed — 0 rows returned.</p></div>';
      return;
    }
    const cols = Object.keys(rows[0]);
    document.getElementById('query-result-wrapper').innerHTML = `
      <table>
        <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
    toast(`✅ ${count} rows returned`, 'success');
  } catch (e) { 
    document.getElementById('query-result-wrapper').innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${e.message}</p></div>`;
    toast('Query failed: ' + e.message, 'error');
  }
}

function clearQuery() {
  document.getElementById('sql-editor').value = '';
  document.getElementById('result-info').innerHTML = '';
  document.getElementById('query-result-wrapper').innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>Select a query and click <strong>Run Query</strong>.</p></div>';
  document.querySelectorAll('.query-card').forEach(c => c.classList.remove('selected'));
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m =>
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); })
  );
});
