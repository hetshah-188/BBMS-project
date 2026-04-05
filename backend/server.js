import dotenv from 'dotenv';
dotenv.config();

// Guard must be FIRST
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET env var is not set. Exiting.');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI env var is not set. Exiting.');
  process.exit(1);
}


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import donationRoutes from './routes/donations.js';
import inventoryRoutes from './routes/inventory.js';
import requestRoutes from './routes/requests.js';
import bloodbankRoutes from './routes/bloodbank.js';
import reportRoutes from './routes/reports.js';
import { getAdminStats } from './controllers/bloodbankController.js';
import { protect, authorize } from './middleware/auth.js';

const app = express();

// ==================== MIDDLEWARE ====================
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE ====================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bloodbank', bloodbankRoutes);
app.use('/api/reports', reportRoutes);

// Direct route for admin stats instead of wildcard alias
app.get('/api/admin/stats', protect, authorize('admin', 'staff'), getAdminStats);

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BBMS Backend API',
    version: '1.0.0',
    status: 'Server is running',
    endpoints: {
      auth: '/api/auth',
      donors: '/api/donors',
      donations: '/api/donations',
      inventory: '/api/inventory',
      requests: '/api/requests',
      bloodbank: '/api/bloodbank',
      reports: '/api/reports',
      adminStats: '/api/admin/stats',
    },
  });
});


// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
});

export default app;
