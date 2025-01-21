// db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function getDb() {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(__dirname, 'library.db'),
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  return db;
}

// Helper functions to wrap common database operations
async function all(sql, params = []) {
  const db = await getDb();
  return db.all(sql, params);
}

async function get(sql, params = []) {
  const db = await getDb();
  return db.get(sql, params);
}

async function run(sql, params = []) {
  const db = await getDb();
  return db.run(sql, params);
}

module.exports = {
  getDb,
  all,
  get,
  run
};