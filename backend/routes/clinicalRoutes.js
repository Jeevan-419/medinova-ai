const express = require('express');
const { 
  addMedicalRecord, 
  getMedicalRecords, 
  addPrescription, 
  getPrescriptions 
} = require('../controllers/clinicalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes below are protected

router.post('/records', authorize('Doctor'), addMedicalRecord);
router.get('/records', getMedicalRecords);

router.post('/prescriptions', authorize('Doctor'), addPrescription);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
