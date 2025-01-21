const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize database tables function defined first
function initializeDatabase(db) {  // Pass db as parameter
  const schema = require('./schema.js');
  db.serialize(() => {
    schema.tables.forEach(table => {
      db.run(table, err => {
        if (err) {
          console.error('Error creating table:', err);
        }
      });
    });
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Database setup
const db = new sqlite3.Database('./library.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase(db);  // Pass db to the function
  }
});

const booksRouter = require('./routes/books');

// Middleware
app.use(cors());
app.use(express.json());

// Books Api
app.use('/api/books', booksRouter(db, authenticateToken));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          const token = jwt.sign({ id: this.lastID, username }, process.env.JWT_SECRET, {
            expiresIn: '24h'
          });

          res.status(201).json({ token, user: { id: this.lastID, username, email } });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// Protected Routes
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});