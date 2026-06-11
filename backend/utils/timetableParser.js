const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const specializationMap = {
  'CSE OR': 'M.E. Computer Science and Engineering (OR)',
  CSE: 'M.E. Computer Science and Engineering',
  'CSE BDA': 'M.E. CSE (Specialization in Big Data Analytics)',
  SE: 'M.E. Software Engineering',
};

const courseMap = {
  CS101: 'Computer Science 101',
  MA201: 'Mathematics 201',
  PH301: 'Physics 301',
  EC401: 'Electronics 401',
  ME501: 'Mechanical Engineering 501',
};

function parseDateString(dateStr) {
  const dateRegex = /(\d{2})[-/](\w{3})[-/]?(\d{2,4})/i;
  const match = dateStr.match(dateRegex);
  if (!match) return null;
  const [, day, month, year] = match;
  const monthMap = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  const monthKey = month.toUpperCase();
  if (monthMap[monthKey] === undefined) return null;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return new Date(Date.UTC(fullYear, monthMap[monthKey], parseInt(day, 10)));
}

function extractSessionAndDay(cellValue) {
  const sessionMatch = cellValue.match(/\b(FN|AN)\b/);
  const dayMatch = cellValue.match(/\[([A-Z]+)\]/);
  return {
    session: sessionMatch ? sessionMatch[1] : null,
    day: dayMatch ? dayMatch[1] : null,
  };
}

function parseCourseInfo(cellValue) {
  const courseCodeMatch = cellValue.match(/\b([A-Z]{2,4}\d{3,4})\b\s*(.*)/i);
  if (!courseCodeMatch) return null;
  const courseCode = courseCodeMatch[1].toUpperCase();
  let courseName = courseCodeMatch[2].trim();
  if (!courseName && courseMap[courseCode]) {
    courseName = courseMap[courseCode];
  }
  return { courseCode, courseName };
}

function formatSessionRecord({
  date,
  day,
  session,
  courseCode,
  courseName,
  specialization,
  department = '',
}) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const resolvedDay = day || dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  });
  const resolvedName = courseName || courseMap[courseCode] || '';
  const resolvedDepartment = department.trim();
  return {
    date: dateObj.toISOString(),
    day: resolvedDay,
    session,
    courseCode,
    courseName: resolvedName,
    specialization: specializationMap[specialization] || specialization,
    department: resolvedDepartment,
    needsReview: !courseCode || !resolvedName || !resolvedDepartment,
  };
}

function buildExtractedCourses(sessions) {
  const courseIndex = new Map();
  for (const session of sessions) {
    if (!session.courseCode) continue;
    const existing = courseIndex.get(session.courseCode);
    const hasName = Boolean(session.courseName && session.courseName.trim());
    if (!existing) {
      courseIndex.set(session.courseCode, {
        courseCode: session.courseCode,
        courseName: session.courseName || '',
        extracted: hasName,
      });
    } else if (hasName && !existing.courseName) {
      existing.courseName = session.courseName;
      existing.extracted = true;
    }
  }
  return Array.from(courseIndex.values());
}

function parseExcelFile(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet['!ref']);

  const headers = [];
  for (let C = range.s.c; C <= range.e.c; C += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
    headers[C] = cell ? String(cell.v).trim() : '';
  }

  const sessions = [];
  for (let R = range.s.r + 1; R <= range.e.r; R += 1) {
    let currentDate = null;
    let currentSession = null;
    let currentDay = null;

    for (let C = range.s.c; C <= range.e.c; C += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
      if (!cell) continue;

      const cellValue = String(cell.v).trim();
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
        sessions.push(formatSessionRecord({
          date: currentDate,
          day: currentDay,
          session: currentSession,
          courseCode: courseInfo.courseCode,
          courseName: courseInfo.courseName,
          specialization: headers[C],
        }));
      }
    }
  }

  return sessions;
}

async function parseCsvFile(filePath) {
  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  const sessions = [];
  let currentDate = null;
  let currentSession = null;
  let currentDay = null;

  for (const row of results) {
    for (const [header, value] of Object.entries(row)) {
      if (!value) continue;

      const cellValue = String(value).trim();
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
        sessions.push(formatSessionRecord({
          date: currentDate,
          day: currentDay,
          session: currentSession,
          courseCode: courseInfo.courseCode,
          courseName: courseInfo.courseName,
          specialization: header,
        }));
      }
    }
  }

  return sessions;
}

function getFileCategory(ext) {
  if (ext === '.xlsx' || ext === '.xls') return 'excel';
  if (ext === '.csv') return 'csv';
  return 'unsupported';
}

async function parseTimetableFile(filePath, originalName) {
  const ext = path.extname(originalName || filePath).toLowerCase();
  const category = getFileCategory(ext);

  if (category === 'unsupported') {
    throw new Error('Unsupported file type. Use XLSX or CSV.');
  }

  let sessions = [];
  if (category === 'excel') {
    sessions = parseExcelFile(filePath);
  } else if (category === 'csv') {
    sessions = await parseCsvFile(filePath);
  }

  return {
    sessions,
    extractedCourses: buildExtractedCourses(sessions),
    sourceType: category,
    sessionCount: sessions.length,
  };
}

function normalizeSessionsForCommit(sessions) {
  return sessions.map((session) => {
    const dateObj = new Date(session.date);
    if (Number.isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date for course ${session.courseCode || 'unknown'}`);
    }
    if (!session.session || !['FN', 'AN'].includes(session.session)) {
      throw new Error(`Invalid session type for ${session.courseCode || 'unknown'}`);
    }
    if (!session.courseCode || !session.courseName || !session.specialization || !session.department) {
      throw new Error('Each session requires course code, course name, specialization, and department');
    }

    return {
      date: dateObj,
      day: session.day || dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
      session: session.session,
      courseCode: session.courseCode.trim().toUpperCase(),
      courseName: session.courseName.trim(),
      specialization: session.specialization.trim(),
      department: session.department.trim(),
    };
  });
}

module.exports = {
  specializationMap,
  courseMap,
  parseDateString,
  extractSessionAndDay,
  parseCourseInfo,
  formatSessionRecord,
  buildExtractedCourses,
  parseExcelFile,
  parseCsvFile,
  getFileCategory,
  parseTimetableFile,
  normalizeSessionsForCommit,
};
