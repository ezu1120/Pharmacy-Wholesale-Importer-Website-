const pool = require('./db/pool');

async function test() {
  try {
    const schemaPath = require('path').join(__dirname, 'db/schema.sql');
    const fs = require('fs');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running SQL for chat tables...');
    // We'll extract only the chat parts to be safe, or just run the whole thing if it uses IF NOT EXISTS
    // The schema.sql uses IF NOT EXISTS for almost everything.
    await pool.query(sql);
    console.log('✅ SQL executed successfully.');
    
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
    console.log('Tables in DB:', res.rows.map(r => r.tablename).join(', '));
    
    const chats = await pool.query('SELECT * FROM chats LIMIT 1');
    console.log('Sample chat:', chats.rows[0]);
    
    const msgs = await pool.query('SELECT * FROM chat_messages LIMIT 1');
    console.log('Sample message:', msgs.rows[0]);
    
    process.exit(0);
  } catch (err) {
    console.error('DB Test Error:', err.message);
    process.exit(1);
  }
}

test();
