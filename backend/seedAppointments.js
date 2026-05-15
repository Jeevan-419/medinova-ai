const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

dotenv.config();

const seedAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding Appointments...');

    // Clear old orphaned appointments
    await Appointment.deleteMany();
    console.log('Cleared old appointments.');

    // Get Doctors
    const prathyaksh = await User.findOne({ email: 'prathyaksh@doctor.com' });
    const drushya = await User.findOne({ email: 'drushya@doctor.com' });

    // Get Patients
    const manoj = await User.findOne({ email: 'manoj@patient.com' });
    const nishanth = await User.findOne({ email: 'nishanth@patient.com' });
    const manmohan = await User.findOne({ email: 'manmohan@patient.com' });
    const srivatsa = await User.findOne({ email: 'srivatsa@patient.com' });

    if (!prathyaksh || !drushya || !manoj || !nishanth || !manmohan || !srivatsa) {
      console.log('Error: Could not find all seeded users. Did you run seed.js first?');
      process.exit(1);
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const appointmentsToSeed = [
      {
        patient: manoj._id,
        doctor: prathyaksh._id,
        date: today,
        time: '09:00',
        reasonForVisit: 'Routine checkup and slight chest pain.',
        status: 'Pending'
      },
      {
        patient: nishanth._id,
        doctor: prathyaksh._id,
        date: today,
        time: '10:00',
        reasonForVisit: 'Follow-up for blood pressure.',
        status: 'Approved'
      },
      {
        patient: manmohan._id,
        doctor: drushya._id,
        date: today,
        time: '09:30',
        reasonForVisit: 'Frequent migraines.',
        status: 'Approved'
      },
      {
        patient: srivatsa._id,
        doctor: drushya._id,
        date: tomorrow,
        time: '13:00',
        reasonForVisit: 'Nerve pain in left arm.',
        status: 'Pending'
      }
    ];

    await Appointment.create(appointmentsToSeed);
    console.log('Successfully seeded mock appointments!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedAppointments();
