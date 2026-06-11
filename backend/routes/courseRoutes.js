const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/courseController');

// Get all courses
router.get('/', ctrl.getAllCourses);

// Add a new course
router.post('/', ctrl.addCourse);

// Update a course
router.patch('/:id', ctrl.updateCourse);

// Delete a course
router.delete('/:id', ctrl.deleteCourse);

module.exports = router;
