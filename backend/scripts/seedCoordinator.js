require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Coordinator = require('../models/Coordinator');

const seedCoordinator = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const exists = await Coordinator.findOne({ name: 'Dr. C. Valliyammai' });
  if (!exists) {
    await Coordinator.create({
      name: 'Dr. C. Valliyammai',
      designation: 'Professor, Chief Superintendent (P.G. Examinations)'
    });
    console.log('Coordinator inserted successfully');
  } else {
    console.log('Coordinator already exists');
  }
  await mongoose.disconnect();
};

seedCoordinator().catch(err => {
  console.error(err);
  process.exit(1);
}); 