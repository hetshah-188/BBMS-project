import Donation from '../models/Donation.js';
import BloodInventory from '../models/BloodInventory.js';
import User from '../models/User.js';
import Donor from '../models/Donor.js';

// @desc    Create new donation record
// @route   POST /api/donations
// @access  Private
export const createDonation = async (req, res) => {
  try {
    const { bloodType, units, hospital, weight, notes, donationDate } = req.body;

    const donation = new Donation({
      donorId: req.user.id,
      bloodType: bloodType || req.user.bloodType,
      units: units || 1,
      hospital: hospital || '',
      weight,
      notes,
      donationDate: donationDate || new Date(),
      status: 'pending',
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: 'Donation record created successfully',
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating donation record',
      error: error.message,
    });
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my
// @access  Private
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id }).sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your donations',
      error: error.message,
    });
  }
};

// @desc    Get all donations (Admin)
// @route   GET /api/donations
// @access  Private (Admin)
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donorId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all donations',
      error: error.message,
    });
  }
};

// @desc    Update donation status (Admin)
// @route   PUT /api/donations/:id/status
// @access  Private (Admin)
export const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.status = status;

    // If completed, add to inventory
    if (status === 'completed') {
      // Find the Donor record linked to this User
      const donorRecord = await Donor.findOne({ userId: donation.donorId });
      if (!donorRecord) {
        return res.status(400).json({ success: false, message: 'No donor profile found for this user' });
      }
      const inventory = new BloodInventory({
        bloodType: donation.bloodType,
        quantity: donation.units,
        donorId: donorRecord._id,           // correct reference
        donorName: donorRecord.userId?.name,
        collectionDate: donation.donationDate,
        expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        status: 'available',
      });
      await inventory.save();
      // Update the donor's donation history
      donorRecord.donationHistory.totalDonations += 1;
      donorRecord.donationHistory.lastDonationDate = new Date();
      const next = new Date();
      next.setDate(next.getDate() + 21);
      donorRecord.donationHistory.nextEligibleDate = next;
      await donorRecord.save();
    }

    await donation.save();

    res.status(200).json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donation status',
      error: error.message,
    });
  }
};
