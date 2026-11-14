const express = require('express');
const { getDb } = require('../db/sqlite');

const router = express.Router();

// GET /api/faq
router.get('/', (req, res) => {
  const db = getDb();
  const { category, search } = req.query;
  let query = 'SELECT * FROM faqs WHERE 1=1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (search)   { query += ' AND (question LIKE ? OR answer LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const faqs = db.prepare(query).all(...params);
  res.json({ count: faqs.length, faqs });
});

// GET /api/faq/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  if (!faq) return res.status(404).json({ error: 'FAQ not found' });
  res.json(faq);
});

// POST /api/faq (admin)
router.post('/', (req, res) => {
  const db = getDb();
  const { question, answer, category } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });
  const result = db.prepare('INSERT INTO faqs (question, answer, category) VALUES (?,?,?)').run(question, answer, category || 'general');
  res.status(201).json({ id: result.lastInsertRowid, message: 'FAQ created' });
});

module.exports = router;
