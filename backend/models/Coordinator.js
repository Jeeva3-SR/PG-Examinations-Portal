const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Coordinator', coordinatorSchema); 