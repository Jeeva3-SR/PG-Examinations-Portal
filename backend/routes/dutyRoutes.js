const express = require('express');
const router = express.Router();
const Duty = require('../models/Duty');
const Seating = require('../models/Seating');
const Session = require('../models/Session');
const SeatingArrangement = require('../models/SeatingArrangement');
const CompletedDuty = require('../models/CompletedDuty');
const Faculty = require('../models/Faculty');

// Get all duties
router.get('/', async (req, res) => {
  try {
    const duties = await Duty.find().sort({ date: 1, session: 1, room: 1 });
    res.json(duties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/duties - Save duty assignments
router.post('/', async (req, res) => {
    try {
        const duties = req.body;
        if (!Array.isArray(duties) || duties.length === 0) {
            return res.status(400).json({ message: 'Invalid payload. Expected an array of duties.' });
        }
        // Assuming the new Duty model is in use, the old one is overwritten
        const savedDuties = await Duty.insertMany(duties);
        res.status(201).json(savedDuties);
    } catch (error) {
        res.status(500).json({ message: 'Error saving duties', error });
    }
});

// Update a duty
router.patch('/:id', async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id);
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }

    Object.keys(req.body).forEach(key => {
      duty[key] = req.body[key];
    });

    const updatedDuty = await duty.save();
    res.json(updatedDuty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a duty
router.delete('/:id', async (req, res) => {
  try {
    const duty = await Duty.findByIdAndDelete(req.params.id);
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }

    res.json({ message: 'Duty deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get duties by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const duties = await Duty.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('courseCode', 'courseCode courseName')
      .sort({ date: 1, session: 1, room: 1 });
    res.json(duties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate duties for a session
router.post('/generate/:sessionId', async (req, res) => {
  try {
    const sessionDoc = await Session.findById(req.params.sessionId);
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Get seating arrangements for the selected date and session
    const seatingArrangements = await SeatingArrangement.find({ date: sessionDoc.date, session: sessionDoc.session });
    // Get all faculty
    const allFaculty = await Faculty.find();
    // Shuffle other faculty for random assignment
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    const assignedFacultyIds = new Set();
    const duties = [];
    let shuffledOtherFaculty = shuffle([...allFaculty]);
    let otherFacultyIdx = 0;

    for (const room of seatingArrangements) {
      const studentCount = room.students.length;
      const invigilatorCount = Math.ceil(studentCount / 30); // 1 invigilator per 30 students
      let assignedCount = 0;
      // 1. Extract all unique courseCodes from students array
      const uniqueCourseCodes = [...new Set(room.students.map(s => s.courseCode && s.courseCode.toUpperCase()).filter(Boolean))];
      // 2. For each unique courseCode, assign a matching faculty (if available and not already assigned)
      for (const code of uniqueCourseCodes) {
        const handlingFaculty = allFaculty.find(f => !assignedFacultyIds.has(f.facultyId) && f.courseCode && f.courseCode.toUpperCase() === code);
        if (handlingFaculty) {
          duties.push(new Duty({
            facultyId: handlingFaculty.facultyId,
            facultyName: handlingFaculty.name,
            room: room.roomNumber,
            date: sessionDoc.date.toISOString().split('T')[0],
            session: sessionDoc.session
          }));
          assignedFacultyIds.add(handlingFaculty.facultyId);
          assignedCount++;
          if (assignedCount >= invigilatorCount) break;
        }
      }
      // 3. Fill remaining invigilator slots with other available faculty randomly
      for (let i = assignedCount; i < invigilatorCount; i++) {
        while (otherFacultyIdx < shuffledOtherFaculty.length && assignedFacultyIds.has(shuffledOtherFaculty[otherFacultyIdx].facultyId)) {
          otherFacultyIdx++;
        }
        if (otherFacultyIdx < shuffledOtherFaculty.length) {
          const assignedFaculty = shuffledOtherFaculty[otherFacultyIdx];
          duties.push(new Duty({
            facultyId: assignedFaculty.facultyId,
            facultyName: assignedFaculty.name,
            room: room.roomNumber,
            date: sessionDoc.date.toISOString().split('T')[0],
            session: sessionDoc.session
          }));
          assignedFacultyIds.add(assignedFaculty.facultyId);
          otherFacultyIdx++;
        }
      }
    }

    await Duty.insertMany(duties);
    res.status(201).json({ message: 'Duties generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/duties/dates - Get distinct dates and sessions
router.get('/dates', async (req, res) => {
    try {
        const dateSessions = await Session.aggregate([
            { $group: { _id: { date: '$date', session: '$session' } } },
            { $project: { date: '$_id.date', session: '$_id.session', _id: 0 } },
            { $sort: { date: 1, session: 1 } }
        ]);
        res.json(dateSessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dates and sessions', error });
    }
});

// GET /api/duties/rooms?date=YYYY-MM-DD&session=FN - Get distinct rooms
router.get('/rooms', async (req, res) => {
    const { date, session } = req.query;
    if (!date || !session) {
        return res.status(400).json({ message: 'Date and session are required' });
    }
    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        const rooms = await SeatingArrangement.distinct('roomNumber', {
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            session
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
});

// GET /api/duties/faculty/:facultyId - Get duties for a specific faculty
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        const duties = await Duty.find({ facultyId: facultyId }).sort({ date: 1 });
        res.json(duties);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculty duties', error: error.message });
    }
});

// POST: Mark duty as completed or not completed
router.post('/completed-duties', async (req, res) => {
    try {
        let { dutyId, facultyId, facultyName, status } = req.body;
        if (!dutyId || !facultyId || !['completed', 'not completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid data' });
        }
        // If facultyName is missing, look it up
        if (!facultyName) {
            const faculty = await Faculty.findOne({ facultyId });
            if (!faculty) {
                return res.status(404).json({ message: 'Faculty not found' });
            }
            facultyName = faculty.name;
        }
        // Upsert: one record per dutyId
        const result = await CompletedDuty.findOneAndUpdate(
            { dutyId },
            { facultyId, facultyName, status, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('Error marking duty:', error);
        res.status(500).json({ message: 'Server error while marking duty.' });
    }
});

// DELETE: Remove completed duty record
router.delete('/completed-duties/:dutyId', async (req, res) => {
    try {
        const { dutyId } = req.params;
        const result = await CompletedDuty.findOneAndDelete({ dutyId });
        if (!result) {
            return res.status(404).json({ message: 'Completed duty record not found' });
        }
        res.status(200).json({ message: 'Completed duty record removed successfully' });
    } catch (error) {
        console.error('Error removing completed duty record:', error);
        res.status(500).json({ message: 'Server error while removing completed duty record.' });
    }
});

// GET: Get all completed duties (return dutyId for each)
router.get('/completed-duties', async (req, res) => {
    try {
        const records = await CompletedDuty.find({});
        res.json(records);
    } catch (error) {
        console.error('Error fetching completed duties:', error);
        res.status(500).json({ message: 'Server error while fetching completed duties.' });
    }
});

// Mark duty as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id);
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found' });
    }

    const completedDuty = new CompletedDuty({
      facultyId: duty.facultyId,
      facultyName: duty.facultyName, // Ensure facultyName is passed
      dutyDetails: {
        date: duty.date,
        session: duty.session,
        courseName: duty.courseName,
      },
      status: 'completed',
    });

    await completedDuty.save();
    res.status(201).json({ message: 'Duty marked as complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 