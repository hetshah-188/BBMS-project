import express from 'express';
import {
  getAllInventory,
  getInventoryByBloodType,
  addBloodUnit,
  updateBloodUnit,
  deleteBloodUnit,
  getAvailableBloodTypes,
  checkExpiryUnits,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ⚠️ Static routes MUST be declared before parameterized routes

// @route   GET /api/inventory/available
// @desc    Get available blood types
router.get('/available', getAvailableBloodTypes);

// @route   GET /api/inventory/expiry/check
// @desc    Check and update expired units
router.get('/expiry/check', protect, authorize('admin', 'staff'), checkExpiryUnits);

// @route   GET /api/inventory
// @desc    Get all blood inventory
router.get('/', protect, getAllInventory);

// @route   GET /api/inventory/:bloodType
// @desc    Get inventory by blood type
router.get('/:bloodType', protect, getInventoryByBloodType);

// @route   POST /api/inventory
// @desc    Add blood unit
router.post('/', protect, authorize('admin', 'staff'), addBloodUnit);

// @route   PUT /api/inventory/:id
// @desc    Update blood unit
router.put('/:id', protect, authorize('admin', 'staff'), updateBloodUnit);

// @route   DELETE /api/inventory/:id
// @desc    Delete blood unit
router.delete('/:id', protect, authorize('admin'), deleteBloodUnit);

export default router;
