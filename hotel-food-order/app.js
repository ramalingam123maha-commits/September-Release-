// Hotel Food Order System — front-end logic
const MENU = [
  { id: 1,  cat: "Breakfast",  emoji: "🥞", name: "Fluffy Pancakes",      desc: "Maple syrup, fresh berries & whipped butter", price: 9.50 },
  { id: 2,  cat: "Breakfast",  emoji: "🍳", name: "Classic Eggs Benedict", desc: "Poached eggs, ham, hollandaise on muffin",   price: 12.00 },
  { id: 3,  cat: "Breakfast",  emoji: "🥐", name: "Croissant Basket",      desc: "Assorted butter croissants with preserves",  price: 7.00 },
  { id: 4,  cat: "Mains",      emoji: "🍔", name: "Aroma Signature Burger", desc: "Angus beef, cheddar, caramelized onion",    price: 15.50 },
  { id: 5,  cat: "Mains",      emoji: "🍝", name: "Truffle Pasta",          desc: "Tagliatelle, wild mushroom, black truffle", price: 18.00 },
  { id: 6,  cat: "Mains",      emoji: "🥩", name: "Grilled Ribeye",         desc: "300g ribeye, roasted vegetables, jus",      price: 28.00 },
  { id: 7,  cat: "Mains",      emoji: "🍗", name: "Herb Roast Chicken",     desc: "Half chicken, lemon herb, mashed potato",   price: 19.00 },
  { id: 8,  cat: "Salads",     emoji: "🥗", name: "Caesar Salad",           desc: "Romaine, parmesan, croutons, dressing",     price: 11.00 },
  { id: 9,  cat: "Salads",     emoji: "🥙", name: "Mediterranean Bowl",     desc: "Quinoa, feta, olives, cherry tomato",       price: 13.50 },
  { id: 10, cat: "Desserts",   emoji: "🍰", name: "Cheesecake",             desc: "New York style with berry compote",         price: 8.50 },
  { id: 11, cat: "Desserts",   emoji: "🍫", name: "Chocolate Lava Cake",    desc: "Warm center, vanilla bean ice cream",       price: 9.00 },
  { id: 12, cat: "Beverages",  emoji: "☕", name: "Fresh Coffee",           desc: "Single origin, brewed to order",            price: 4.00 },
  { id: 13, cat: "Beverages",  emoji: "🧃", name: "Fresh Orange Juice",     desc: "Cold-pressed, no added sugar",              price: 5.00 },
  { id: 14, cat: "Beverages",  emoji: "🍷", name: "House Red Wine",         desc: "Glass of our sommelier's selection",        price: 10.00 },
];

const SERVICE_RATE = 0.10;
const cart = {}; // id -> qty

const $ = (id) => document.getElementById(id);

function categories() {
  return [...new Set(MENU.map((m) => m.cat))];
}

function renderCategories() {
  const nav = $("categories");
  const cats = ["All", ...categories()];
  nav.innerHTML = cats
    .map((c, i) => `<button class="cat-chip ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  nav.querySelectorAll(".cat-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      nav.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderMenu(chip.dataset.cat);
    });
  });
}

function renderMenu(filter = "All") {
  const menu = $("menu");
  const cats = filter === "All" ? categories() : [filter];
  menu.innerHTML = cats
    .map((cat) => {
      const items = MENU.filter((m) => m.cat === cat);
      const cards = items
        .map(
          (m) => `
        <article class="card">
          <div class="thumb">${m.emoji}</div>
          <div class="body">
            <h3>${m.name}</h3>
            <p class="desc">${m.desc}</p>
            <div class="price-row">
              <span class="price">$${m.price.toFixed(2)}</span>
              <button class="add-btn" data-add="${m.id}">Add +</button>
            </div>
          </div>
        </article>`
        )
        .join("");
      return `<h2 class="cat-title">${cat}</h2>${cards}`;
    })
    .join("");
  menu.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.add)));
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCart();
  showToast(`${MENU.find((m) => m.id === id).name} added to order`);
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCart();
}

function cartEntries() {
  return Object.entries(cart).map(([id, qty]) => ({
    item: MENU.find((m) => m.id === Number(id)),
    qty,
  }));
}

function updateCart() {
  const entries = cartEntries();
  const count = entries.reduce((s, e) => s + e.qty, 0);
  $("cartCount").textContent = count;

  const box = $("cartItems");
  if (entries.length === 0) {
    box.innerHTML = `<p class="empty">Your order is empty.<br>Add something delicious! 🍴</p>`;
  } else {
    box.innerHTML = entries
      .map(
        ({ item, qty }) => `
      <div class="cart-item">
        <span class="ci-emoji">${item.emoji}</span>
        <div class="ci-info">
          <h4>${item.name}</h4>
          <span>$${item.price.toFixed(2)}</span>
        </div>
        <div class="qty">
          <button data-dec="${item.id}">−</button>
          <span>${qty}</span>
          <button data-inc="${item.id}">+</button>
        </div>
      </div>`
      )
      .join("");
    box.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => changeQty(Number(b.dataset.inc), 1))
    );
    box.querySelectorAll("[data-dec]").forEach((b) =>
      b.addEventListener("click", () => changeQty(Number(b.dataset.dec), -1))
    );
  }

  const subtotal = entries.reduce((s, e) => s + e.item.price * e.qty, 0);
  const service = subtotal * SERVICE_RATE;
  $("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  $("service").textContent = `$${service.toFixed(2)}`;
  $("total").textContent = `$${(subtotal + service).toFixed(2)}`;

  validateOrder();
}

function validateOrder() {
  const hasItems = Object.keys(cart).length > 0;
  const hasRoom = $("roomNumber").value.trim().length > 0;
  $("placeOrder").disabled = !(hasItems && hasRoom);
}

function placeOrder() {
  const room = $("roomNumber").value.trim();
  const count = cartEntries().reduce((s, e) => s + e.qty, 0);
  const total = $("total").textContent;
  // Clear order
  Object.keys(cart).forEach((k) => delete cart[k]);
  $("roomNumber").value = "";
  updateCart();
  closeCart();
  showToast(`✅ Order placed! ${count} item(s), ${total} — delivering to Room ${room}`, 4000);
}

/* Drawer controls */
function openCart() {
  $("cartDrawer").classList.add("open");
  $("cartDrawer").setAttribute("aria-hidden", "false");
  $("overlay").classList.add("show");
}
function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("cartDrawer").setAttribute("aria-hidden", "true");
  $("overlay").classList.remove("show");
}

/* Toast */
let toastTimer;
function showToast(msg, ms = 2200) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderMenu();
  updateCart();
  $("cartToggle").addEventListener("click", openCart);
  $("cartClose").addEventListener("click", closeCart);
  $("overlay").addEventListener("click", closeCart);
  $("roomNumber").addEventListener("input", validateOrder);
  $("placeOrder").addEventListener("click", placeOrder);
});
