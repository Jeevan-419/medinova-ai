const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    department: { type: String },
    licenseNumber: { type: String },
    workingHours: { type: String, default: '09:00 AM - 05:00 PM' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
