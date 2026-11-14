const express = require('express');
const { getDb } = require('../db/sqlite');
const { getMongoStatus } = require('../db/mongo');

const router = express.Router();

// GET /api/health
router.get('/', (req, res) => {
  let db_sql = 'disconnected';
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    db_sql = 'connected';
  } catch (_) {
    db_sql = 'error';
  }

  const db_mongo = getMongoStatus();

  res.json({
    status: 'ok',
    service: 'Heavegi Platforms API',
    db_sql,
    db_mongo,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;
