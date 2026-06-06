const express = require('express');
const router = express.Router();
const AssignedQPSetter = require('../models/AssignedQPSetter');

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await AssignedQPSetter.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new assignment
router.post('/', async (req, res) => {
  try {
    const assignment = new AssignedQPSetter({
      subject: req.body.subject,
      facultyId: req.body.facultyId,
      facultyName: req.body.facultyName
    });

    const newAssignment = await assignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'This faculty is already assigned to this subject' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await AssignedQPSetter.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 