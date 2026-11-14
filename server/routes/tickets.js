const express = require('express');
const { getDb } = require('../db/sqlite');

const router = express.Router();

// GET /api/tickets
router.get('/', (req, res) => {
  const db = getDb();
  const { status, user_id } = req.query;
  let query = 'SELECT * FROM tickets WHERE 1=1';
  const params = [];

  if (status)  { query += ' AND status = ?'; params.push(status); }
  if (user_id) { query += ' AND user_id = ?'; params.push(user_id); }

  query += ' ORDER BY created_at DESC';
  const tickets = db.prepare(query).all(...params);
  res.json({ count: tickets.length, tickets });
});

// GET /api/tickets/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// POST /api/tickets
router.post('/', (req, res) => {
  const db = getDb();
  const { user_id, subject, description, priority } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ error: 'subject and description are required' });
  }
  const result = db.prepare(
    'INSERT INTO tickets (user_id, subject, description, priority) VALUES (?,?,?,?)'
  ).run(user_id || null, subject, description, priority || 'medium');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Ticket created' });
});

// PATCH /api/tickets/:id
router.patch('/:id', (req, res) => {
  const db = getDb();
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { status, priority } = req.body;
  db.prepare('UPDATE tickets SET status=?, priority=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(
    status ?? ticket.status,
    priority ?? ticket.priority,
    req.params.id
  );
  res.json({ message: 'Ticket updated' });
});

module.exports = router;
