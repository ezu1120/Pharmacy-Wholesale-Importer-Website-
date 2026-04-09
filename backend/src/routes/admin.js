const router = require('express').Router()
const pool = require('../db/pool')
const { requireAdmin } = require('../middleware/auth')
const { generateRFQPDF } = require('../services/pdf')
const { sendQuotationEmail } = require('../services/email')

router.use(requireAdmin)

const VALID_STATUSES = ['NEW', 'UNDER_REVIEW', 'QUOTATION_SENT', 'CLOSED']

// GET /api/admin/rfqs
router.get('/rfqs', async (req, res, next) => {
  try {
    let { rfqNumber, customerName, companyName, status, page = 1, limit = 20 } = req.query
    page = Math.max(1, parseInt(page))
    limit = Math.min(100, parseInt(limit))
    const offset = (page - 1) * limit

    const conditions = []
    const params = []

    if (rfqNumber) { params.push(`%${rfqNumber}%`); conditions.push(`r.rfq_number ILIKE $${params.length}`) }
    if (customerName) { params.push(`%${customerName}%`); conditions.push(`(u.full_name ILIKE $${params.length} OR r.guest_full_name ILIKE $${params.length})`) }
    if (companyName) { params.push(`%${companyName}%`); conditions.push(`(u.company_name ILIKE $${params.length} OR r.guest_company ILIKE $${params.length})`) }
    if (status && VALID_STATUSES.includes(status)) { params.push(status); conditions.push(`r.status = $${params.length}`) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM rfqs r LEFT JOIN users u ON u.id = r.customer_id ${where}`, params
    )

    params.push(limit, offset)
    const { rows } = await pool.query(
      `SELECT r.id, r.rfq_number AS "rfqNumber", r.status, r.submitted_at AS "submittedAt",
              COALESCE(u.full_name, r.guest_full_name) AS "customerName",
              COALESCE(u.company_name, r.guest_company) AS "companyName",
              COUNT(ri.id)::int AS "itemCount"
       FROM rfqs r
       LEFT JOIN users u ON u.id = r.customer_id
       LEFT JOIN rfq_items ri ON ri.rfq_id = r.id
       ${where}
       GROUP BY r.id, u.full_name, u.company_name
       ORDER BY r.submitted_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    res.json({ items: rows, totalCount: parseInt(countResult.rows[0].count), page, limit })
  } catch (err) { next(err) }
})

// GET /api/admin/rfqs/:id
router.get('/rfqs/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*,
              u.full_name AS "customerName", u.company_name AS "companyName",
              u.email, u.phone, u.country, u.city, u.business_type AS "businessType"
       FROM rfqs r LEFT JOIN users u ON u.id = r.customer_id
       WHERE r.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })

    const rfq = rows[0]
    const [{ rows: items }, { rows: attachments }] = await Promise.all([
      pool.query('SELECT * FROM rfq_items WHERE rfq_id = $1', [rfq.id]),
      pool.query('SELECT * FROM rfq_attachments WHERE rfq_id = $1', [rfq.id]),
    ])
    rfq.items = items
    rfq.attachments = attachments

    res.json(rfq)
  } catch (err) { next(err) }
})

// PATCH /api/admin/rfqs/:id/status
router.patch('/rfqs/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'INVALID_STATUS' })
    await pool.query('UPDATE rfqs SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

// POST /api/admin/rfqs/:id/respond — send quotation email + PDF
router.post('/rfqs/:id/respond', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS "customerName", u.company_name AS "companyName", u.email
       FROM rfqs r LEFT JOIN users u ON u.id = r.customer_id WHERE r.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })

    const rfq = rows[0]
    const { rows: items } = await pool.query('SELECT * FROM rfq_items WHERE rfq_id = $1', [rfq.id])
    rfq.items = items

    const pdfBuffer = await generateRFQPDF(rfq)
    const email = rfq.email || rfq.guest_email

    await sendQuotationEmail(email, rfq.rfq_number, pdfBuffer)
    await pool.query("UPDATE rfqs SET status = 'QUOTATION_SENT', updated_at = NOW() WHERE id = $1", [rfq.id])

    res.json({ success: true })
  } catch (err) { next(err) }
})

// GET /api/admin/rfqs/:id/pdf
router.get('/rfqs/:id/pdf', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS "customerName", u.company_name AS "companyName", u.email
       FROM rfqs r LEFT JOIN users u ON u.id = r.customer_id WHERE r.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'NOT_FOUND' })

    const rfq = rows[0]
    const { rows: items } = await pool.query('SELECT * FROM rfq_items WHERE rfq_id = $1', [rfq.id])
    rfq.items = items

    const pdfBuffer = await generateRFQPDF(rfq)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${rfq.rfq_number}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) { next(err) }
})

// Admin product management
router.get('/products', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, generic_name AS "genericName", brand, category,
              package_size AS "packageSize", is_active AS "isActive", is_featured AS "isFeatured"
       FROM products ORDER BY name ASC`
    )
    res.json(rows)
  } catch (err) { next(err) }
})

router.post('/products', async (req, res, next) => {
  try {
    const { name, genericName, brand, category, packageSize, description, imageUrl, isFeatured } = req.body
    const { rows } = await pool.query(
      `INSERT INTO products (name, generic_name, brand, category, package_size, description, image_url, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, genericName, brand, category, packageSize, description, imageUrl, isFeatured || false]
    )
    res.status(201).json(rows[0])
  } catch (err) { next(err) }
})

router.put('/products/:id', async (req, res, next) => {
  try {
    const { name, genericName, brand, category, packageSize, description, imageUrl, isActive, isFeatured } = req.body
    await pool.query(
      `UPDATE products SET name=$1, generic_name=$2, brand=$3, category=$4, package_size=$5,
       description=$6, image_url=$7, is_active=$8, is_featured=$9, updated_at=NOW() WHERE id=$10`,
      [name, genericName, brand, category, packageSize, description, imageUrl, isActive, isFeatured, req.params.id]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.delete('/products/:id', async (req, res, next) => {
  try {
    await pool.query('UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
