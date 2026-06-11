const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const StudentInput = require('../models/StudentInput');
const Duty = require('../models/Duty');
const SeatingArrangement = require('../models/SeatingArrangement');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  parseTimetableFile,
  normalizeSessionsForCommit,
} = require('../utils/timetableParser');
const {
  findDuplicateSession,
  findDuplicatesInBatch,
  formatDateKey,
  DUPLICATE_MESSAGE,
  normalizeDepartment,
  parseSessionDate,
  enrichSession,
} = require('../utils/sessionHelpers');
const { notifyAssignedPeople } = require('../utils/sessionNotifications');
const {
  getSessionDeleteImpact,
  cleanupSessionRelatedData,
} = require('../utils/sessionCleanup');

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

function cleanupUploadedFile(file) {
  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

function isDateOrSessionChanged(oldDate, oldSession, newDate, newSession) {
  return formatDateKey(oldDate) !== formatDateKey(newDate) || oldSession !== newSession;
}

async function handleTimetableUpload(req, res, { commit = false }) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const parsed = await parseTimetableFile(req.file.path, req.file.originalname);

    if (parsed.sessions.length === 0) {
      cleanupUploadedFile(req.file);
      return res.status(400).json({
        error: 'No timetable sessions could be extracted. Please verify the file or edit entries manually.',
        extractedCourses: parsed.extractedCourses,
        sourceType: parsed.sourceType,
      });
    }

    if (!commit) {
      cleanupUploadedFile(req.file);
      return res.json({
        message: 'Timetable extracted successfully. Review and edit before committing.',
        sessions: parsed.sessions,
        extractedCourses: parsed.extractedCourses,
        sourceType: parsed.sourceType,
        count: parsed.sessionCount,
      });
    }

    const normalizedSessions = normalizeSessionsForCommit(parsed.sessions);
    const batchDuplicates = findDuplicatesInBatch(normalizedSessions);
    if (batchDuplicates.length > 0) {
      cleanupUploadedFile(req.file);
      return res.status(409).json({
        error: DUPLICATE_MESSAGE,
        duplicates: batchDuplicates,
      });
    }

    const sessionsToInsert = normalizedSessions.map((s) => ({ ...s, status: 'active' }));
    await Session.deleteMany({});
    await Session.insertMany(sessionsToInsert);
    cleanupUploadedFile(req.file);

    return res.json({
      message: 'Timetable uploaded and processed',
      count: sessionsToInsert.length,
      sourceType: parsed.sourceType,
    });
  } catch (err) {
    cleanupUploadedFile(req.file);
    if (err.code === 11000) {
      return res.status(409).json({ error: DUPLICATE_MESSAGE });
    }
    return res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
}

router.post('/upload/preview', upload.single('file'), async (req, res) => {
  return handleTimetableUpload(req, res, { commit: false });
});

router.post('/upload/commit', async (req, res) => {
  const { sessions } = req.body;
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return res.status(400).json({ error: 'No sessions provided to commit' });
  }

  try {
    const normalizedSessions = normalizeSessionsForCommit(sessions);
    const batchDuplicates = findDuplicatesInBatch(normalizedSessions);
    if (batchDuplicates.length > 0) {
      return res.status(409).json({
        error: DUPLICATE_MESSAGE,
        duplicates: batchDuplicates,
      });
    }

    const sessionsToInsert = normalizedSessions.map((s) => ({ ...s, status: 'active' }));
    await Session.deleteMany({});
    await Session.insertMany(sessionsToInsert);
    res.json({
      message: 'Timetable committed successfully',
      count: sessionsToInsert.length,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: DUPLICATE_MESSAGE });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  return handleTimetableUpload(req, res, { commit: true });
});

