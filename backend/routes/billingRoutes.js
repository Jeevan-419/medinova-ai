const express = require('express');
const { 
  generateInvoice, 
  getInvoices, 
  processPayment
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes below are protected

router.post('/invoices', authorize('Doctor'), generateInvoice);
router.get('/invoices', getInvoices);
router.post('/pay/:id', authorize('Patient'), processPayment);

module.exports = router;
