const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Room = require('../models/Room');
const Student = require('../models/Students');
const SeatingArrangement = require('../models/SeatingArrangement');

// Helper to format date as "DD-MMM-YY"
function formatDateToExamString(dateObj) {
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = months[dateObj.getMonth()];
  const year = String(dateObj.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

// POST /api/seating-arrangement/generate
router.post('/generate', async (req, res) => {
  const { date, session } = req.body;
  if (!date || !session) {
    return res.status(400).json({ error: 'Date and session are required' });
  }
  try {
    // 1. Fetch sessions for the given date and session
    // Force date to be treated as UTC midnight
    const dateObj = new Date(date.split('T')[0] + 'T00:00:00.000Z');

    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sessionDocs = await Session.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      session
    });
    if (!sessionDocs.length) {
      return res.status(404).json({ error: 'No sessions found for selected date and session' });
    }

    // 2. For each session, get all students by specialization and courseCode
    let allStudents = [];
    for (const sess of sessionDocs) {
      // Format session date to match student exam date string
      const examDateStr = formatDateToExamString(sess.date);
      // Debug log to verify matching values
      console.log('Matching students with:', {
        branch: sess.specialization,
        courseCode: sess.courseCode,
        date: examDateStr,
        session: sess.session
      });
      // Find students whose branch matches specialization and who have an exam for this courseCode, date, and session
      const students = await Student.find({
        branch: sess.specialization,
        exams: { $elemMatch: { courseCode: sess.courseCode, date: examDateStr, session: sess.session } }
      });
      // Add courseCode and specialization to each student for later use
      allStudents.push(...students.map(s => ({
        studentName: s.name,
        regNo: s.regNo,
        courseCode: sess.courseCode,
        specialization: sess.specialization
      })));
    }
    if (!allStudents.length) {
      return res.status(404).json({ error: 'No students found for selected date and session' });
    }

    // 3. Get all rooms and sort by floor, then roomNumber
    const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 });
    if (!rooms.length) {
      return res.status(404).json({ error: 'No rooms available' });
    }

    // 4. Allocate students to rooms (round-robin by courseCode, respect capacity)
    // Group students by courseCode
    const courseGroups = {};
    allStudents.forEach(s => {
      if (!courseGroups[s.courseCode]) courseGroups[s.courseCode] = [];
      courseGroups[s.courseCode].push(s);
    });
    // Prepare round-robin queue
    const courseCodes = Object.keys(courseGroups);
    let roundRobinQueue = [];
    let maxLen = Math.max(...courseCodes.map(c => courseGroups[c].length));
    for (let i = 0; i < maxLen; i++) {
      for (let c of courseCodes) {
        if (courseGroups[c][i]) roundRobinQueue.push(courseGroups[c][i]);
      }
    }

    // 5. Fill rooms
    let studentIdx = 0;
    let arrangements = [];
    for (const room of rooms) {
      let roomStudents = [];
      for (let i = 0; i < room.capacity && studentIdx < roundRobinQueue.length; i++) {
        // Assign seatNo as i+1 (sequential per room)
        roomStudents.push({
          ...roundRobinQueue[studentIdx],
          seatNo: i + 1
        });
        studentIdx++;
      }
      if (roomStudents.length > 0) {
        arrangements.push({
          roomNumber: room.roomNumber,
          date: dateObj,
          session,
          floor: room.floor,
          students: roomStudents
        });
      }
      if (studentIdx >= roundRobinQueue.length) break;
    }

    // 6. Store in SeatingArrangement collection (remove old for this date/session first)
    await SeatingArrangement.deleteMany({
      date: { $gte: startOfDay, $lte: endOfDay },
      session
    });
    if (arrangements.length > 0) {
      await SeatingArrangement.insertMany(arrangements);
    }

    res.json({
      message: 'Seating arrangement generated successfully',
      arrangements,
      roomsUsed: arrangements.length,
      totalStudents: allStudents.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate seating arrangement', details: err.message });
  }
});

