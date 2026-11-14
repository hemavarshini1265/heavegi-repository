const express = require('express');
const { getDb } = require('../db/sqlite');

const router = express.Router();

// GET /api/products — list with optional filters
router.get('/', (req, res) => {
  const db = getDb();
  const { category, search, limit = 20, offset = 0, pincode } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (search)   { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (pincode)  { query += ' AND pincode_areas LIKE ?'; params.push(`%${pincode}%`); }

  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const products = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  res.json({ total, products });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// GET /api/products/:id/pincode/:pincode
router.get('/:id/pincode/:pincode', (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const pin = String(req.params.pincode).trim();
  const isValid = /^\d{6}$/.test(pin);
  res.json({
    pincode: pin,
    available: isValid,
    estimated_days: '2–4 business days',
    delivery_partner: 'Heavegi Express / India Post',
  });
});

// POST /api/products
router.post('/', (req, res) => {
  const db = getDb();
  const { name, description, price, category, stock, image_url, pincode_areas } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'name, price, category are required' });
  }
  const stmt = db.prepare(
    'INSERT INTO products (name, description, price, category, stock, image_url, pincode_areas) VALUES (?,?,?,?,?,?,?)'
  );
  const result = stmt.run(name, description, price, category, stock || 0, image_url || null, pincode_areas || '400001,110001,600001');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Product created' });
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const { name, description, price, category, stock, image_url, pincode_areas } = req.body;
  db.prepare(
    `UPDATE products SET name=?, description=?, price=?, category=?, stock=?, image_url=?, pincode_areas=? WHERE id=?`
  ).run(
    name ?? product.name,
    description ?? product.description,
    price ?? product.price,
    category ?? product.category,
    stock ?? product.stock,
    image_url ?? product.image_url,
    pincode_areas ?? product.pincode_areas,
    req.params.id
  );
  res.json({ message: 'Product updated' });
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

module.exports = router;
