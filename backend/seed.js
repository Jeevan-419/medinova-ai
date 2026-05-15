const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    const emails = [
      'jeevan@admin.com', 'prathyaksh@doctor.com', 'drushya@doctor.com',
      'manoj@patient.com', 'nishanth@patient.com', 'manmohan@patient.com', 'srivatsa@patient.com'
    ];
    await User.deleteMany({ email: { $in: emails } });
    console.log('Cleared previous seeded users.');

    const usersToSeed = [
      // Admin
      {
        name: 'Jeevan N j',
        email: 'jeevan@admin.com',
        password: 'password123',
        role: 'Admin',
        isApproved: true
      },
      // Doctors
      {
        name: 'Prathyaksh S',
        email: 'prathyaksh@doctor.com',
        password: 'password123',
        role: 'Doctor',
        specialization: 'Cardiology',
        licenseNumber: 'MD-1001',
        isApproved: true,
        availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00']
      },
      {
        name: 'Drushya B',
        email: 'drushya@doctor.com',
        password: 'password123',
        role: 'Doctor',
        specialization: 'Neurology',
        licenseNumber: 'MD-1002',
        isApproved: true,
        availableSlots: ['09:30', '10:30', '13:00', '16:00']
      },
      // Patients
      {
        name: 'Manoj V',
        email: 'manoj@patient.com',
        password: 'password123',
        role: 'Patient',
        isApproved: true
      },
      {
        name: 'Nishanth SP',
        email: 'nishanth@patient.com',
        password: 'password123',
        role: 'Patient',
        isApproved: true
      },
      {
        name: 'Manmohan',
        email: 'manmohan@patient.com',
        password: 'password123',
        role: 'Patient',
        isApproved: true
      },
      {
        name: 'Srivatsa',
        email: 'srivatsa@patient.com',
        password: 'password123',
        role: 'Patient',
        isApproved: true
      }
    ];

    for (const userData of usersToSeed) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(`Created user: ${userData.name} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.name}`);
      }
    }

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
