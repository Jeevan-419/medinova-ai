const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Prescription = require('./models/Prescription');
const Invoice = require('./models/Invoice');

dotenv.config();

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Master Seeding...');

    // 1. Clear ALL collections
    await User.deleteMany();
    await Appointment.deleteMany();
    await MedicalRecord.deleteMany();
    await Prescription.deleteMany();
    await Invoice.deleteMany();
    console.log('Cleared all previous data.');

    // 2. Seed Users
    const usersToSeed = [
      {
        name: 'Jeevan N j',
        email: 'jeevan@admin.com',
        password: 'password123',
        role: 'Admin',
        isApproved: true
      },
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
      {
        name: 'Manoj V',
        email: 'manoj@patient.com',
        password: 'password123',
        role: 'Patient',
        isApproved: true
      },
      {
        name: 'Rajamma',
        email: 'rajamma@patient.com',
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
      }
    ];

    const seededUsers = await User.create(usersToSeed);
    console.log(`Seeded ${seededUsers.length} users.`);

    // Map users for easy access
    const admin = seededUsers.find(u => u.role === 'Admin');
    const doctor1 = seededUsers.find(u => u.email === 'prathyaksh@doctor.com');
    const doctor2 = seededUsers.find(u => u.email === 'drushya@doctor.com');
    const patient1 = seededUsers.find(u => u.email === 'manoj@patient.com');
    const patient2 = seededUsers.find(u => u.email === 'rajamma@patient.com');
    const patient3 = seededUsers.find(u => u.email === 'nishanth@patient.com');

    // 3. Seed Appointments
    const today = new Date().toISOString().split('T')[0];
    const appointments = [
      { patient: patient1._id, doctor: doctor1._id, date: today, time: '09:00', reasonForVisit: 'Chest pain', status: 'Approved' },
      { patient: patient2._id, doctor: doctor1._id, date: today, time: '10:00', reasonForVisit: 'Routine checkup', status: 'Approved' },
      { patient: patient3._id, doctor: doctor2._id, date: today, time: '11:00', reasonForVisit: 'Headache', status: 'Pending' }
    ];
    await Appointment.create(appointments);
    console.log('Seeded appointments.');

    // 4. Seed Medical Records
    const records = [
      {
        patient: patient1._id,
        doctor: doctor1._id,
        diagnosis: 'Acute Bronchitis',
        treatment: 'Rest and fluids',
        notes: 'Follow up in 1 week'
      },
      {
        patient: patient2._id,
        doctor: doctor1._id,
        diagnosis: 'Common Cold',
        treatment: 'Paracetamol',
        notes: 'Take rest'
      }
    ];
    await MedicalRecord.create(records);
    console.log('Seeded medical records.');

    // 5. Seed Prescriptions
    const prescriptions = [
      {
        patient: patient1._id,
        doctor: doctor1._id,
        medications: [
          { name: 'Paracetamol', dosage: '500mg', duration: '5 days', instructions: 'Twice a day' }
        ],
        notes: 'Drink warm water'
      }
    ];
    await Prescription.create(prescriptions);
    console.log('Seeded prescriptions.');

    // 6. Seed Invoices
    const invoices = [
      { patient: patient1._id, doctor: doctor1._id, amount: 500, description: 'Consultation Fee', status: 'Paid' },
      { patient: patient2._id, doctor: doctor1._id, amount: 500, description: 'Consultation Fee', status: 'Pending' }
    ];
    await Invoice.create(invoices);
    console.log('Seeded invoices.');

    console.log('MASTER SEEDING COMPLETE!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedAll();
