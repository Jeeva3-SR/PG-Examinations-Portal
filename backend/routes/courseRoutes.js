const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 });
    console.log(courses);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new course
router.post('/', async (req, res) => {
  const course = new Course({
    courseCode: req.body.courseCode,
    courseName: req.body.courseName,
    studentCount: req.body.studentCount,
    type: req.body.type,
    college: req.body.college,
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a course
router.patch('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    Object.keys(req.body).forEach(key => {
      course[key] = req.body[key];
    });

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.remove();
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 