// GET /api/seating-arrangement/rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/seating-arrangement/room-summary?date=YYYY-MM-DD&session=FN&room=ROOM_NAME
router.get('/room-summary', async (req, res) => {
    const { date, session, room } = req.query;
    if (!date || !session || !room) {
        return res.status(400).json({ message: 'Date, session, and room are required' });
    }
    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        
        const arrangement = await SeatingArrangement.findOne({ 
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }, 
            session, 
            roomNumber: room 
        });

        if (!arrangement) {
            return res.json({ studentCount: 0 });
        }

        const studentCount = arrangement.students.length;
        res.json({ studentCount });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching room summary', error: error.message });
    }
});

// POST /api/seating-arrangement/generate-from-excel
router.post('/generate-from-excel', async (req, res) => {
  const { entryId, rooms } = req.body;
  if (!entryId || !rooms || !rooms.length) {
    return res.status(400).json({ error: 'entryId and rooms array are required' });
  }
  try {
    const StudentInput = require('../models/StudentInput');
    const { getFileBuffer } = require('../utils/s3');
    const XLSX = require('xlsx');

    const entry = await StudentInput.findById(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    const fields = [
      { status: 'cegRegularStatus', key: 'cegRegularKey', label: 'CEG Regular' },
      { status: 'cegArrearStatus', key: 'cegArrearKey', label: 'CEG Arrear' },
      { status: 'mitRegularStatus', key: 'mitRegularKey', label: 'MIT Regular' },
      { status: 'mitArrearStatus', key: 'mitArrearKey', label: 'MIT Arrear' },
    ];

    let allStudents = [];
    for (const f of fields) {
      if (entry[f.status] !== 'uploaded' || !entry[f.key]) continue;
      try {
        const buffer = await getFileBuffer(entryId, f.status);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const students = data.map(row => {
          const regNo = row['Register Number'] || row['Reg No'] || row['RegNo'] || row['Reg. No'] || row['Roll Number'] || row['RollNo'] || Object.values(row)[0] || '';
          const name = row['Name'] || row['Student Name'] || row['StudentName'] || row['Student'] || Object.values(row)[1] || '';
          return { regNo: String(regNo).trim(), name: String(name).trim(), category: f.label };
        }).filter(s => s.regNo);
        allStudents.push(...students);
      } catch (e) {
        console.warn(`Skipping field ${f.label}: ${e.message}`);
      }
    }

    if (!allStudents.length) {
      return res.status(404).json({ error: 'No student data found in uploaded files' });
    }

    let studentIdx = 0;
    let arrangements = [];
    for (const room of rooms) {
      let roomStudents = [];
      for (let i = 0; i < room.capacity && studentIdx < allStudents.length; i++) {
        roomStudents.push({ ...allStudents[studentIdx], seatNo: i + 1 });
        studentIdx++;
      }
      if (roomStudents.length > 0) {
        arrangements.push({ roomName: room.name, students: roomStudents });
      }
      if (studentIdx >= allStudents.length) break;
    }

    // Persist to database — remove old for this entry, then insert
    await SeatingArrangement.deleteMany({ entryRef: entryId });
    const dateObj = entry.date instanceof Date ? entry.date : new Date(entry.date);
    const docs = arrangements.map(r => ({
      entryRef: entryId,
      roomNumber: r.roomName,
      date: dateObj,
      session: entry.session,
      courseCode: entry.courseCode,
      specialization: entry.specialization,
      students: r.students.map(s => ({
        studentName: s.name,
        regNo: s.regNo,
        courseCode: entry.courseCode,
        specialization: entry.specialization,
        category: s.category,
        seatNo: s.seatNo,
      })),
    }));
    if (docs.length) await SeatingArrangement.insertMany(docs);

    res.json({ arrangements, totalStudents: allStudents.length, roomsUsed: arrangements.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate seating plan', details: err.message });
  }
});

// GET /api/seating-arrangement/by-entry/:entryId
router.get('/by-entry/:entryId', async (req, res) => {
  try {
    const docs = await SeatingArrangement.find({ entryRef: req.params.entryId }).sort({ roomNumber: 1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seating plan', details: err.message });
  }
});

module.exports = router; 