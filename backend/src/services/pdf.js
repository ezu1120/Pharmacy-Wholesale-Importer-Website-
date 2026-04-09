const PDFDocument = require('pdfkit')

/**
 * Generates a PDF buffer for an RFQ.
 * @param {object} rfq - Full RFQ record with items
 * @returns {Promise<Buffer>}
 */
function generateRFQPDF(rfq) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('PharmaLink Wholesale', { align: 'left' })
    doc.fontSize(10).font('Helvetica').fillColor('#727784').text('Request for Quotation', { align: 'left' })
    doc.moveDown()

    // RFQ Number & Date
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#003f87').text(rfq.rfqNumber)
    doc.fontSize(9).font('Helvetica').fillColor('#424752')
      .text(`Submitted: ${new Date(rfq.submittedAt).toLocaleDateString()}`)
    doc.moveDown()

    // Customer Info
    const name = rfq.customerName || rfq.guestFullName
    const company = rfq.companyName || rfq.guestCompany
    const email = rfq.email || rfq.guestEmail

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#191c1d').text('Customer Information')
    doc.fontSize(9).font('Helvetica').fillColor('#424752')
    doc.text(`Name: ${name}`)
    doc.text(`Company: ${company}`)
    doc.text(`Email: ${email}`)
    if (rfq.phone || rfq.guestPhone) doc.text(`Phone: ${rfq.phone || rfq.guestPhone}`)
    doc.moveDown()

    // Products table
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#191c1d').text('Requested Products')
    doc.moveDown(0.5)

    const tableTop = doc.y
    const cols = { product: 50, brand: 250, qty: 370, unit: 430 }

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#727784')
    doc.text('PRODUCT', cols.product, tableTop)
    doc.text('BRAND', cols.brand, tableTop)
    doc.text('QTY', cols.qty, tableTop)
    doc.text('UNIT', cols.unit, tableTop)
    doc.moveDown(0.5)

    rfq.items?.forEach((item) => {
      const y = doc.y
      doc.fontSize(9).font('Helvetica').fillColor('#191c1d')
      doc.text(item.productName, cols.product, y, { width: 190 })
      doc.text(item.brand || '—', cols.brand, y, { width: 110 })
      doc.text(String(item.quantity), cols.qty, y)
      doc.text(item.unit, cols.unit, y)
      doc.moveDown(0.3)
    })

    doc.moveDown()
    if (rfq.message) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#191c1d').text('Additional Notes')
      doc.fontSize(9).font('Helvetica').fillColor('#424752').text(rfq.message)
    }

    doc.end()
  })
}

module.exports = { generateRFQPDF }
