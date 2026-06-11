const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/facultyController');

// Get all faculty members or a random sample
router.get('/', ctrl.getAllFaculty);

// Upsert (create or update) faculty profile by facultyId
router.post('/update-profile', ctrl.upsertProfile);

// Get faculty by ID
router.get('/:facultyId', ctrl.getFacultyById);

// Add new faculty member
router.post('/', ctrl.addFaculty);

// Update faculty member
router.put('/:id', ctrl.updateFaculty);

// Update faculty by facultyId
router.put('/:facultyId', ctrl.updateFacultyByFacultyId);

// Delete faculty member
router.delete('/:id', ctrl.deleteFaculty);

// Get faculty by department
router.get('/department/:department', ctrl.getFacultyByDepartment);

// Get faculty by specialization
router.get('/specialization/:specialization', ctrl.getFacultyBySpecialization);

// Update faculty availability
router.patch('/:id/availability', ctrl.updateFacultyAvailability);

module.exports = router;
