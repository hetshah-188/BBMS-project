import Donor  from '../models/Donor.js';
import BloodInventory  from '../models/BloodInventory.js';
import BloodRequest  from '../models/BloodRequest.js';

// @desc    Get donor statistics
// @route   GET /api/reports/donors
// @access  Private
export const getDonorReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Total donors
    const totalDonors = await Donor.countDocuments();
    const eligibleDonors = await Donor.countDocuments({ status: 'eligible' });
    const ineligibleDonors = await Donor.countDocuments({
      status: 'not_eligible',
    });

    // Donors by blood type
    const donorsByBloodType = await Donor.aggregate([
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          eligible: {
            $sum: {
              $cond: [{ $eq: ['$status', 'eligible'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Donors by gender
    const donorsByGender = await Donor.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top donors (most donations)
    const topDonors = await Donor.find()
      .sort({ 'donationHistory.totalDonations': -1 })
      .limit(10)
      .select('userId bloodType donationHistory');

    // Average donations
    const avgDonations = await Donor.aggregate([
      {
        $group: {
          _id: null,
          avgDonations: { $avg: '$donationHistory.totalDonations' },
          maxDonations: { $max: '$donationHistory.totalDonations' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalDonors,
          eligible: eligibleDonors,
          ineligible: ineligibleDonors,
          conversionRate: totalDonors > 0 ? (
            (eligibleDonors / totalDonors) *
            100
          ).toFixed(2) : '0.00',
        },
        byBloodType: donorsByBloodType,
        byGender: donorsByGender,
        topDonors,
        averageStats: avgDonations[0] || {},
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating donor report',
      error: error.message,
    });
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private
export const getInventoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.collectionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Total inventory
    const totalUnits = await BloodInventory.countDocuments();
    const availableUnits = await BloodInventory.countDocuments({
      ...query,
      status: 'available',
    });
    const usedUnits = await BloodInventory.countDocuments({
      ...query,
      status: 'used',
    });
    const expiredUnits = await BloodInventory.countDocuments({
      ...query,
      status: 'expired',
    });

    // Inventory by blood type
    const inventoryByBloodType = await BloodInventory.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0],
            },
          },
          used: {
            $sum: {
              $cond: [{ $eq: ['$status', 'used'] }, 1, 0],
            },
          },
          expired: {
            $sum: {
              $cond: [{ $eq: ['$status', 'expired'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Expiry report (next 30 days)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringUnits = await BloodInventory.find({
      status: 'available',
      expiryDate: {
        $gte: new Date(),
        $lte: thirtyDaysLater,
      },
    }).select('bloodType expiryDate quantity');

    // Collection trend
    const collectionTrend = await BloodInventory.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$collectionDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalUnits,
          available: availableUnits,
          used: usedUnits,
          expired: expiredUnits,
          utilizationRate: totalUnits > 0 ? (((usedUnits + expiredUnits) / totalUnits) * 100)
            .toFixed(2) : '0.00',
        },
        byBloodType: inventoryByBloodType,
        expiringUnits: {
          count: expiringUnits.length,
          details: expiringUnits,
        },
        collectionTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating inventory report',
      error: error.message,
    });
  }
};

// @desc    Get request report
// @route   GET /api/reports/requests
// @access  Private
export const getRequestReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.requestDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Request statistics
    const totalRequests = await BloodRequest.countDocuments(query);
    const pendingRequests = await BloodRequest.countDocuments({
      ...query,
      status: 'pending',
    });
    const approvedRequests = await BloodRequest.countDocuments({
      ...query,
      status: 'approved',
    });
    const fulfilledRequests = await BloodRequest.countDocuments({
      ...query,
      status: 'fulfilled',
    });
    const rejectedRequests = await BloodRequest.countDocuments({
      ...query,
      status: 'rejected',
    });

    // Requests by urgency
    const requestsByUrgency = await BloodRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 },
          fulfilled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Requests by blood type
    const requestsByBloodType = await BloodRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$bloodType',
          total: { $sum: 1 },
          fulfilled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Request trend
    const requestTrend = await BloodRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$requestDate' },
          },
          total: { $sum: 1 },
          fulfilled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Reasons for requests
    const requestsByReason = await BloodRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          fulfilled: fulfilledRequests,
          rejected: rejectedRequests,
          fulfillmentRate:
            totalRequests > 0
              ? ((fulfilledRequests / totalRequests) * 100).toFixed(2)
              : 0,
          avgResponseTime: '24 hours (placeholder)',
        },
        byUrgency: requestsByUrgency,
        byBloodType: requestsByBloodType,
        byReason: requestsByReason,
        trend: requestTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating request report',
      error: error.message,
    });
  }
};

// @desc    Get expiry report
// @route   GET /api/reports/expiry
// @access  Private
export const getExpiryReport = async (req, res) => {
  try {
    // Already expired
    const expiredUnits = await BloodInventory.find({
      expiryDate: { $lt: new Date() },
      status: 'available',
    }).sort({ expiryDate: 1 });

    // Expiring soon (7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const expiringSoon = await BloodInventory.find({
      status: 'available',
      expiryDate: {
        $gte: new Date(),
        $lte: sevenDaysLater,
      },
    }).sort({ expiryDate: 1 });

    // Expiring in 30 days
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const expiringInMonth = await BloodInventory.find({
      status: 'available',
      expiryDate: {
        $gte: sevenDaysLater,
        $lte: thirtyDaysLater,
      },
    }).sort({ expiryDate: 1 });

    // Expiry statistics
    const expiryStats = await BloodInventory.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$bloodType',
          expiringToday: {
            $sum: {
              $cond: [
                {
                  $lt: ['$expiryDate', new Date()],
                },
                1,
                0,
              ],
            },
          },
          expiringSoon: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$expiryDate', new Date()] },
                    { $lte: ['$expiryDate', sevenDaysLater] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        expiredUnits: {
          count: expiredUnits.length,
          details: expiredUnits,
        },
        expiringSoon: {
          count: expiringSoon.length,
          details: expiringSoon,
        },
        expiringInMonth: {
          count: expiringInMonth.length,
          details: expiringInMonth,
        },
        statistics: expiryStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating expiry report',
      error: error.message,
    });
  }
};
