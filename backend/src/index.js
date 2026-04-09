require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const rfqRoutes = require('./routes/rfq')
const customerRoutes = require('./routes/customer')
const adminRoutes = require('./routes/admin')
const contentRoutes = require('./routes/content')

const app = express()

// Security
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting for RFQ submissions
const rfqLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many RFQ submissions. Try again later.' },
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/rfq', rfqLimiter, rfqRoutes)
app.use('/api/customer', customerRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/content', contentRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`PharmaLink API running on port ${PORT}`))
