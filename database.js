const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'shopping.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Placed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)');
      [
        ['Wireless Headphones', 'Bluetooth headphones with clear sound', 1499, 20],
        ['Smart Watch', 'Fitness tracking smart watch', 2299, 15],
        ['Laptop Backpack', 'Water-resistant everyday backpack', 999, 30],
        ['USB-C Charger', 'Fast charging USB-C adapter', 599, 25]
      ].forEach(p => stmt.run(p));
      stmt.finalize();
    }
  });
});

module.exports = db;
