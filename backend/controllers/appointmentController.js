const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get all doctors (for patients to search)
// @route   GET /api/appointments/doctors
// @access  Private (Patient, Admin)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isApproved: true })
      .select('-password -__v');
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reasonForVisit } = req.body;

    // Check if the slot is already booked for this doctor
    const existingAppointment = await Appointment.findOne({ doctor: doctorId, date, time, status: { $in: ['Pending', 'Approved'] } });
    
    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'This slot is already booked or pending.' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date,
      time,
      reasonForVisit
    });

    console.log(`[Notification] Patient ${req.user.name} booked an appointment for ${date} at ${time}.`);

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This slot is already booked.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments based on role
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'Admin') {
      appointments = await Appointment.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization');
    } else if (req.user.role === 'Doctor') {
      appointments = await Appointment.find({ doctor: req.user.id })
        .populate('patient', 'name email');
    } else {
      // Patient
      appointments = await Appointment.find({ patient: req.user.id })
        .populate('doctor', 'name specialization');
    }

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (approve/reject/cancel)
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role checks
    if (req.user.role === 'Patient' && status !== 'Cancelled') {
      return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
    }

    if (req.user.role === 'Patient' && appointment.patient.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    if (req.user.role === 'Doctor' && appointment.doctor.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    console.log(`[Notification] Appointment ${appointment._id} status updated to ${status}.`);

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/appointments/availability
// @access  Private (Doctor)
exports.updateAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;
    
    if (req.user.role !== 'Doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can update availability' });
    }

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { availableSlots },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: doctor.availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
