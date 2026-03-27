import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood type is required'],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 50,
    },
    height: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    medicalHistory: {
      hasHighBloodPressure: Boolean,
      hasDiabetes: Boolean,
      hasHeartDisease: Boolean,
      hasBleeding: Boolean,
      hasInfection: Boolean,
      medications: String,
      allergies: String,
      lastCheckupDate: Date,
    },
    donationHistory: {
      totalDonations: {
        type: Number,
        default: 0,
      },
      lastDonationDate: Date,
      nextEligibleDate: Date,
    },
    status: {
      type: String,
      enum: ['eligible', 'not_eligible', 'suspended', 'inactive'],
      default: 'eligible',
    },
    reasonForIneligibility: String,
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
    },
    availability: {
      type: String,
      enum: ['always', 'weekends', 'specific_days', 'on_demand'],
      default: 'on_demand',
    },
    preferredDonationCenter: String,
    contactPreference: {
      type: String,
      enum: ['phone', 'email', 'sms'],
      default: 'phone',
    },
    certificateIssued: Boolean,
    rewardPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual for age calculation
donorSchema.virtual('age').get(function () {
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
    age--;
  }
  return age;
});

// Indexes for faster queries
donorSchema.index({ userId: 1 });
donorSchema.index({ bloodType: 1 });
donorSchema.index({ status: 1 });

export default mongoose.model('Donor', donorSchema);
