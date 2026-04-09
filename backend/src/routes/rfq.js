const router = require('express').Router()
const Joi = require('joi')
const pool = require('../db/pool')
const { generateRFQNumber } = require('../services/rfqNumber')
const { sendCustomerConfirmation, sendAdminNotification } = require('../services/email')

const rfqSchema = Joi.object({
  customerInfo: Joi.object({
    fullName: Joi.string().min(2).required(),
    companyName: Joi.string().min(2).required(),
    businessType: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(5).required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
  }).required(),
  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      productName: Joi.string().required(),
      brand: Joi.string().allow('', null),
      quantity: Joi.number().integer().min(1).required(),
      unit: Joi.string().default('units'),
      notes: Joi.string().allow('', null),
    })
  ).min(1).required(),
  additionalInfo: Joi.object({
    requestedDeliveryDate: Joi.string().allow('', null),
    shippingMethod: Joi.string().valid('air', 'sea', 'land', 'any', '').allow(null),
    message: Joi.string().allow('', null),
  }).optional(),
})

// POST /api/rfq
router.post('/', async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { error, value } = rfqSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: error.message })
    }

    const { customerInfo, products, additionalInfo = {} } = value
    const year = new Date().getFullYear()

    await client.query('BEGIN')

    const rfqNumber = await generateRFQNumber(client, year)

    const { rows: [rfq] } = await client.query(
      `INSERT INTO rfqs (
        rfq_number, guest_full_name, guest_company, guest_business_type,
        guest_email, guest_phone, guest_country, guest_city,
        requested_delivery_date, shipping_method, message, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'NEW')
      RETURNING id, rfq_number AS "rfqNumber", submitted_at AS "submittedAt"`,
      [
        rfqNumber,
        customerInfo.fullName, customerInfo.companyName, customerInfo.businessType,
        customerInfo.email, customerInfo.phone, customerInfo.country, customerInfo.city,
        additionalInfo.requestedDeliveryDate || null,
        additionalInfo.shippingMethod || null,
        additionalInfo.message || null,
      ]
    )

    for (const item of products) {
      await client.query(
        `INSERT INTO rfq_items (rfq_id, product_id, product_name, brand, quantity, unit, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [rfq.id, item.productId, item.productName, item.brand || null, item.quantity, item.unit, item.notes || null]
      )
    }

    await client.query('COMMIT')

    // Send emails async (don't block response)
    Promise.all([
      sendCustomerConfirmation(customerInfo.email, rfqNumber, customerInfo.fullName),
      sendAdminNotification(rfqNumber, customerInfo.fullName, customerInfo.companyName, products.length),
    ]).catch((err) => console.error('Email error:', err))

    res.status(201).json({ rfqNumber: rfq.rfqNumber, rfqId: rfq.id, submittedAt: rfq.submittedAt })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

// GET /api/rfq/:rfqNumber — public lookup
router.get('/:rfqNumber', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT rfq_number AS "rfqNumber", status, submitted_at AS "submittedAt"
       FROM rfqs WHERE rfq_number = $1`,
      [req.params.rfqNumber]
    )
    if (!rows.length) return res.status(404).json({ error: 'RFQ_NOT_FOUND' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

module.exports = router
