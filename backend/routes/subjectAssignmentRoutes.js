const express = require('express');
const router = express.Router();
const SubjectAssignment = require('../models/SubjectAssignment');

router.get('/', async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find().sort({ year: 1, semester: 1, courseCode: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { courseCode, courseName, specialization, facultyId, facultyName, year, semester, batch, academicYear } = req.body;

    if (!courseCode || !courseName || !specialization || !facultyId || !facultyName || !year || !semester || !batch || !academicYear) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await SubjectAssignment.findOne({ courseCode, year, semester, batch });
    if (existing) {
      return res.status(409).json({ message: 'This subject is already assigned for this year, semester, and batch' });
    }

    const assignment = new SubjectAssignment({ courseCode, courseName, specialization, facultyId, facultyName, year, semester, batch, academicYear });
    const saved = await assignment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await SubjectAssignment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
