const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

// @desc    Add a medical record
// @route   POST /api/clinical/records
// @access  Private (Doctor)
exports.addMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, notes } = req.body;

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.id,
      diagnosis,
      treatment,
      notes
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get medical records
// @route   GET /api/clinical/records
// @access  Private
exports.getMedicalRecords = async (req, res) => {
  try {
    let records;

    if (req.user.role === 'Admin') {
      records = await MedicalRecord.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization');
    } else if (req.user.role === 'Doctor') {
      records = await MedicalRecord.find({ doctor: req.user.id })
        .populate('patient', 'name email');
    } else {
      // Patient sees only their own
      records = await MedicalRecord.find({ patient: req.user.id })
        .populate('doctor', 'name specialization');
    }

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a prescription
// @route   POST /api/clinical/prescriptions
// @access  Private (Doctor)
exports.addPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes } = req.body;

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user.id,
      medications,
      notes
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get prescriptions
// @route   GET /api/clinical/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === 'Admin') {
      prescriptions = await Prescription.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization');
    } else if (req.user.role === 'Doctor') {
      prescriptions = await Prescription.find({ doctor: req.user.id })
        .populate('patient', 'name email');
    } else {
      // Patient sees only their own
      prescriptions = await Prescription.find({ patient: req.user.id })
        .populate('doctor', 'name specialization');
    }

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
