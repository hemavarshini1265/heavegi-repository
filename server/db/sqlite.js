const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../heavegi.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log('[SQLite] Connected to', DB_PATH);
    initSchema();
  }
  return db;
}

function initSchema() {
  const schemaPath = path.join(__dirname, '../models/schema.sql');
  const fs = require('fs');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
}

module.exports = { getDb };
