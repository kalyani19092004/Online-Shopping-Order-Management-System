const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'shopping-demo-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please login first.' });
  next();
}

app.get('/api/products', (req, res) => {
  const search = `%${req.query.search || ''}%`;
  db.all('SELECT id, name, description, price, stock FROM products WHERE name LIKE ? ORDER BY id', [search],
    (err, rows) => err ? res.status(500).json({ error: 'Could not load products.' }) : res.json(rows));
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], function (err) {
      if (err) return res.status(400).json({ error: 'Email may already be registered.' });
      req.session.user = { id: this.lastID, name, email };
      res.json({ message: 'Registration successful.', user: req.session.user });
    });
  } catch {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ message: 'Login successful.', user: req.session.user });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

app.get('/api/me', (req, res) => res.json({ user: req.session.user || null }));

app.post('/api/orders', requireLogin, (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: 'Your cart is empty.' });

  db.serialize(() => {
    let total = 0;
    const validItems = [];
    let remaining = items.length;

    items.forEach(item => {
      db.get('SELECT id, name, price, stock FROM products WHERE id = ?', [Number(item.productId)], (err, product) => {
        if (!err && product && Number(item.quantity) > 0 && product.stock >= Number(item.quantity)) {
          validItems.push({ ...product, quantity: Number(item.quantity) });
          total += product.price * Number(item.quantity);
        }
        remaining--;
        if (remaining === 0) {
          if (validItems.length !== items.length) return res.status(400).json({ error: 'One or more products are unavailable or out of stock.' });
          db.run('INSERT INTO orders (user_id, total) VALUES (?, ?)', [req.session.user.id, total], function (orderErr) {
            if (orderErr) return res.status(500).json({ error: 'Could not place order.' });
            const orderId = this.lastID;
            const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
            validItems.forEach(p => {
              stmt.run(orderId, p.id, p.quantity, p.price);
              db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [p.quantity, p.id]);
            });
            stmt.finalize(() => res.json({ message: 'Order placed successfully.', orderId, total }));
          });
        }
      });
    });
  });
});

app.get('/api/orders', requireLogin, (req, res) => {
  db.all('SELECT id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC',
    [req.session.user.id], (err, rows) => err ? res.status(500).json({ error: 'Could not load orders.' }) : res.json(rows));
});

// Demo admin endpoint: view all orders. Protect with a simple demo admin email check.
app.get('/api/admin/orders', requireLogin, (req, res) => {
  if (req.session.user.email !== 'admin@shop.com') return res.status(403).json({ error: 'Admin access only.' });
  db.all(`SELECT orders.id, users.name, users.email, orders.total, orders.status, orders.created_at
          FROM orders JOIN users ON users.id = orders.user_id ORDER BY orders.id DESC`,
    (err, rows) => err ? res.status(500).json({ error: 'Could not load admin orders.' }) : res.json(rows));
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => console.log(`Online Shopping app running at http://localhost:${PORT}`));
