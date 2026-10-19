require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, init } = require('./db');

// Use: node create-user.js role "Name" email password [category]
const [role, name, email, password, category] = process.argv.slice(2);

async function main() {
  if (!['admin', 'staff'].includes(role) || !name || !email || !password) {
    console.log('Use:');
    console.log('  node create-user.js admin "Admin Name" admin@gmail.com Admin123');
    console.log('  node create-user.js staff "Staff Name" staff@gmail.com Pass123 Electrical');
    process.exit();
  }
  await init();
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, category)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
     SET name = $1, password_hash = $3, role = $4, category = $5`,
    [name, email.trim().toLowerCase(), hash, role, category || null]
  );
  console.log(role + ' account ready: ' + email + ' / ' + password);
  process.exit();
}

main().catch(e => {
  console.log('Error:', e.message);
  process.exit();
});