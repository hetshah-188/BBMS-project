import mongoose from 'mongoose';

const bloodBankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Blood bank name is required'],
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    registrationNumber: String,
    licenseNumber: String,
    licenseExpiryDate: Date,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    capacity: {
      maxStorage: Number,
      currentUsage: Number,
      storageTemperature: Number,
    },
    staffCount: Number,
    accreditation: {
      isAccredited: Boolean,
      accreditationBody: String,
      validUntil: Date,
    },
    inventory: {
      totalUnits: { type: Number, default: 0 },
      bloodTypes: {
        'A+': { type: Number, default: 0 },
        'A-': { type: Number, default: 0 },
        'B+': { type: Number, default: 0 },
        'B-': { type: Number, default: 0 },
        'AB+': { type: Number, default: 0 },
        'AB-': { type: Number, default: 0 },
        'O+': { type: Number, default: 0 },
        'O-': { type: Number, default: 0 },
      },
    },
    statistics: {
      totalDonors: { type: Number, default: 0 },
      totalDonations: { type: Number, default: 0 },
      totalRequests: { type: Number, default: 0 },
      totalFulfilled: { type: Number, default: 0 },
      totalRejected: { type: Number, default: 0 },
    },
    emergencyContact: { name: String, phone: String, email: String },
    website: String,
    socialMedia: { facebook: String, twitter: String, instagram: String },
    services: [
      {
        type: String,
        enum: ['blood_donation', 'blood_testing', 'transfusion', 'plasma_donation', 'platelet_donation'],
      },
    ],
    certifications: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    notes: String,
  },
  { timestamps: true }
);

bloodBankSchema.index({ 'address.city': 1, status: 1 });

export default mongoose.model('BloodBank', bloodBankSchema);
