const express = require('express');
const { 
  getDoctors, 
  bookAppointment, 
  getAppointments, 
  updateAppointmentStatus,
  updateAvailability
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes below are protected

router.get('/doctors', getDoctors);
router.post('/', authorize('Patient'), bookAppointment);
router.get('/', getAppointments);
router.put('/:id/status', updateAppointmentStatus);
router.put('/availability', authorize('Doctor'), updateAvailability);

module.exports = router;
