const mongoose = require('mongoose');
const Room = require('../models/Room');

// MongoDB connection URI - using default local MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/exam-management';

// Sample room data
const rooms = [
  { roomNumber: "R1", capacity: 120, floor: "Ground floor" },
  { roomNumber: "R2", capacity: 20, floor: "First floor" },
  { roomNumber: "R3", capacity: 20, floor: "Second floor" },
  { roomNumber: "R4", capacity: 20, floor: "Third floor" },
  { roomNumber: "Lab1", capacity: 50, floor: "Ground floor" },
  { roomNumber: "Lab3", capacity: 50, floor: "Second floor" },
  { roomNumber: "Lab4", capacity: 50, floor: "Third floor" }
];

// Connect to MongoDB and seed the data
const seedRooms = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB');

    // Clear existing rooms
    console.log('Clearing existing rooms...');
    await Room.deleteMany({});
    console.log('Existing rooms cleared');

    // Insert new rooms
    console.log('Inserting new rooms...');
    const insertedRooms = await Room.insertMany(rooms);
    console.log('Successfully seeded rooms:', insertedRooms);

    // Verify the data
    const count = await Room.countDocuments();
    console.log(`Total rooms in database: ${count}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the seed function
seedRooms(); 