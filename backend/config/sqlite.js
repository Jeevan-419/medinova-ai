const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create SQLite connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../medinova.sqlite'),
  logging: false
});

// Models
const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Admin', 'Doctor', 'Patient', 'Receptionist'), defaultValue: 'Patient' }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

const Patient = sequelize.define('Patient', {
  patient_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  age: { type: DataTypes.INTEGER },
  gender: { type: DataTypes.STRING },
  blood_group: { type: DataTypes.STRING },
  disease: { type: DataTypes.STRING },
  contact: { type: DataTypes.STRING },
  admission_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

const Doctor = sequelize.define('Doctor', {
  doctor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialization: { type: DataTypes.STRING },
  experience: { type: DataTypes.INTEGER },
  consultation_fee: { type: DataTypes.FLOAT }
});

const Appointment = sequelize.define('Appointment', {
  appointment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  appointment_date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'), defaultValue: 'Scheduled' },
  reason: { type: DataTypes.STRING }
});

const Bill = sequelize.define('Bill', {
  bill_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  payment_status: { type: DataTypes.ENUM('Pending', 'Paid'), defaultValue: 'Pending' }
});

const Medicine = sequelize.define('Medicine', {
  medicine_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicine_name: { type: DataTypes.STRING, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiry_date: { type: DataTypes.DATE }
});

// Relationships
User.hasOne(Patient, { foreignKey: 'user_id' });
Patient.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Doctor, { foreignKey: 'user_id' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

Doctor.hasMany(Appointment, { foreignKey: 'doctor_id' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Patient.hasMany(Bill, { foreignKey: 'patient_id' });
Bill.belongsTo(Patient, { foreignKey: 'patient_id' });

const syncDB = async () => {
  await sequelize.sync({ force: false }); // Use force: true to drop/recreate
  console.log('SQLite Database Synchronized.');
};

module.exports = {
  sequelize,
  syncDB,
  User,
  Patient,
  Doctor,
  Appointment,
  Bill,
  Medicine
};
