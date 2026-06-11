const Session = require('../models/Session');

exports.uploadTimetable = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const XLSX = require('xlsx');
  const csv = require('csv-parser');
  const fs = require('fs');
  const path = require('path');

  const courseMap = {
    'CS101': 'Computer Science 101',
    'MA201': 'Mathematics 201',
    'PH301': 'Physics 301',
  };

  const specializationMap = {
    "CSE OR": "M.E. Computer Science and Engineering (OR)",
    "CSE": "M.E. Computer Science and Engineering",
    "CSE BDA": "M.E. CSE (Specialization in Big Data Analytics)",
    "SE": "M.E. Software Engineering"
  };

  function parseDateString(dateStr) {
    const dateRegex = /(\d{2})[-\/](\w{3})[-\/]?(\d{2,4})/;
    const match = dateStr.match(dateRegex);
    if (!match) return null;
    const [_, day, month, year] = match;
    const monthMap = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(Date.UTC(fullYear, monthMap[month], parseInt(day)));
  }

  function extractSessionAndDay(cellValue) {
    const sessionMatch = cellValue.match(/\b(FN|AN)\b/);
    const dayMatch = cellValue.match(/\[([A-Z]+)\]/);
    return {
      session: sessionMatch ? sessionMatch[1] : null,
      day: dayMatch ? dayMatch[1] : null
    };
  }

  function parseCourseInfo(cellValue) {
    const courseCodeMatch = cellValue.match(/^([A-Z]{2,4}\d{3,4})\s*(.*)/);
    if (!courseCodeMatch) return null;
    return {
      courseCode: courseCodeMatch[1],
      courseName: courseCodeMatch[2].trim()
    };
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  let sessions = [];

  try {
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const range = XLSX.utils.decode_range(sheet['!ref']);

      const headers = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
        headers[C] = cell ? cell.v : '';
      }

      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        let currentDate = null;
        let currentSession = null;
        let currentDay = null;

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
          if (!cell) continue;

          const cellValue = cell.v.toString().trim();
          if (!cellValue) continue;

          const date = parseDateString(cellValue);
          if (date) {
            currentDate = date;
            const { session, day } = extractSessionAndDay(cellValue);
            if (session) currentSession = session;
            if (day) currentDay = day;
            continue;
          }

          const courseInfo = parseCourseInfo(cellValue);
          if (courseInfo && currentDate && currentSession) {
            const specialization = specializationMap[headers[C]] || headers[C];
            sessions.push({
              date: currentDate,
              day: currentDay || currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
              session: currentSession,
              courseCode: courseInfo.courseCode,
              courseName: courseInfo.courseName,
              specialization: specialization
            });
          }
        }
      }
    } else if (ext === '.csv') {
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', resolve)
          .on('error', reject);
      });

      let currentDate = null;
      let currentSession = null;
      let currentDay = null;

      for (const row of results) {
        for (const [header, value] of Object.entries(row)) {
          if (!value) continue;
          const cellValue = value.toString().trim();

          const date = parseDateString(cellValue);
          if (date) {
            currentDate = date;
            const { session, day } = extractSessionAndDay(cellValue);
            if (session) currentSession = session;
            if (day) currentDay = day;
            continue;
          }

          const courseInfo = parseCourseInfo(cellValue);
          if (courseInfo && currentDate && currentSession) {
            const specialization = specializationMap[header] || header;
            sessions.push({
              date: currentDate,
              day: currentDay || currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
              session: currentSession,
              courseCode: courseInfo.courseCode,
              courseName: courseInfo.courseName,
              specialization: specialization
            });
          }
        }
      }
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    await Session.deleteMany({});
    await Session.insertMany(sessions);
    fs.unlinkSync(req.file.path);
    res.json({ message: 'Timetable uploaded and processed', count: sessions.length });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const { courseName } = req.query;
    let query = {};
    if (courseName) query.courseName = courseName;
    const sessions = await Session.find(query).sort({ date: 1, session: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConsolidatedSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ date: 1, session: 1 })
      .populate('courseCode', 'courseCode courseName studentCount');

    const consolidated = sessions.map(session => {
      const dateObj = new Date(session.date);
      const formattedDate = !isNaN(dateObj)
        ? dateObj.toLocaleDateString('en-GB', { timeZone: 'UTC' })
        : session.date;

      return {
        id: session._id,
        date: formattedDate,
        session: session.session,
        specialization: session.specialization,
        courseCode: session.courseCode?.courseCode || 'N/A',
        courseName: session.courseCode?.courseName || session.courseName,
        totalStudents: session.courseCode?.studentCount || 0
      };
    });

    res.json(consolidated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSessionsByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const sessions = await Session.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .sort({ date: 1, session: 1 })
      .populate('courseCode', 'courseCode courseName');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSession = async (req, res) => {
  const { date, session, courseCode, courseName, specialization } = req.body;

  if (!date || !session || !courseCode || !courseName || !specialization) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  const newSession = new Session({ date, day, session, courseCode, courseName, specialization });

  try {
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    Object.keys(req.body).forEach(key => {
      session[key] = req.body[key];
    });

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upsertSession = async (req, res) => {
  const { date, courseCode, day, session, courseName } = req.body;
  if (!date || !courseCode) {
    return res.status(400).json({ error: 'date and courseCode are required' });
  }
  try {
    const updated = await Session.findOneAndUpdate(
      { date, courseCode },
      { day, session, courseName },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session' });
  }
};

exports.getSessionCount = async (req, res) => {
  try {
    const sessionCount = await Session.countDocuments({});
    res.json({ sessionCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching session count.' });
  }
};
