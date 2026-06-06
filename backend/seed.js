const mongoose = require('mongoose');

const User = require('./models/User');
const Faculty = require('./models/Faculty');

const MONGO_URI = 'mongodb://127.0.0.1:27017/exam-management';

async function executeSeeding() {
  try {
    console.log('⏳ Connecting to MongoDB (Database: exam-management) via IPv4...');
    
    // family: 4 forces native IPv4 binding, skipping any breaking IPv6 lookups
    await mongoose.connect(MONGO_URI, {
      family: 4 
    });
    console.log('✅ Connection established securely.');

    console.log('🧹 Purging old User and Faculty documents...');
    // Only wiping the collections we are actively seeding
    await User.deleteMany({});
    await Faculty.deleteMany({});

    // 1. Seed Users (HOD, Coordinator, and Faculty accounts)
    console.log('👤 Seeding user credentials...');
    await User.insertMany([
      { 
        userId: 'HOD01', 
        name: 'Dr. Ramesh (HOD)', 
        email: 'csehod@annauniv.edu',
        password: 'password123', 
        role: 'hod' 
      },
      { 
        userId: 'COORD01', 
        name: 'Dr. C. Valliyammai', 
        email: 'coordinator@annauniv.edu',
        password: 'password123', 
        role: 'coordinator' 
      },
      { 
        userId: 'FAC001', 
        name: 'Dr. Ramanujam', 
        email: 'ramanujam@annauniv.edu', 
        password: 'passwordFac', 
        role: 'faculty' 
      }
    ]);

    // 2. Seed Faculty Registry Details
    console.log('👩‍🏫 Seeding Faculty records...');
    await Faculty.create({
      facultyId: 'FAC001',
      employeeId: 'EMP101',
      name: 'Dr. Ramanujam',
      email: 'ramanujam@annauniv.edu',
      course: ['Computer Science 101', 'Exploratory Data Analysis'],
      courseCode: 'CS101',
      department: 'CSE',
      isActive: true
    });

    console.log('\n🌟 [SUCCESS] Seeding complete! User and Faculty data initialized.');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ [CRITICAL SYSTEM SEED ERROR]:', err);
    process.exit(1);
  }
}

executeSeeding();