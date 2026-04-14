require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const pool = require('../src/db/pool')

async function run() {
  await pool.query(`
    ALTER TABLE rfq_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
    ALTER TABLE rfq_items ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
    ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS quote_notes TEXT;
  `)
  console.log('✅ Pricing columns added')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
