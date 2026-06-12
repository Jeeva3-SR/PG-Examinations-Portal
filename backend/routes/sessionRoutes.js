const express = require('express');
const path = require('path');
const multer = require('multer');
const ctrl = require('../controllers/sessionController');

const router = express.Router();

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use XLSX or CSV files.'));
    }
  },
});

router.post('/upload/preview', upload.single('file'), ctrl.previewTimetableUpload);
router.post('/upload/commit', ctrl.commitTimetableUpload);
router.post('/upload', upload.single('file'), ctrl.uploadTimetable);

router.get('/', ctrl.getAllSessions);
router.get('/report/assignments', ctrl.getReportAssignments);
router.get('/consolidated', ctrl.getConsolidatedSessions);
router.get('/range', ctrl.getSessionsByRange);
router.get('/count', ctrl.getSessionCount);

router.post('/', ctrl.addSession);
router.put('/', ctrl.upsertSession);

router.get('/:id/delete-impact', ctrl.getDeleteImpact);
router.patch('/:id', ctrl.updateSession);
router.post('/:id/cancel', ctrl.cancelSession);
router.delete('/:id', ctrl.deleteSession);

module.exports = router;
