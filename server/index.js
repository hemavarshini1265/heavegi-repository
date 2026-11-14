require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectMongo } = require('./db/mongo');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const productRoutes = require('./routes/products');
const faqRoutes = require('./routes/faq');
const errorCodeRoutes = require('./routes/errorcodes');
const ticketRoutes = require('./routes/tickets');
const healthRoutes = require('./routes/health');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');
const weatherRoutes = require('./routes/weather');
const pincodeRoutes = require('./routes/pincode');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect MongoDB non-blockingly
connectMongo().catch((err) => console.warn('[MongoDB] Init error:', err.message));

// Security & Parsing
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles and external images for e-commerce
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logging (morgan + custom request log)
app.use(morgan('dev'));
app.use(logger);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', limiter);

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/errorcodes', errorCodeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/pincode', pincodeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Simulation Route to demonstrate Custom 500 error handling
app.get('/simulate-500', (req, res, next) => {
  const err = new Error('Simulated Heavegi Internal Server Error (500) for testing');
  err.status = 500;
  next(err);
});

// Custom 404 Not Found Handler
app.use((req, res) => {
  res.status(404);
  if (req.accepts('html') && !req.originalUrl.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../client/404.html'));
  }
  res.json({
    error: 'Resource not found',
    code: '404',
    path: req.originalUrl,
    message: 'The requested URL was not found on this server.',
    help: 'Use the Heavegi Assistant or visit /faq.html or /error-codes.html',
  });
});

// Global Error Handler (500)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🇮🇳  HEAVEGI PLATFORMS — INDIA E-COMMERCE & AI ASSISTANT`);
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
