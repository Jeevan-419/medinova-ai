const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardMetrics = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Calculate total revenue from paid invoices
    const paidInvoices = await Invoice.find({ status: 'Paid' });
    const revenue = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patient', 'name')
      .populate('doctor', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        revenue,
        icuBeds: '5/20',
        emergencyCases: 12, // Placeholder until Emergency module is built
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
