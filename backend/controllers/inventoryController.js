import BloodInventory  from '../models/BloodInventory.js';
import Donor  from '../models/Donor.js';

// @desc    Get all blood inventory
// @route   GET /api/inventory
// @access  Private
export const getAllInventory = async (req, res) => {
  try {
    const { bloodType, status, limit = 20, page = 1 } = req.query;
    let query = {};

    if (bloodType) query.bloodType = bloodType;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const inventory = await BloodInventory.find(query)
      .populate('donorId', 'bloodType phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ expiryDate: 1 });

    const total = await BloodInventory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: inventory.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message,
    });
  }
};

// @desc    Get inventory by blood type
// @route   GET /api/inventory/:bloodType
// @access  Private
export const getInventoryByBloodType = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const { status = 'available' } = req.query;

    const inventory = await BloodInventory.find({
      bloodType,
      status,
    }).sort({ expiryDate: 1 });

    const total = inventory.length;

    res.status(200).json({
      success: true,
      count: total,
      bloodType,
      status,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message,
    });
  }
};

// @desc    Add blood unit
// @route   POST /api/inventory
// @access  Private (Admin/Staff)
export const addBloodUnit = async (req, res) => {
  try {
    const {
      bloodType,
      quantity,
      donorId,
      collectionDate,
      testResults,
      storage,
    } = req.body;

    if (!bloodType || !quantity || !donorId) {
      return res.status(400).json({
        success: false,
        message: 'Blood type, quantity, and donor ID are required',
      });
    }

    // Get donor info
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    // Calculate expiry date (42 days from collection)
    const expiryDate = new Date(collectionDate || Date.now());
    expiryDate.setDate(expiryDate.getDate() + 42);

    const bloodUnit = new BloodInventory({
      bloodType,
      quantity,
      donorId,
      donorName: donor.userId?.name,
      collectionDate: collectionDate || Date.now(),
      expiryDate,
      testResults,
      storage,
      status: 'available',
    });

    await bloodUnit.save();

    // Update donor's donation count
    donor.donationHistory.totalDonations += 1;
    donor.donationHistory.lastDonationDate = new Date();
    
    const nextEligibleDate = new Date();
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 21);
    donor.donationHistory.nextEligibleDate = nextEligibleDate;

    await donor.save();

    res.status(201).json({
      success: true,
      message: 'Blood unit added successfully',
      data: bloodUnit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding blood unit',
      error: error.message,
    });
  }
};

// @desc    Update blood unit
// @route   PUT /api/inventory/:id
// @access  Private (Admin/Staff)
export const updateBloodUnit = async (req, res) => {
  try {
    let unit = await BloodInventory.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found',
      });
    }

    unit = await BloodInventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Blood unit updated successfully',
      data: unit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blood unit',
      error: error.message,
    });
  }
};

// @desc    Delete blood unit
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
export const deleteBloodUnit = async (req, res) => {
  try {
    const unit = await BloodInventory.findByIdAndDelete(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blood unit deleted successfully',
      data: unit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blood unit',
      error: error.message,
    });
  }
};

// @desc    Get available blood types
// @route   GET /api/inventory/available
// @access  Public
export const getAvailableBloodTypes = async (req, res) => {
  try {
    const bloodTypes = [
      'A+',
      'A-',
      'B+',
      'B-',
      'AB+',
      'AB-',
      'O+',
      'O-',
    ];

    const availability = await Promise.all(
      bloodTypes.map(async (type) => {
        const count = await BloodInventory.countDocuments({
          bloodType: type,
          status: 'available',
        });
        return {
          bloodType: type,
          available: count > 0,
          quantity: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: error.message,
    });
  }
};

// @desc    Check inventory expiry
// @route   GET /api/inventory/expiry/check
// @access  Private (Admin)
export const checkExpiryUnits = async (req, res) => {
  try {
    const now = new Date();

    const expiredUnits = await BloodInventory.find({
      expiryDate: { $lt: now },
      status: { $ne: 'expired' },
    });

    // Update expired units
    if (expiredUnits.length > 0) {
      await BloodInventory.updateMany(
        { _id: { $in: expiredUnits.map((u) => u._id) } },
        { status: 'expired', discardReason: 'Automatically marked as expired' }
      );
    }

    res.status(200).json({
      success: true,
      message: `${expiredUnits.length} units marked as expired`,
      data: expiredUnits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking expiry',
      error: error.message,
    });
  }
};
