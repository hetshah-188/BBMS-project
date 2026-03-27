import express from 'express';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  allocateBloodUnits,
  getRequestsByStatus,
  cancelRequest,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ⚠️ Static routes before parameterized routes

// @route   GET /api/requests/status/:status
// @desc    Get requests by status
router.get('/status/:status', protect, getRequestsByStatus);

// @route   GET /api/requests
// @desc    Get all blood requests
router.get('/', protect, getAllRequests);

// @route   POST /api/requests
// @desc    Create blood request
router.post('/', protect, createRequest);

// @route   GET /api/requests/:id
// @desc    Get single request
router.get('/:id', protect, getRequestById);

// @route   PUT /api/requests/:id
// @desc    Update request status (Admin/Staff)
router.put('/:id', protect, authorize('admin', 'staff'), updateRequestStatus);

// @route   PUT /api/requests/:id/allocate
// @desc    Allocate blood units to request (Admin/Staff)
router.put('/:id/allocate', protect, authorize('admin', 'staff'), allocateBloodUnits);

// @route   DELETE /api/requests/:id
// @desc    Cancel request
router.delete('/:id', protect, cancelRequest);

export default router;
