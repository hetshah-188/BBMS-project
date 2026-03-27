import Donor  from '../models/Donor.js';
import User  from '../models/User.js';

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
export const getAllDonors = async (req, res) => {
  try {
    const { bloodType, status, city, limit = 10, page = 1 } = req.query;
    let query = {};

    if (bloodType) query.bloodType = bloodType;
    if (status) query.status = status;
    if (city) query['location.city'] = city;

    const skip = (page - 1) * limit;

    const donors = await Donor.find(query)
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Donor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: donors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: donors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donors',
      error: error.message,
    });
  }
};

// @desc    Get single donor
// @route   GET /api/donors/:id
// @access  Private
export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate(
      'userId',
      'name email phone address city state pincode'
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donor',
      error: error.message,
    });
  }
};

// @desc    Create donor profile
// @route   POST /api/donors
// @access  Private
export const createDonor = async (req, res) => {
  try {
    const {
      bloodType,
      dateOfBirth,
      weight,
      height,
      gender,
      medicalHistory,
      availability,
      location,
    } = req.body;

    // Check if donor profile already exists
    let donor = await Donor.findOne({ userId: req.user.id });
    if (donor) {
      return res.status(400).json({
        success: false,
        message: 'Donor profile already exists for this user',
      });
    }

    donor = new Donor({
      userId: req.user.id,
      bloodType,
      dateOfBirth,
      weight,
      height,
      gender,
      medicalHistory,
      availability: availability || 'on_demand',
      location,
      status: 'eligible',
    });

    // Calculate next eligible date (21 days after now)
    const nextEligibleDate = new Date();
    nextEligibleDate.setDate(nextEligibleDate.getDate() + 21);

    donor.donationHistory.nextEligibleDate = nextEligibleDate;

    await donor.save();

    res.status(201).json({
      success: true,
      message: 'Donor profile created successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating donor profile',
      error: error.message,
    });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/:id
// @access  Private
export const updateDonor = async (req, res) => {
  try {
    let donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    // Check authorization
    if (donor.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donor',
      });
    }

    donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Donor updated successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donor',
      error: error.message,
    });
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin only)
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting donor',
      error: error.message,
    });
  }
};

// @desc    Get donor's donation history
// @route   GET /api/donors/:id/history
// @access  Private
export const getDonationHistory = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalDonations: donor.donationHistory.totalDonations,
        lastDonationDate: donor.donationHistory.lastDonationDate,
        nextEligibleDate: donor.donationHistory.nextEligibleDate,
        status: donor.status,
        reasonForIneligibility: donor.reasonForIneligibility,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation history',
      error: error.message,
    });
  }
};

// @desc    Update donor status
// @route   PUT /api/donors/:id/status
// @access  Private (Admin only)
export const updateDonorStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reasonForIneligibility: reason || null,
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor status updated successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donor status',
      error: error.message,
    });
  }
};
