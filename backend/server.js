require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const billingRoutes = require('./routes/billingRoutes');
const prescriptionReaderRoutes = require('./routes/prescriptionReaderRoutes');

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());

// Rate limiting removed for Vercel Serverless compatibility
// Vercel handles DDoS protection natively at the edge.

// General Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/prescription-reader', prescriptionReaderRoutes);

app.get('/', (req, res) => {
  res.send('Healthcare System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Export the app for Vercel Serverless Functions
module.exports = app;
