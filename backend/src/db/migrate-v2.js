require('dotenv').config()
const pool = require('./pool')

async function migrateV2() {
  console.log('Running v2 database migration...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✓' : 'NOT SET ✗')

  const client = await pool.connect()
  try {
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS dosage_form VARCHAR(100);
    `)
    console.log('✅ Added column: dosage_form')

    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100);
    `)
    console.log('✅ Added column: country_of_origin')

    console.log('✅ Migration v2 successful')
  } catch (err) {
    console.error('❌ Migration v2 failed:', err.message)
    throw err
  } finally {
    client.release()
  }
}

migrateV2()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration v2 error:', err.message)
    process.exit(1)
  })
