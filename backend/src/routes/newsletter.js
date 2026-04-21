const router = require('express').Router()
const pool = require('../db/pool')

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      topics     TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

// POST /api/newsletter/subscribe — public
router.post('/subscribe', async (req, res, next) => {
  try {
    await ensureTable()
    const { email, topics } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'INVALID_EMAIL' })
    }
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, topics) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET topics = $2`,
      [email.toLowerCase().trim(), topics || 'general']
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
