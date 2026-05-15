const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const MedicalRecord = require('./models/MedicalRecord');
const Prescription = require('./models/Prescription');

dotenv.config();

const seedClinicalData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Clinical Data...');

    // Clear old data
    await MedicalRecord.deleteMany();
    await Prescription.deleteMany();
    console.log('Cleared old clinical data.');

    // Get Doctors
    const prathyaksh = await User.findOne({ email: 'prathyaksh@doctor.com' });
    const drushya = await User.findOne({ email: 'drushya@doctor.com' });

    // Get Patients
    const manoj = await User.findOne({ email: 'manoj@patient.com' });
    const nishanth = await User.findOne({ email: 'nishanth@patient.com' });

    if (!prathyaksh || !drushya || !manoj || !nishanth) {
      console.log('Error: Could not find users. Run seed.js first.');
      process.exit(1);
    }

    const records = [
      {
        patient: manoj._id,
        doctor: prathyaksh._id,
        diagnosis: 'Acute Bronchitis',
        treatment: 'Rest, hydration, and prescribed antibiotics.',
        notes: 'Patient reported severe cough for 3 days.'
      },
      {
        patient: nishanth._id,
        doctor: prathyaksh._id,
        diagnosis: 'Hypertension Stage 1',
        treatment: 'Dietary changes and blood pressure medication.',
        notes: 'BP reading was 145/90.'
      }
    ];

    const prescriptions = [
      {
        patient: manoj._id,
        doctor: prathyaksh._id,
        medications: [
          { name: 'Amoxicillin', dosage: '500mg', duration: '7 Days', instructions: 'Take twice daily after meals' },
          { name: 'Cough Syrup', dosage: '10ml', duration: '5 Days', instructions: 'Take before bed' }
        ],
        notes: 'Drink plenty of warm fluids.'
      },
      {
        patient: nishanth._id,
        doctor: prathyaksh._id,
        medications: [
          { name: 'Lisinopril', dosage: '10mg', duration: '30 Days', instructions: 'Take once daily in the morning' }
        ],
        notes: 'Monitor BP weekly.'
      }
    ];

    await MedicalRecord.create(records);
    await Prescription.create(prescriptions);
    
    console.log('Successfully seeded mock medical records and prescriptions!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedClinicalData();
