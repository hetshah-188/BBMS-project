import BloodRequest  from '../models/BloodRequest.js';
import BloodInventory  from '../models/BloodInventory.js';
import User  from '../models/User.js';

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
export const getAllRequests = async (req, res) => {
  try {
    const {
      status,
      bloodType,
      urgency,
      limit = 20,
      page = 1,
    } = req.query;
    let query = {};

    if (status) query.status = status;
    if (bloodType && bloodType !== 'any') query.bloodType = bloodType;
    if (urgency) query.urgency = urgency;

    const skip = (page - 1) * limit;

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email phone')
      .populate('allocatedInventoryIds')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ requiredByDate: 1, urgency: -1 });

    const total = await BloodRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message,
    });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'name email phone')
      .populate('allocatedInventoryIds')
      .populate('approvedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message,
    });
  }
};

// @desc    Create blood request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
  try {
    const {
      bloodType,
      units,
      reason,
      purpose,
      description,
      urgency,
      requiredByDate,
      recipientDetails,
      location,
      hospital,
      contactNumber,
      doctorName,
    } = req.body;

    // Accept both field name conventions (frontend sends 'units', model uses 'quantity')
    const quantity = req.body.quantity || units;
    // Accept both 'reason' and 'purpose' (frontend form uses 'purpose')
    const requestReason = reason || purpose || 'general';

    if (!bloodType || !quantity || !requiredByDate) {
      return res.status(400).json({
        success: false,
        message:
          'Blood type, quantity/units, and required date are required',
      });
    }

    const user = await User.findById(req.user.id);

    const request = new BloodRequest({
      requesterId: req.user.id,
      requesterName: user.name,
      requesterPhone: user.phone,
      requesterEmail: user.email,
      bloodType,
      quantity,
      reason: requestReason,
      description,
      urgency: urgency || 'routine',
      requiredByDate: new Date(requiredByDate),
      recipientDetails,
      location: location || { hospital, address: '', city: '', state: '', pincode: '' },
      notes: doctorName ? `Doctor: ${doctorName}` : undefined,
      status: 'pending',
      requestDate: Date.now(),
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message,
    });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private (Admin/Staff)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason, approverNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    let updateData = {
      status,
      approvedBy: req.user.id,
      notes: approverNotes,
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'fulfilled') {
      updateData.fulfillmentDate = Date.now();
    }

    if (status === 'approved') {
      updateData.approvedDate = Date.now();
    }

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating request status',
      error: error.message,
    });
  }
};

// @desc    Allocate blood units to request
// @route   PUT /api/requests/:id/allocate
// @access  Private (Admin/Staff)
export const allocateBloodUnits = async (req, res) => {
  try {
    const { inventoryIds } = req.body;

    if (!inventoryIds || !Array.isArray(inventoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'Inventory IDs array is required',
      });
    }

    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check blood types and update inventory
    for (const inventoryId of inventoryIds) {
      const unit = await BloodInventory.findById(inventoryId);

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: `Inventory unit ${inventoryId} not found`,
        });
      }

      if (unit.bloodType !== request.bloodType) {
        return res.status(400).json({
          success: false,
          message: `Blood type mismatch for unit ${inventoryId}`,
        });
      }

      // Update unit status
      unit.status = 'reserved';
      await unit.save();
    }

    // Update request
    request.allocatedInventoryIds = inventoryIds;
    request.status = 'approved';
    request.approvedDate = Date.now();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Blood units allocated successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error allocating blood units',
      error: error.message,
    });
  }
};

// @desc    Get requests by status
// @route   GET /api/requests/status/:status
// @access  Private
export const getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 20, page = 1 } = req.query;

    if (
      ![
        'pending',
        'approved',
        'rejected',
        'fulfilled',
        'expired',
        'cancelled',
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const skip = (page - 1) * limit;

    const requests = await BloodRequest.find({ status })
      .populate('requesterId', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ requiredByDate: 1 });

    const total = await BloodRequest.countDocuments({ status });

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      status,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message,
    });
  }
};

// @desc    Get donor's own requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your requests',
      error: error.message,
    });
  }
};

// @desc    Cancel request
// @route   DELETE /api/requests/:id
// @access  Private
export const cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Release reserved units
    if (request.allocatedInventoryIds.length > 0) {
      await BloodInventory.updateMany(
        { _id: { $in: request.allocatedInventoryIds } },
        { status: 'available' }
      );
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message,
    });
  }
};
