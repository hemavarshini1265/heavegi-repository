const express = require('express');
const { getDb } = require('../db/sqlite');

const router = express.Router();

// GET /api/orders
router.get('/', (req, res) => {
  const db = getDb();
  const { user_id, status } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (user_id) { query += ' AND user_id = ?'; params.push(user_id); }
  if (status)  { query += ' AND status = ?'; params.push(status); }

  query += ' ORDER BY created_at DESC';
  const orders = db.prepare(query).all(...params);
  res.json({ count: orders.length, orders });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST /api/orders
router.post('/', (req, res) => {
  const db = getDb();
  const { user_id, items, total_amount, shipping_address, pincode } = req.body;
  if (!user_id || !items || !total_amount) {
    return res.status(400).json({ error: 'user_id, items, total_amount are required' });
  }
  const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);
  const result = db.prepare(
    'INSERT INTO orders (user_id, items, total_amount, shipping_address, pincode) VALUES (?,?,?,?,?)'
  ).run(user_id, itemsJson, total_amount, shipping_address || '', pincode || '');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Order placed successfully' });
});

// PATCH /api/orders/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { status, payment_status } = req.body;
  db.prepare(
    'UPDATE orders SET status=?, payment_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(status ?? order.status, payment_status ?? order.payment_status, req.params.id);
  res.json({ message: 'Order updated' });
});

// DELETE /api/orders/:id (cancel)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status === 'delivered') return res.status(400).json({ error: 'Cannot cancel a delivered order' });

  db.prepare("UPDATE orders SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(req.params.id);
  res.json({ message: 'Order cancelled' });
});

module.exports = router;