router.get('/', async (req, res) => {
  try {
    const { courseName } = req.query;
    const query = courseName ? { courseName } : {};
    const sessions = await Session.find(query).sort({ date: 1, session: 1 });
    res.json(sessions.map((session) => enrichSession(session)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/report/assignments', async (req, res) => {
  try {
    const [inputs, duties, seatings] = await Promise.all([
      StudentInput.find({}, 'sessionRef date session courseCode total'),
      Duty.find({}, 'date session'),
      SeatingArrangement.find({}, 'date session courseCode'),
    ]);

    res.json({
      studentBySessionId: inputs
        .filter((item) => item.sessionRef)
        .map((item) => ({
          sessionId: item.sessionRef.toString(),
          total: item.total || 0,
        })),
      studentByKey: inputs.map((item) => ({
        key: `${formatDateKey(item.date)}|${item.session}|${item.courseCode}`,
        total: item.total || 0,
      })),
      dutySlots: [...new Set(duties.map((duty) => `${duty.date}|${duty.session}`))],
      seatingKeys: seatings.map(
        (item) => `${formatDateKey(item.date)}|${item.session}|${item.courseCode}`
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/consolidated', async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ date: 1, session: 1 })
      .populate('courseCode', 'courseCode courseName studentCount');

    const consolidated = sessions.map((session) => {
      const dateObj = new Date(session.date);
      const formattedDate = !Number.isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-GB', { timeZone: 'UTC' })
        : session.date;

      return {
        id: session._id,
        date: formattedDate,
        session: session.session,
        specialization: session.specialization,
        department: session.department,
        courseCode: session.courseCode?.courseCode || session.courseCode || 'N/A',
        courseName: session.courseCode?.courseName || session.courseName,
        totalStudents: session.courseCode?.studentCount || 0,
      };
    });

    res.json(consolidated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const sessions = await Session.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .sort({ date: 1, session: 1 })
      .populate('courseCode', 'courseCode courseName');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { date, session, courseCode, courseName, specialization, department } = req.body;
  const normalizedDepartment = normalizeDepartment(department);

  if (!date || !session || !courseCode || !courseName || !specialization || !normalizedDepartment) {
    return res.status(400).json({ message: 'All fields including department are required' });
  }

  const duplicate = await findDuplicateSession({
    date,
    session,
    courseCode,
    department: normalizedDepartment,
  });
  if (duplicate) {
    return res.status(409).json({ message: DUPLICATE_MESSAGE });
  }

  const dateObj = parseSessionDate(date);
  const day = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

  const newSession = new Session({
    date: dateObj,
    day,
    session,
    courseCode: courseCode.trim().toUpperCase(),
    courseName: courseName.trim(),
    specialization: specialization.trim(),
    department: normalizedDepartment,
    status: 'active',
  });

  try {
    const savedSession = await newSession.save();
    res.status(201).json(enrichSession(savedSession));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: DUPLICATE_MESSAGE });
    }
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id/delete-impact', async (req, res) => {
  try {
    const sessionDoc = await Session.findById(req.params.id);
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }
    const impact = await getSessionDeleteImpact(sessionDoc);
    res.json(impact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const sessionDoc = await Session.findById(req.params.id);
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (sessionDoc.status === 'cancelled') {
      return res.status(400).json({ message: 'Cancelled sessions cannot be edited.' });
    }

    const oldDate = sessionDoc.date;
    const oldSession = sessionDoc.session;
    const {
      date,
      session,
      courseCode,
      courseName,
      specialization,
      department,
      day,
      rescheduleType,
      rescheduleReason,
    } = req.body;

    const newDate = date ? parseSessionDate(date) : sessionDoc.date;
    const newSessionSlot = session || sessionDoc.session;
    const newCourseCode = (courseCode || sessionDoc.courseCode).trim().toUpperCase();
    const newDepartment = normalizeDepartment(department || sessionDoc.department);

    if (!newDepartment) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const scheduleChanged = isDateOrSessionChanged(oldDate, oldSession, newDate, newSessionSlot);
    if (scheduleChanged) {
      if (!rescheduleType || !['prepone', 'postpone'].includes(rescheduleType)) {
        return res.status(400).json({ message: 'Select Pre-pone or Postpone when changing date or session slot' });
      }
      if (!rescheduleReason || !rescheduleReason.trim()) {
        return res.status(400).json({ message: 'Reason is required for pre-pone/postpone' });
      }
    }

    const duplicate = await findDuplicateSession({
      date: newDate,
      session: newSessionSlot,
      courseCode: newCourseCode,
      department: newDepartment,
      excludeId: sessionDoc._id,
    });
    if (duplicate) {
      return res.status(409).json({ message: DUPLICATE_MESSAGE });
    }

    if (scheduleChanged) {
      sessionDoc.originalDate = sessionDoc.originalDate || oldDate;
      sessionDoc.rescheduleType = rescheduleType;
      sessionDoc.rescheduleReason = rescheduleReason.trim();
      sessionDoc.rescheduledAt = new Date();
    }

    sessionDoc.date = newDate;
    sessionDoc.session = newSessionSlot;
    sessionDoc.courseCode = newCourseCode;
    if (courseName) sessionDoc.courseName = courseName.trim();
    if (specialization) sessionDoc.specialization = specialization.trim();
    sessionDoc.department = newDepartment;
    sessionDoc.day = day || newDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    sessionDoc.markModified('department');

    const updatedSession = await sessionDoc.save();

    if (scheduleChanged) {
      await notifyAssignedPeople({
        session: updatedSession,
        type: 'rescheduled',
        details: {
          oldDate,
          oldSession,
          rescheduleType,
          rescheduleReason: rescheduleReason.trim(),
          newDate: updatedSession.date,
          newSession: updatedSession.session,
        },
      });
    }

    res.json(enrichSession(updatedSession));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: DUPLICATE_MESSAGE });
    }
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const sessionDoc = await Session.findById(req.params.id);
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (sessionDoc.status === 'cancelled') {
      return res.status(400).json({ message: 'Session is already cancelled.' });
    }

    const { cancelReason } = req.body;
    const cleanupResult = await cleanupSessionRelatedData(sessionDoc);

    sessionDoc.status = 'cancelled';
    sessionDoc.cancelledAt = new Date();
    sessionDoc.cancelReason = cancelReason ? cancelReason.trim() : '';
    await sessionDoc.save();

    const notificationResult = await notifyAssignedPeople({
      session: sessionDoc,
      type: 'cancelled',
      details: { cancelReason: sessionDoc.cancelReason },
    });

    res.json({
      message: 'Session cancelled successfully',
      session: enrichSession(sessionDoc),
      notified: notificationResult.notified,
      recipients: notificationResult.recipients,
      cleanup: cleanupResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const sessionDoc = await Session.findById(req.params.id);
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const cleanupResult = await cleanupSessionRelatedData(sessionDoc);

    const notificationResult = await notifyAssignedPeople({
      session: sessionDoc,
      type: sessionDoc.status === 'cancelled' ? 'cancelled' : 'deleted',
      details: { cancelReason: sessionDoc.cancelReason || 'Session removed from timetable.' },
    });

    await Session.findByIdAndDelete(req.params.id);
    res.json({
      message: 'Session deleted successfully',
      notified: notificationResult.notified,
      recipients: notificationResult.recipients,
      cleanup: cleanupResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', async (req, res) => {
  const { date, courseCode, day, session, courseName, department } = req.body;
  if (!date || !courseCode) {
    return res.status(400).json({ error: 'date and courseCode are required' });
  }
  try {
    const updated = await Session.findOneAndUpdate(
      { date, courseCode },
      { day, session, courseName, department },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

router.get('/count', async (req, res) => {
  try {
    const sessionCount = await Session.countDocuments({});
    res.json({ sessionCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching session count.' });
  }
});

module.exports = router;
