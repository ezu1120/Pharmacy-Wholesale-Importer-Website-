const router = require('express').Router()
const pool = require('../db/pool')

// GET /api/testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, customer_name AS "customerName", company_name AS "companyName", comment
       FROM testimonials WHERE is_active = true ORDER BY sort_order ASC`
    )
    res.json(rows)
  } catch (err) { next(err) }
})

// GET /api/content/:blockKey
router.get('/:blockKey', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT content FROM content_blocks WHERE block_key = $1',
      [req.params.blockKey]
    )
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })
    res.json(rows[0].content)
  } catch (err) { next(err) }
})

module.exports = router
