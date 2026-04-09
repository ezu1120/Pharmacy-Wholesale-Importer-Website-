const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendCustomerConfirmation(email, rfqNumber, customerName) {
  await transporter.sendMail({
    from: `"PharmaLink Wholesale" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `RFQ Received — ${rfqNumber}`,
    html: `
      <h2>Thank you, ${customerName}</h2>
      <p>Your Request for Quotation has been received.</p>
      <p><strong>RFQ Number:</strong> ${rfqNumber}</p>
      <p>Our team will review your request and respond within 24 hours.</p>
      <br/>
      <p>PharmaLink Wholesale Team</p>
    `,
  })
}

async function sendAdminNotification(rfqNumber, customerName, companyName, itemCount) {
  await transporter.sendMail({
    from: `"PharmaLink System" <${process.env.SMTP_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New RFQ — ${rfqNumber}`,
    html: `
      <h2>New RFQ Submitted</h2>
      <p><strong>RFQ Number:</strong> ${rfqNumber}</p>
      <p><strong>Customer:</strong> ${customerName} (${companyName})</p>
      <p><strong>Items:</strong> ${itemCount}</p>
      <p>Log in to the admin panel to review and respond.</p>
    `,
  })
}

async function sendQuotationEmail(email, rfqNumber, pdfBuffer) {
  await transporter.sendMail({
    from: `"PharmaLink Wholesale" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Quotation for ${rfqNumber}`,
    html: `
      <h2>Your Quotation is Ready</h2>
      <p>Please find your quotation for <strong>${rfqNumber}</strong> attached.</p>
      <p>Contact us if you have any questions.</p>
      <br/>
      <p>PharmaLink Wholesale Team</p>
    `,
    attachments: pdfBuffer
      ? [{ filename: `${rfqNumber}-quotation.pdf`, content: pdfBuffer }]
      : [],
  })
}

module.exports = { sendCustomerConfirmation, sendAdminNotification, sendQuotationEmail }
