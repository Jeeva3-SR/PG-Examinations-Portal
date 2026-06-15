const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('../controllers/studentInputController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', ctrl.getAllInputs);
router.post('/', ctrl.addInput);
router.get('/range', ctrl.getInputsByRange);
router.get('/by-session/:sessionId', ctrl.getInputBySession);
router.get('/specialization/:specialization', ctrl.getInputsBySpecialization);
router.put('/:id', ctrl.updateInput);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id/upload', upload.single('file'), ctrl.uploadFile);
router.delete('/:id', ctrl.deleteInput);
router.get('/specialization-summary', ctrl.getSpecializationSummary);
router.get('/total-ceg', ctrl.getTotalCeg);

module.exports = router;
