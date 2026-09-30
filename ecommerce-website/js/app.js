// ===== State =====
let cart = JSON.parse(localStorage.getItem('shopease_cart') || '[]');
let activeFilter = 'all';
let searchTerm = '';

// ===== DOM refs =====
const $ = (sel) => document.querySelector(sel);
const productGrid = $('#productGrid');
const categoryGrid = $('#categoryGrid');
const filters = $('#filters');
const emptyState = $('#emptyState');
const cartItemsEl = $('#cartItems');
const cartCountEl = $('#cartCount');
const cartTotalEl = $('#cartTotal');
const toastEl = $('#toast');

// ===== Utilities =====
const money = (n) => '$' + n.toFixed(2);
const saveCart = () => localStorage.setItem('shopease_cart', JSON.stringify(cart));

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ===== Render categories =====
function renderCategories() {
  categoryGrid.innerHTML = CATEGORIES.map((c) => `
    <div class="category-card reveal" data-category="${c.id}">
      <div class="category-card__icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    </div>`).join('');

  categoryGrid.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      setFilter(card.dataset.category);
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ===== Render filters =====
function renderFilters() {
  const options = [{ id: 'all', name: 'All' }, ...CATEGORIES];
  filters.innerHTML = options.map((o) =>
    `<button class="filter-btn ${o.id === activeFilter ? 'active' : ''}" data-filter="${o.id}">${o.name}</button>`
  ).join('');
  filters.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

function setFilter(filter) {
  activeFilter = filter;
  renderFilters();
  renderProducts();
}

// ===== Render products =====
function renderProducts() {
  const list = PRODUCTS.filter((p) => {
    const matchCat = activeFilter === 'all' || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  emptyState.hidden = list.length > 0;

  productGrid.innerHTML = list.map((p) => `
    <article class="product-card reveal">
      <div class="product-card__media">
        ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ''}
        ${p.emoji}
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${p.category}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <div class="product-card__rating">⭐ ${p.rating} <span style="color:var(--muted)">(${p.reviews})</span></div>
        <div class="product-card__foot">
          <div class="product-card__price">
            ${p.oldPrice ? `<small>${money(p.oldPrice)}</small>` : ''}${money(p.price)}
          </div>
          <button class="add-btn" data-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>
        </div>
      </div>
    </article>`).join('');

  productGrid.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
  });
  observeReveals();
}

// ===== Cart logic =====
function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart 🛒`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartUI();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS.find((x) => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function updateCartUI() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  cartCountEl.textContent = count;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-drawer__empty">Your cart is empty 🛍️<br>Start shopping!</p>`;
  } else {
    cartItemsEl.innerHTML = cart.map((item) => {
      const p = PRODUCTS.find((x) => x.id === item.id);
      return `
        <div class="cart-item">
          <div class="cart-item__media">${p.emoji}</div>
          <div class="cart-item__info">
            <div class="cart-item__name">${p.name}</div>
            <div class="cart-item__price">${money(p.price)}</div>
            <div class="cart-item__controls">
              <button class="qty-btn" data-id="${p.id}" data-delta="-1">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-id="${p.id}" data-delta="1">+</button>
              <button class="cart-item__remove" data-remove="${p.id}">Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');

    cartItemsEl.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => changeQty(Number(btn.dataset.id), Number(btn.dataset.delta)));
    });
    cartItemsEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => removeItem(Number(btn.dataset.remove)));
    });
  }
  cartTotalEl.textContent = money(cartTotal());
}

// ===== Cart drawer =====
const cartDrawer = $('#cartDrawer');
const cartOverlay = $('#cartOverlay');
function openCart() { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); }

$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

$('#checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  showToast(`✅ Order placed! Total: ${money(cartTotal())}`);
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
});

// ===== Search =====
$('#searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

// ===== Mobile nav =====
$('#navToggle').addEventListener('click', () => $('#nav').classList.toggle('open'));
document.querySelectorAll('.nav__link').forEach((link) => {
  link.addEventListener('click', () => $('#nav').classList.remove('open'));
});

// ===== Newsletter =====
$('#newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  const msg = $('#newsletterMsg');
  msg.hidden = false;
  showToast('Subscribed successfully! 🎉');
});

// ===== Scroll reveal =====
let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));
}

// ===== Init =====
renderCategories();
renderFilters();
renderProducts();
updateCartUI();
observeReveals();
