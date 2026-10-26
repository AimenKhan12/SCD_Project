# HostelCare - Hostel Complaint Management System

SCD Project. Residents submit complaints, admin manages staff, staff resolve complaints.

## Roles
- **Resident**: signup, submit complaint, track status, rate resolved work, notices, notifications
- **Staff**: see assigned complaints, update status (accounts are created by admin)
- **Admin**: manage staff, all complaints, reports, notice board (created from terminal)

## Tech
HTML, CSS, JavaScript (frontend), Node.js + Express (backend), Neon PostgreSQL (database)

## How to run
1. `npm install`
2. Create `.env` with DATABASE_URL, JWT_SECRET, PORT
3. Create admin: `node create-user.js admin "Admin" admin@gmail.com Admin123`
4. `node server.js` and open http://localhost:3000

## Folder structure
- `public/` : all pages (login, signup, resident, admin, staff) with their css and js
- `server.js` : API routes
- `db.js` : database tables
- `create-user.js` : create admin/staff from terminal