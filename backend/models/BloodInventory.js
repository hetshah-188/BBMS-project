import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['bags', 'units', 'ml'],
      default: 'bags',
    },
    volume: {
      type: Number,
      default: 450,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    donorName: String,
    donorPhone: String,
    status: {
      type: String,
      enum: ['available', 'reserved', 'used', 'expired', 'discarded', 'quarantine'],
      default: 'available',
    },
    testResults: {
      bloodTyping: String,
      rhesusFactor: String,
      hiv: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      hepatitisB: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      hepatitisC: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      syphilis: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      malaria: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      testDate: Date,
      remarks: String,
    },
    storage: {
      location: String,
      shelf: String,
      temperature: Number,
    },
    usedFor: {
      requestId: mongoose.Schema.Types.ObjectId,
      recipientName: String,
      usedDate: Date,
    },
    discardReason: String,
    notes: String,
  },
  { timestamps: true }
);

bloodInventorySchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

bloodInventorySchema.virtual('daysUntilExpiry').get(function () {
  const diff = this.expiryDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

bloodInventorySchema.index({ bloodType: 1, status: 1 });
bloodInventorySchema.index({ expiryDate: 1 });
bloodInventorySchema.index({ status: 1 });

export default mongoose.model('BloodInventory', bloodInventorySchema);
