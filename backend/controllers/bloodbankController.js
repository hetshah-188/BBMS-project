import BloodBank  from '../models/BloodBank.js';
import BloodInventory  from '../models/BloodInventory.js';
import Donor  from '../models/Donor.js';
import BloodRequest  from '../models/BloodRequest.js';
import User  from '../models/User.js';

// @desc    Get blood bank info
// @route   GET /api/bloodbank/info
// @access  Public
export const getBloodBankInfo = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne();

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank information not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bloodBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blood bank info',
      error: error.message,
    });
  }
};

// @desc    Update blood bank info
// @route   PUT /api/bloodbank/info
// @access  Private (Admin)
export const updateBloodBankInfo = async (req, res) => {
  try {
    let bloodBank = await BloodBank.findOne();

    if (!bloodBank) {
      bloodBank = new BloodBank(req.body);
      await bloodBank.save();
    } else {
      bloodBank = await BloodBank.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blood bank information updated successfully',
      data: bloodBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blood bank info',
      error: error.message,
    });
  }
};

// @desc    Get blood bank statistics
// @route   GET /api/bloodbank/stats
// @access  Private
export const getBloodBankStats = async (req, res) => {
  try {
    // Count total donors
    const totalDonors = await Donor.countDocuments();

    // Count donations (from inventory)
    const totalUnits = await BloodInventory.countDocuments();
    const availableUnits = await BloodInventory.countDocuments({
      status: 'available',
    });
    const usedUnits = await BloodInventory.countDocuments({ status: 'used' });
    const expiredUnits = await BloodInventory.countDocuments({
      status: 'expired',
    });

    // Count requests
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({
      status: 'pending',
    });
    const fulfilledRequests = await BloodRequest.countDocuments({
      status: 'fulfilled',
    });
    const rejectedRequests = await BloodRequest.countDocuments({
      status: 'rejected',
    });

    // Blood type distribution
    const bloodTypeDistribution = await BloodInventory.aggregate([
      {
        $group: {
          _id: '$bloodType',
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Eligible donors by blood type
    const donorsByBloodType = await Donor.aggregate([
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          eligible: {
            $sum: {
              $cond: [{ $eq: ['$status', 'eligible'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        donors: {
          total: totalDonors,
          byBloodType: donorsByBloodType,
        },
        inventory: {
          total: totalUnits,
          available: availableUnits,
          used: usedUnits,
          expired: expiredUnits,
          byBloodType: bloodTypeDistribution,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          fulfilled: fulfilledRequests,
          rejected: rejectedRequests,
          fulfillmentRate:
            totalRequests > 0
              ? ((fulfilledRequests / totalRequests) * 100).toFixed(2)
              : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

// @desc    Get storage capacity info
// @route   GET /api/bloodbank/capacity
// @access  Private
export const getStorageCapacity = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne();

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank information not found',
      });
    }

    const totalUnits = await BloodInventory.countDocuments();
    const capacity = bloodBank.capacity;

    const usagePercentage =
      capacity.maxStorage > 0
        ? ((totalUnits / capacity.maxStorage) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        maxCapacity: capacity.maxStorage,
        currentUsage: totalUnits,
        availableSpace: capacity.maxStorage - totalUnits,
        usagePercentage,
        storageTemperature: capacity.storageTemperature,
        status:
          usagePercentage > 90
            ? 'critical'
            : usagePercentage > 70
            ? 'high'
            : 'normal',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching capacity info',
      error: error.message,
    });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/bloodbank/dashboard
// @access  Private
export const getDashboardSummary = async (req, res) => {
  try {
    // Quick stats
    const availableUnits = await BloodInventory.countDocuments({
      status: 'available',
    });
    const pendingRequests = await BloodRequest.countDocuments({
      status: 'pending',
    });
    const activeDonors = await Donor.countDocuments({ status: 'eligible' });

    // Recent requests
    const recentRequests = await BloodRequest.find({})
      .limit(5)
      .sort({ createdAt: -1 })
      .select('bloodType quantity status urgency requiredByDate');

    // Inventory alerts
    const expiringUnits = await BloodInventory.find({
      status: 'available',
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }).select('bloodType quantity expiryDate');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          availableUnits,
          pendingRequests,
          activeDonors,
        },
        recentRequests,
        expiringUnits: {
          count: expiringUnits.length,
          units: expiringUnits,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message,
    });
  }
};// @desc    Get admin statistics (for dashboard)
// @route   GET /api/admin/stats
// @access  Private
export const getAdminStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const availableUnits = await BloodInventory.countDocuments({ status: 'available' });
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const totalHospitals = await User.countDocuments({ role: 'staff' });

    res.status(200).json({
      success: true,
      stats: {
        totalBloodUnits: availableUnits,
        pendingRequests: pendingRequests,
        totalDonors: totalDonors,
        totalHospitals: totalHospitals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats',
      error: error.message,
    });
  }
};
