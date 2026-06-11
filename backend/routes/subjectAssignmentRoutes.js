const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subjectAssignmentController');

// Get all subject assignments
router.get('/', ctrl.getAllAssignments);

// Add a new subject assignment
router.post('/', ctrl.addAssignment);

// Delete a subject assignment
router.delete('/:id', ctrl.deleteAssignment);

module.exports = router;
