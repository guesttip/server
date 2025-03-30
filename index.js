
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./guesttip.db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Register user
app.post('/register', (req, res) => {
  const { name, password, email, payment_method, payment_info } = req.body;
  const code = name.replace(/\s+/g, '').toLowerCase() + '_' + Math.floor(Math.random() * 1000000);
  const qr_link = \`guesttip_tip.html?code=\${code}\`;

  const sql = \`
    INSERT INTO users (name, password, email, payment_method, payment_info, code, qr_link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  \`;

  db.run(sql, [name, password, email, payment_method, payment_info, code, qr_link], function(err) {
    if (err) {
      return res.status(400).json({ error: 'User already exists or database error.' });
    }
    res.status(201).json({ message: 'User registered', code, qr_link });
  });
});

// Login
app.post('/login', (req, res) => {
  const { name, password } = req.body;
  db.get("SELECT * FROM users WHERE name = ? AND password = ?", [name, password], (err, row) => {
    if (err || !row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user: row });
  });
});

// Get all users
app.get('/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(Object.fromEntries(rows.map(row => [row.name, row])));
  });
});

// Get user by code
app.get('/user/:code', (req, res) => {
  db.get("SELECT * FROM users WHERE code = ?", [req.params.code], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

// Delete user by code
app.delete('/user/:code', (req, res) => {
  db.run("DELETE FROM users WHERE code = ?", [req.params.code], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete user' });
    res.json({ message: 'User deleted' });
  });
});

app.listen(PORT, () => console.log(`✅ GuestTip server running on http://localhost:\${PORT}`));
