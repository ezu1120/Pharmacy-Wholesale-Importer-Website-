require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/src/db/pool.js');

async function seedProcess() {
  const query = `
    INSERT INTO site_content (section, data) VALUES ('service_process', '[
      { "title": "Submit RFQ", "desc": "Use our digital RFQ wizard to specify products, quantities, and delivery requirements." },
      { "title": "Quotation Review", "desc": "Our team reviews your request and prepares a competitive formal quotation within 4–24 hours." },
      { "title": "Order Confirmation", "desc": "Approve the quotation and confirm your order. We handle all procurement and logistics." },
      { "title": "Delivery & Documentation", "desc": "Receive your order with full regulatory documentation, CoA, and delivery confirmation." }
    ]'::jsonb) ON CONFLICT (section) DO NOTHING;
  `;
  try {
    await pool.query(query);
    console.log('Successfully inserted service_process data');
  } catch (err) {
    console.error('Error inserting data:', err);
  } finally {
    process.exit(0);
  }
}

seedProcess();
