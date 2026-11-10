// Ye file ALAG THREAD (worker thread) mein chalti hai. Isme "run()" ka kaam checkOverdue() karta hai.
// Kaam: pending complaints dekhna, aur jo bohot purani hon unka admin ko notification dena.
require('dotenv').config();
const { parentPort, workerData, threadId } = require('worker_threads');
const { Pool } = require('pg');

// Is thread ka apna database connection (har thread ki memory alag hoti hai)
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });

const LIMIT_MINUTES = Number(process.env.OVERDUE_MINUTES) || 1440;   // 1440 minutes = 24 hours
const CHECK_SECONDS = Number(process.env.CHECK_SECONDS) || 60;       // kitni der baad dobara check kare
const name = workerData.name;                                        // thread ka naam (server.js se mila)

async function checkOverdue() {
  console.log('[' + name + ' | thread id ' + threadId + '] Checking overdue complaints...');
  try {
    // 1) Wo complaints jo resolve nahi hui aur limit se purani hain
    const r = await pool.query(
      "SELECT id FROM complaints WHERE status <> 'Resolved' AND created_at < NOW() - make_interval(mins => $1)",
      [LIMIT_MINUTES]
    );
    // 2) Har overdue complaint ka admin ko notification (ek hi baar)
    for (const c of r.rows) {
      const text = 'Complaint #' + c.id + ' is overdue.';
      await pool.query(
        `INSERT INTO notifications (user_id, text)
         SELECT u.id, $1::text FROM users u WHERE u.role = 'admin'
         AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.text = $1::text)`,
        [text]
      );
    }
    console.log('[' + name + ' | thread id ' + threadId + '] Done. Overdue complaints: ' + r.rows.length);
  } catch (e) {
    console.log('[' + name + '] Error: ' + e.message);
  }
}

checkOverdue();                                   // thread start hote hi ek baar
setInterval(checkOverdue, CHECK_SECONDS * 1000);  // phir baar baar (Java ke Thread.sleep jaisa)