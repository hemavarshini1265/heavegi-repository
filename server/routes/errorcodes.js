const express = require('express');
const { getDb } = require('../db/sqlite');

const router = express.Router();

// GET /api/errorcodes
router.get('/', (req, res) => {
  const db = getDb();
  const codes = db.prepare('SELECT * FROM error_codes').all();
  res.json({ count: codes.length, error_codes: codes });
});

// GET /api/errorcodes/:code
router.get('/:code', (req, res) => {
  const db = getDb();
  const entry = db.prepare('SELECT * FROM error_codes WHERE code = ?').get(req.params.code);
  if (!entry) return res.status(404).json({ error: `Error code "${req.params.code}" not found` });
  res.json(entry);
});

module.exports = router;
