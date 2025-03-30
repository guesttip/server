
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./guesttip.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    payment_method TEXT,
    payment_info TEXT,
    code TEXT UNIQUE,
    qr_link TEXT
  )`);
});

module.exports = db;
