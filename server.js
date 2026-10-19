require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { pool, init } = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CATEGORIES = ['Electrical', 'Plumbing', 'Cleaning', 'Internet'];

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function safeUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, room: u.room, category: u.category };
}

// Token check karta hai
function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Please log in again' });
  }
}

// Sirf admin ke liye
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can do this' });
  next();
}

// ---------- Resident Signup ----------
app.post('/api/signup', async (req, res) => {
  try {
    const { name, room, email, password } = req.body;
    if (!name || !room || !email || !password) return res.status(400).json({ error: 'Please fill all fields' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
  'INSERT INTO users (name, email, password_hash, role, room, last_login) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
  [name.trim(), email.trim().toLowerCase(), hash, 'resident', room.trim()]
);
    const user = result.rows[0];
    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'This email is already registered' });
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Login ----------
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Enter email and password' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email.trim().toLowerCase(), role]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Wrong email, password or role' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Wrong email, password or role' });

    // Yahan last_login update hoga kyunki password bilkul theek match ho chuka hai
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Staff list (admin) ----------
app.get('/api/staff', auth, adminOnly, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, category, created_at FROM users WHERE role = 'staff' ORDER BY id DESC"
  );
  res.json(result.rows);
});

// ---------- Staff account banana (admin) ----------
app.post('/api/staff', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, category } = req.body;
    if (!name || !email || !password || !category) return res.status(400).json({ error: 'Please fill all fields' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Wrong category' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role, category) VALUES ($1, $2, $3, $4, $5)',
      [name.trim(), email.trim().toLowerCase(), hash, 'staff', category]
    );
    res.json({ ok: true });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'This email is already registered' });
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Staff delete (admin) ----------
app.delete('/api/staff/:id', auth, adminOnly, async (req, res) => {
  await pool.query("DELETE FROM users WHERE id = $1 AND role = 'staff'", [req.params.id]);
  res.json({ ok: true });
});

init().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Server chal raha hai: http://localhost:' + port));
}).catch(e => console.log('Database error:', e.message));

