const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/db/pool');
const fs = require('fs');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../src/db/update-rfq-legitimacy.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration successful: RFQ legitimacy columns added.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
