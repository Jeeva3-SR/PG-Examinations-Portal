const Duty = require('../models/Duty');
const Seating = require('../models/Seating');
const Session = require('../models/Session');
const SeatingArrangement = require('../models/SeatingArrangement');
const Room = require('../models/Room');
const CompletedDuty = require('../models/CompletedDuty');
const Faculty = require('../models/Faculty');

exports.getDuties = async (req, res) => {
  try {
    const duties = await Duty.find().sort({ date: 1, session: 1, room: 1 });
    res.json(duties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addDuty = async (req, res) => {
  try {
    const duties = req.body;
    if (!Array.isArray(duties) || duties.length === 0) {
      return res.status(400).json({ message: 'Invalid payload. Expected an array of duties.' });
    }
    const savedDuties = await Duty.insertMany(duties);
    res.status(201).json(savedDuties);
  } catch (error) {
    res.status(500).json({ message: 'Error saving duties', error });
  }
};

exports.updateDuty = async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id);
    if (!duty) return res.status(404).json({ message: 'Duty not found' });
    Object.keys(req.body).forEach(key => { duty[key] = req.body[key]; });
    const updatedDuty = await duty.save();
    res.json(updatedDuty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDuty = async (req, res) => {
  try {
    const duty = await Duty.findByIdAndDelete(req.params.id);
    if (!duty) return res.status(404).json({ message: 'Duty not found' });
    res.json({ message: 'Duty deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const duties = await Duty.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate('courseCode', 'courseCode courseName')
      .sort({ date: 1, session: 1, room: 1 });
    res.json(duties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const sessionDoc = await Session.findById(req.params.sessionId);
    if (!sessionDoc) return res.status(404).json({ message: 'Session not found' });

    const seatingArrangements = await SeatingArrangement.find({ date: sessionDoc.date, session: sessionDoc.session });
    const allFaculty = await Faculty.find();

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

    const facultyByCourseCode = new Map();
    for (const f of allFaculty) {
      if (f.courseCode) {
        const key = f.courseCode.toUpperCase();
        if (!facultyByCourseCode.has(key)) facultyByCourseCode.set(key, []);
        facultyByCourseCode.get(key).push(f);
      }
    }
    const courseCodeIndexes = new Map();
    for (const [code] of facultyByCourseCode) {
      courseCodeIndexes.set(code, 0);
    }

    for (const room of seatingArrangements) {
      const studentCount = room.students.length;
      const invigilatorCount = Math.ceil(studentCount / 30);
      let assignedCount = 0;
      const uniqueCourseCodes = [...new Set(room.students.map(s => s.courseCode && s.courseCode.toUpperCase()).filter(Boolean))];

      for (const code of uniqueCourseCodes) {
        const facultyList = facultyByCourseCode.get(code) || [];
        let handlingFaculty = null;
        const startIdx = courseCodeIndexes.get(code) || 0;
        for (let i = startIdx; i < facultyList.length; i++) {
          if (!assignedFacultyIds.has(facultyList[i].facultyId)) {
            handlingFaculty = facultyList[i];
            courseCodeIndexes.set(code, i + 1);
            break;
          }
        }
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
};

exports.getDates = async (req, res) => {
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
};

exports.getRooms = async (req, res) => {
  const { date, session } = req.query;
  if (!date || !session) return res.status(400).json({ message: 'Date and session are required' });
  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    let rooms = await SeatingArrangement.distinct('roomNumber', {
      date: { $gte: startOfDay, $lt: endOfDay },
      session
    });

    if (!rooms || rooms.length === 0) {
      const allRooms = await Room.find().sort({ floor: 1, roomNumber: 1 });
      rooms = allRooms.map(r => r.roomNumber);
    }
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

exports.getByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const duties = await Duty.find({ facultyId }).sort({ date: 1 });
    res.json(duties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty duties', error: error.message });
  }
};

exports.markCompleted = async (req, res) => {
  try {
    let { dutyId, facultyId, facultyName, status } = req.body;
    if (!dutyId || !facultyId || !['completed', 'not completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid data' });
    }
    if (!facultyName) {
      const faculty = await Faculty.findOne({ facultyId });
      if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
      facultyName = faculty.name;
    }
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
};

exports.removeCompleted = async (req, res) => {
  try {
    const { dutyId } = req.params;
    const result = await CompletedDuty.findOneAndDelete({ dutyId });
    if (!result) return res.status(404).json({ message: 'Completed duty record not found' });
    res.status(200).json({ message: 'Completed duty record removed successfully' });
  } catch (error) {
    console.error('Error removing completed duty record:', error);
    res.status(500).json({ message: 'Server error while removing completed duty record.' });
  }
};

exports.getCompleted = async (req, res) => {
  try {
    const records = await CompletedDuty.find({});
    res.json(records);
  } catch (error) {
    console.error('Error fetching completed duties:', error);
    res.status(500).json({ message: 'Server error while fetching completed duties.' });
  }
};

exports.complete = async (req, res) => {
  try {
    const duty = await Duty.findById(req.params.id);
    if (!duty) return res.status(404).json({ message: 'Duty not found' });

    const completedDuty = new CompletedDuty({
      facultyId: duty.facultyId,
      facultyName: duty.facultyName,
      dutyDetails: { date: duty.date, session: duty.session, courseName: duty.courseName },
      status: 'completed',
    });
    await completedDuty.save();
    res.status(201).json({ message: 'Duty marked as complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
