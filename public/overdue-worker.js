// Ye file ALAG THREAD (worker thread) mein chalti hai.
// Kaam: har 1 minute baad dekhti hai kaun si complaint bohot der se pending hai, aur admin ko notification deti hai.
// Main server (server.js) apna kaam karta rehta hai, ye peeche background mein chalta hai.
require('dotenv').config();
const { parentPort } = require('worker_threads');
const { Pool } = require('pg');

// Worker ka apna database connection (thread ki memory alag hoti hai)
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1 });

const LIMIT_MINUTES = Number(process.env.OVERDUE_MINUTES) || 1440;   // 1440 min = 24 ghante

async function checkOverdue() {
  try {
    // Jo complaint resolve nahi hui aur limit se purani hai
    const r = await pool.query(
      "SELECT id FROM complaints WHERE status <> 'Resolved' AND created_at < NOW() - make_interval(mins => $1)",
      [LIMIT_MINUTES]
    );
    for (const c of r.rows) {
      const text = 'Complaint #' + c.id + ' is overdue (pending for more than ' + LIMIT_MINUTES + ' minutes).';
      // Har admin ko sirf ek baar notification (pehle se ho to dobara nahi)
      await pool.query(
        `INSERT INTO notifications (user_id, text)
         SELECT u.id, $1::text FROM users u WHERE u.role = 'admin'
         AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.text = $1::text)`,
        [text]
      );
    }
    parentPort.postMessage('Overdue check done. Overdue complaints: ' + r.rows.length);
  } catch (e) {
    parentPort.postMessage('Overdue check error: ' + e.message);
  }
}

checkOverdue();                         // start hote hi ek baar
setInterval(checkOverdue, 60 * 1000);   // phir har 1 minute baad