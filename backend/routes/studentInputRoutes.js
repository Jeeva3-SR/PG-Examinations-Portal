const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('../controllers/studentInputController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Get all student inputs
router.get('/', ctrl.getAllInputs);

// Add new student input
router.post('/', ctrl.addInput);

// Get student inputs by date range
router.get('/range', ctrl.getInputsByRange);

// Get student input by session ref
router.get('/by-session/:sessionId', ctrl.getInputBySession);

// Get student inputs by specialization
router.get('/specialization/:specialization', ctrl.getInputsBySpecialization);

// Update student input
router.put('/:id', ctrl.updateInput);

// Update upload status for a student input field
router.patch('/:id/status', ctrl.updateStatus);

// Upload Excel file for a student input field
router.patch('/:id/upload', upload.single('file'), ctrl.uploadFile);

// Delete student input
router.delete('/:id', ctrl.deleteInput);

// Get specialization summary
router.get('/specialization-summary', ctrl.getSpecializationSummary);

// Get total CEG student count
router.get('/total-ceg', ctrl.getTotalCeg);

// (Legacy: /specialization-summary and /total-ceg must be before /:id to avoid matching as id)

module.exports = router;
