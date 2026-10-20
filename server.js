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
// ---------- Complaints ----------
app.get('/api/complaints', auth, async (req, res) => {
  let where = '';
  let params = [];
  if (req.user.role === 'resident') { where = 'WHERE c.resident_id = $1'; params = [req.user.id]; }
  if (req.user.role === 'staff') { where = 'WHERE c.assigned_to = $1'; params = [req.user.id]; }

  const result = await pool.query(
    `SELECT c.*, u.name AS resident_name, u.room, s.name AS staff_name
     FROM complaints c
     JOIN users u ON u.id = c.resident_id
     LEFT JOIN users s ON s.id = c.assigned_to
     ${where}
     ORDER BY c.id DESC`, params);
  res.json(result.rows);
});

app.post('/api/complaints', auth, async (req, res) => {
  try {
    if (req.user.role !== 'resident') return res.status(403).json({ error: 'Only residents can submit complaints' });
    const { category, priority, visit_time, description } = req.body;
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Choose a category' });
    if (!description || !description.trim()) return res.status(400).json({ error: 'Please describe the problem' });

    // Us category ka wo staff jiske paas sabse kam open kaam hai
    const s = await pool.query(
      `SELECT u.id FROM users u
       WHERE u.role = 'staff' AND u.category = $1
       ORDER BY (SELECT COUNT(*) FROM complaints c WHERE c.assigned_to = u.id AND c.status <> 'Resolved'), u.id
       LIMIT 1`, [category]);
    const staffId = s.rows[0] ? s.rows[0].id : null;

    const r = await pool.query(
      `INSERT INTO complaints (resident_id, assigned_to, category, priority, visit_time, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.id, staffId, category, priority || 'Normal', visit_time || 'Anytime', description.trim()]);

    const id = r.rows[0].id;
    await pool.query('INSERT INTO notifications (user_id, text) VALUES ($1, $2)',
      [req.user.id, `Your ${category} complaint #${id} was submitted.`]);
    if (staffId) await pool.query('INSERT INTO notifications (user_id, text) VALUES ($1, $2)',
      [staffId, `New ${category} complaint #${id} assigned to you.`]);

    res.json({ ok: true, id });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolved complaint ko rating dena
app.post('/api/complaints/:id/rate', auth, async (req, res) => {
  const rating = parseInt(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Choose 1 to 5 stars' });
  await pool.query(
    "UPDATE complaints SET rating = $1 WHERE id = $2 AND resident_id = $3 AND status = 'Resolved' AND rating IS NULL",
    [rating, req.params.id, req.user.id]);
  res.json({ ok: true });
});

// ---------- Notices ----------
app.get('/api/notices', auth, async (req, res) => {
  const r = await pool.query('SELECT * FROM notices ORDER BY id DESC');
  res.json(r.rows);
});

// ---------- Notifications ----------
app.get('/api/notifications', auth, async (req, res) => {
  const r = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC LIMIT 50', [req.user.id]);
  res.json({ items: r.rows, unread: r.rows.filter(n => !n.is_read).length });
});

app.post('/api/notifications/read', auth, async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
  res.json({ ok: true });
});

// ---------- Change password ----------
app.post('/api/password', auth, async (req, res) => {
  try {
    const { old, next } = req.body;
    if (!old || !next) return res.status(400).json({ error: 'Fill both boxes' });
    if (next.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const r = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const ok = await bcrypt.compare(old, r.rows[0].password_hash);
    if (!ok) return res.status(400).json({ error: 'Current password is wrong' });

    const hash = await bcrypt.hash(next, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
});
init().then(() => {
  console.log('Database Connected Successfully! (Neon PostgreSQL)');
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Server Working: http://localhost:' + port));
}).catch(e => console.log('Database error:', e.message));

