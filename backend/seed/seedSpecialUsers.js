const mongoose = require('mongoose');
const User = require('../models/User'); // Kept model instance

const MONGODB_URI = 'mongodb://127.0.0.1:27017/exam-management';

const users = [
  
  {
    userId: 'HOD001',
    name: 'CSE HOD',
    email: 'csehod@annauniv.edu',
    password: 'csehod@pg', // Plain text string configuration
    role: 'admin'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB safely...');

    for (const userData of users) {
      // 1. Force clear any old, broken double-hashed users from previous runs
      await User.deleteOne({ userId: userData.userId });
      
      // 2. Create fresh records passing plain-text passwords directly
      // This will correctly trigger your Schema's .pre('save') hook!
      await User.create(userData);
      console.log(`Successfully seeded user profile: ${userData.userId}`);
    }

  } catch (error) {
    console.error('Seeding process failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();