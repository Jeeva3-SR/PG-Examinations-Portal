const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const multer = require('multer');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Static courseCode to courseName map (replace with DB lookup if needed)
const courseMap = {
  'CS101': 'Computer Science 101',
  'MA201': 'Mathematics 201',
  'PH301': 'Physics 301',
  // Add more mappings as needed
};

// Specialization mapping
const specializationMap = {
  "CSE OR": "M.E. Computer Science and Engineering (OR)",
  "CSE": "M.E. Computer Science and Engineering",
  "CSE BDA": "M.E. CSE (Specialization in Big Data Analytics)",
  "SE": "M.E. Software Engineering"
};

// Helper function to parse date string
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
  // Use Date.UTC to avoid timezone shift
  return new Date(Date.UTC(fullYear, monthMap[month], parseInt(day)));
}

// Helper function to extract session and day
function extractSessionAndDay(cellValue) {
  const sessionMatch = cellValue.match(/\b(FN|AN)\b/);
  const dayMatch = cellValue.match(/\[([A-Z]+)\]/);
  
  return {
    session: sessionMatch ? sessionMatch[1] : null,
    day: dayMatch ? dayMatch[1] : null
  };
}

// Helper function to parse course code and name
function parseCourseInfo(cellValue) {
  const courseCodeMatch = cellValue.match(/^([A-Z]{2,4}\d{3,4})\s*(.*)/);
  if (!courseCodeMatch) return null;
  
  return {
    courseCode: courseCodeMatch[1],
    courseName: courseCodeMatch[2].trim()
  };
}

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// Upload timetable (Excel/CSV)
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = path.extname(req.file.originalname).toLowerCase();
  let sessions = [];

  try {
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const range = XLSX.utils.decode_range(sheet['!ref']);
      
      // Get headers from first row
      const headers = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
        headers[C] = cell ? cell.v : '';
      }
      
      // Process each row
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        let currentDate = null;
        let currentSession = null;
        let currentDay = null;
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
          if (!cell) continue;
          
          const cellValue = cell.v.toString().trim();
          if (!cellValue) continue;
          
          // Try to parse date
          const date = parseDateString(cellValue);
          if (date) {
            currentDate = date;
            const { session, day } = extractSessionAndDay(cellValue);
            if (session) currentSession = session;
            if (day) currentDay = day;
            continue;
          }
          
          // Try to parse course info
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
      
      // Process CSV rows similarly to Excel
      let currentDate = null;
      let currentSession = null;
      let currentDay = null;
      
      for (const row of results) {
        for (const [header, value] of Object.entries(row)) {
          if (!value) continue;
          
          const cellValue = value.toString().trim();
          
          // Try to parse date
          const date = parseDateString(cellValue);
          if (date) {
            currentDate = date;
            const { session, day } = extractSessionAndDay(cellValue);
            if (session) currentSession = session;
            if (day) currentDay = day;
            continue;
          }
          
          // Try to parse course info
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

    // Delete all existing sessions before adding new ones
    await Session.deleteMany({});

    // Insert all new sessions
    await Session.insertMany(sessions);

    fs.unlinkSync(req.file.path); // Clean up uploaded file
    res.json({ message: 'Timetable uploaded and processed', count: sessions.length });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
});

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const { courseName } = req.query;
    let query = {};
    
    if (courseName) {
      query.courseName = courseName;
    }
    
    const sessions = await Session.find(query).sort({ date: 1, session: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get consolidated sessions
router.get('/consolidated', async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort({ date: 1, session: 1 })
      .populate('courseCode', 'courseCode courseName studentCount');
    
    const consolidated = sessions.map(session => ({
      id: session._id,
      date: new Date(session.date).toLocaleDateString('en-GB'),
      session: session.session,
      specialization: session.specialization,
      courseCode: session.courseCode,
      courseName: session.courseName,
      totalStudents: session.courseCode?.studentCount || 0
    }));

    res.json(consolidated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sessions by date range
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

// Add a new session
router.post('/', async (req, res) => {
  const { date, session, courseCode, courseName, specialization } = req.body;
  
  if (!date || !session || !courseCode || !courseName || !specialization) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Calculate day from date
  const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  const newSession = new Session({
    date,
    day,
    session,
    courseCode,
    courseName,
    specialization
  });

  try {
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a session
router.patch('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    Object.keys(req.body).forEach(key => {
      session[key] = req.body[key];
    });

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a session
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT route for timetable revision (update by date and courseCode)
router.put('/', async (req, res) => {
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
});

// GET: The total count of all sessions
router.get('/count', async (req, res) => {
  try {
    const sessionCount = await Session.countDocuments({});
    res.json({ sessionCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching session count.' });
  }
});

module.exports = router; 