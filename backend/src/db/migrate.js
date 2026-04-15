require('dotenv').config()
const fs = require('fs')
const path = require('path')
const pool = require('./pool')

async function migrate() {
  console.log('Running database migration...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✓' : 'NOT SET ✗')

  const client = await pool.connect()
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // Run entire schema as one query — PostgreSQL handles multiple statements
    await client.query(schema)
    console.log('✅ Migration successful')
  } catch (err) {
    // If tables already exist that's fine, only fail on real errors
    if (err.message && err.message.includes('already exists')) {
      console.log('✅ Migration successful (tables already exist)')
    } else {
      console.error('❌ Migration failed:', err.message)
      throw err
    }
  } finally {
    client.release()
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration error:', err.message)
    process.exit(1)
  })
