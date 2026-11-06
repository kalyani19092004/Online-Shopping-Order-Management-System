const cart = [];
const icons = ['🎧', '⌚', '🎒', '🔌'];
const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function loadProducts(search = '') {
  try {
    const products = await request(`/api/products?search=${encodeURIComponent(search)}`);
    productList.innerHTML = '';
    products.forEach((product, index) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `<div class="product-icon">${icons[index % icons.length]}</div>
        <h3>${product.name}</h3><p>${product.description || ''}</p>
        <div class="price">₹${Number(product.price).toFixed(2)}</div>
        <p>Stock: ${product.stock}</p>
        <button type="button" data-id="${product.id}">Add to cart</button>`;
      card.querySelector('button').addEventListener('click', () => addToCart(product));
      productList.appendChild(card);
    });
    if (!products.length) productList.textContent = 'No products found.';
  } catch (error) { productList.textContent = error.message; }
}

function addToCart(product) {
  const existing = cart.find(item => item.productId === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
  renderCart();
}

function renderCart() {
  document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (!cart.length) { cartItems.textContent = 'Your cart is empty.'; return; }
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `<span>${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toFixed(2)}</span>
      <button type="button">Remove</button>`;
    row.querySelector('button').addEventListener('click', () => {
      cart.splice(cart.indexOf(item), 1);
      renderCart();
    });
    cartItems.appendChild(row);
  });
  const totalLine = document.createElement('p');
  totalLine.innerHTML = `<strong>Total: ₹${total.toFixed(2)}</strong>`;
  cartItems.appendChild(totalLine);
}

document.getElementById('register-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  try {
    const result = await request('/api/register', { method: 'POST', body: JSON.stringify(form) });
    document.getElementById('account-message').textContent = `Welcome, ${result.user.name}!`;
    event.target.reset();
  } catch (error) { document.getElementById('account-message').textContent = error.message; }
});

document.getElementById('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  try {
    const result = await request('/api/login', { method: 'POST', body: JSON.stringify(form) });
    document.getElementById('account-message').textContent = `Logged in as ${result.user.name}.`;
    event.target.reset();
  } catch (error) { document.getElementById('account-message').textContent = error.message; }
});

document.getElementById('logout-button').addEventListener('click', async () => {
  try {
    await request('/api/logout', { method: 'POST' });
    document.getElementById('account-message').textContent = 'You are logged out.';
  } catch (error) { document.getElementById('account-message').textContent = error.message; }
});

document.getElementById('search').addEventListener('input', event => loadProducts(event.target.value));

document.getElementById('place-order').addEventListener('click', async () => {
  const message = document.getElementById('order-message');
  try {
    if (!cart.length) throw new Error('Your cart is empty.');
    const result = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items: cart.map(({ productId, quantity }) => ({ productId, quantity })) })
    });
    message.textContent = `Order #${result.orderId} placed successfully. Total: ₹${result.total.toFixed(2)}`;
    cart.length = 0;
    renderCart();
    loadProducts(document.getElementById('search').value);
  } catch (error) { message.textContent = error.message; }
});

document.getElementById('load-orders').addEventListener('click', async () => {
  const target = document.getElementById('order-list');
  try {
    const orders = await request('/api/orders');
    target.innerHTML = orders.length ? orders.map(order =>
      `<div class="order-row"><span>Order #${order.id} · ${order.created_at}</span>
      <strong>₹${Number(order.total).toFixed(2)} · ${order.status}</strong></div>`
    ).join('') : 'No orders found.';
  } catch (error) { target.textContent = error.message; }
});

request('/api/me').then(data => {
  if (data.user) document.getElementById('account-message').textContent = `Logged in as ${data.user.name}.`;
}).catch(() => {});
loadProducts();
