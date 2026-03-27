import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: String,
    requesterPhone: String,
    requesterEmail: String,
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'any'],
      required: [true, 'Blood type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    unit: {
      type: String,
      enum: ['bags', 'units', 'ml'],
      default: 'bags',
    },
    reason: {
      type: String,
      enum: ['surgery', 'accident', 'disease', 'blood_transfusion', 'emergency', 'general'],
      required: true,
    },
    description: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'fulfilled', 'expired', 'cancelled'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    requiredByDate: {
      type: Date,
      required: true,
    },
    approvedDate: Date,
    rejectionReason: String,
    fulfillmentDate: Date,
    allocatedInventoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodInventory',
      },
    ],
    recipientDetails: {
      name: String,
      age: Number,
      gender: String,
      bloodType: String,
      hospitalName: String,
      doctorName: String,
      medicalReason: String,
    },
    location: {
      hospital: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ bloodType: 1 });
bloodRequestSchema.index({ requiredByDate: 1 });
bloodRequestSchema.index({ urgency: 1 });
bloodRequestSchema.index({ requesterId: 1 });

export default mongoose.model('BloodRequest', bloodRequestSchema);
