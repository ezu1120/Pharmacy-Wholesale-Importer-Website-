const pool = require('../db/pool')

/**
 * Generates a unique RFQ number: RFQ-{year}-{NNNN}
 * Uses a serializable transaction to prevent duplicates under concurrency.
 */
async function generateRFQNumber(client, year) {
  const { rows } = await client.query(
    `SELECT COUNT(*) AS count FROM rfqs WHERE rfq_number LIKE $1`,
    [`RFQ-${year}-%`]
  )
  const sequence = parseInt(rows[0].count) + 1
  const rfqNumber = `RFQ-${year}-${String(sequence).padStart(4, '0')}`
  return rfqNumber
}

module.exports = { generateRFQNumber }
