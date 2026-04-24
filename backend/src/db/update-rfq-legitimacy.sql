-- Add legal document and legitimacy status to RFQs
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS legal_document_url VARCHAR(500);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS is_legitimate BOOLEAN DEFAULT NULL;

-- Optional: New status for verification
-- ALTER TABLE rfqs RENAME COLUMN status TO status_old; -- Not recommended in live env without care
-- We can just use the existing status 'NEW' and check is_legitimate.
