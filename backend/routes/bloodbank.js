import express from 'express';
import {
  getBloodBankInfo,
  updateBloodBankInfo,
  getBloodBankStats,
  getStorageCapacity,
  getDashboardSummary,
} from '../controllers/bloodbankController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bloodbank/info
// @desc    Get blood bank information (Public)
router.get('/info', getBloodBankInfo);

// @route   GET /api/bloodbank/stats
// @desc    Get blood bank statistics
router.get('/stats', protect, getBloodBankStats);

// @route   GET /api/bloodbank/capacity
// @desc    Get storage capacity information
router.get('/capacity', protect, getStorageCapacity);

// @route   GET /api/bloodbank/dashboard
// @desc    Get dashboard summary
router.get('/dashboard', protect, getDashboardSummary);

// @route   PUT /api/bloodbank/info
// @desc    Update blood bank information (Admin only)
router.put('/info', protect, authorize('admin'), updateBloodBankInfo);

export default router;
