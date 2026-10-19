require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// users table banata hai agar pehle se nahi hai
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      room TEXT,
      category TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      room TEXT,
      category TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // last_login column agar nahi hai to bana do
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP');
}
}

module.exports = { pool, init };