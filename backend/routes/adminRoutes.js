const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin', 'Receptionist'));

router.get('/dashboard', getDashboardMetrics);

module.exports = router;
