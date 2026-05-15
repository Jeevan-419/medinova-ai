const Invoice = require('../models/Invoice');

// @desc    Generate an invoice
// @route   POST /api/billing/invoices
// @access  Private (Doctor)
exports.generateInvoice = async (req, res) => {
  try {
    const { patientId, amount, description } = req.body;

    const invoice = await Invoice.create({
      patient: patientId,
      doctor: req.user.id,
      amount,
      description
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get invoices
// @route   GET /api/billing/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    let invoices;

    if (req.user.role === 'Admin') {
      invoices = await Invoice.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name specialization');
    } else if (req.user.role === 'Doctor') {
      invoices = await Invoice.find({ doctor: req.user.id })
        .populate('patient', 'name email');
    } else {
      invoices = await Invoice.find({ patient: req.user.id })
        .populate('doctor', 'name specialization');
    }

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process a simulated payment
// @route   POST /api/billing/pay/:id
// @access  Private (Patient)
exports.processPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay this invoice' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Invoice already paid' });
    }

    invoice.status = 'Paid';
    await invoice.save();

    res.status(200).json({ success: true, message: 'Payment successful', data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
