const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    disease: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    emergencyContact: { type: String },
    admissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Admitted', 'Discharged', 'Outpatient'], default: 'Outpatient' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
