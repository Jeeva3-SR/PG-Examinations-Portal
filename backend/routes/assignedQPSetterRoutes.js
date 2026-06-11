const express = require('express');
const router = express.Router();
const AssignedQPSetter = require('../models/AssignedQPSetter');
const ctrl = require('../controllers/assignedQPSetterController');

// Get all assignments
router.get('/', ctrl.getAllAssignments);

// Add new assignment
router.post('/', ctrl.addAssignment);

// Delete assignment
router.delete('/:id', ctrl.deleteAssignment);

module.exports = router; 