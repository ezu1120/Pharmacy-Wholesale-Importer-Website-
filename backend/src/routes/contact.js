const router = require('express').Router()
const pool = require('../db/pool')
const { requireAdmin } = require('../middleware/auth')
const { sendContactAutoReply } = require('../services/email')

// Auto-create table on first use
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id          SERIAL PRIMARY KEY,
      first_name  TEXT NOT NULL,
      last_name   TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT,
      company     TEXT,
      department  TEXT,
      message     TEXT NOT NULL,
      is_read     BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

// ── POST /api/contact  — public, anyone can submit ────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    await ensureTable()
    const { firstName, lastName, email, phone, company, department, message } = req.body
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'firstName, lastName, email and message are required.' })
    }
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (first_name, last_name, email, phone, company, department, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
      [firstName, lastName, email, phone || null, company || null, department || null, message]
    )
    // Send auto-reply (non-blocking)
    sendContactAutoReply(email, firstName).catch(() => {})
    res.status(201).json({ success: true, id: rows[0].id })
  } catch (err) { next(err) }
})

// ── GET /api/contact  — admin only ────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    await ensureTable()
    const { rows } = await pool.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, phone,
              company, department, message, is_read AS "isRead", created_at AS "createdAt"
       FROM contact_messages ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// ── PATCH /api/contact/:id/read  — mark as read ───────────────────────────────
router.patch('/:id/read', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ── DELETE /api/contact/:id  — admin delete ────────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
