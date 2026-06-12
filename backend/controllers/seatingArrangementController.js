const Session = require('../models/Session');
const Room = require('../models/Room');
const SeatingArrangement = require('../models/SeatingArrangement');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

exports.getRoomSummary = async (req, res) => {
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
      date: { $gte: startOfDay, $lt: endOfDay },
      session,
      roomNumber: room
    });

    if (!arrangement) return res.json({ studentCount: 0 });
    res.json({ studentCount: arrangement.students.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room summary', error: error.message });
  }
};

exports.generateFromExcel = async (req, res) => {
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
    const uploadedFields = fields.filter(f => entry[f.status] === 'uploaded' && entry[f.key]);
    const results = await Promise.all(uploadedFields.map(async (f) => {
      try {
        const buffer = await getFileBuffer(entryId, f.status);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        return data.flatMap(row => {
          const regNo = row['Register Number'] || row['Reg No'] || row['RegNo'] || row['Reg. No'] || row['Roll Number'] || row['RollNo'] || Object.values(row)[0] || '';
          const name = row['Name'] || row['Student Name'] || row['StudentName'] || row['Student'] || Object.values(row)[1] || '';
          const trimmedRegNo = String(regNo).trim();
          return trimmedRegNo ? [{ regNo: trimmedRegNo, name: String(name).trim(), category: f.label }] : [];
        });
      } catch (e) {
        console.warn(`Skipping field ${f.label}: ${e.message}`);
        return [];
      }
    }));
    for (const students of results) {
      allStudents.push(...students);
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
};

exports.getByEntry = async (req, res) => {
  try {
    const docs = await SeatingArrangement.find({ entryRef: req.params.entryId }).sort({ roomNumber: 1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seating plan', details: err.message });
  }
};

exports.getByDateSession = async (req, res) => {
  try {
    const { date, session } = req.query;
    if (!date || !session) {
      return res.status(400).json({ error: 'Date and session are required' });
    }
    const startOfDay = new Date(date.split('T')[0] + 'T00:00:00.000Z');
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const arrangements = await SeatingArrangement.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      session
    });
    res.json({ arrangements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
