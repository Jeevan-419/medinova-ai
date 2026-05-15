const express = require('express');
const multer = require('multer');
const { analyzePrescription } = require('../controllers/prescriptionReaderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Use memory storage so we don't write to disk — images go straight to Gemini
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heic'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) are allowed.'));
    }
  },
});

router.use(protect);

router.post('/analyze', upload.single('prescription'), analyzePrescription);

module.exports = router;
