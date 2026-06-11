const Session = require('../models/Session');

const DUPLICATE_MESSAGE = 'This session entity is already present. Same date, session slot, department, and course code cannot be duplicated.';

function formatDateKey(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function getUtcDayBounds(dateInput) {
  const key = formatDateKey(dateInput);
  return {
    start: new Date(`${key}T00:00:00.000Z`),
    end: new Date(`${key}T23:59:59.999Z`),
  };
}

function normalizeDepartment(department) {
  return String(department || '').trim();
}

function parseSessionDate(dateInput) {
  if (!dateInput) return null;
  const key = String(dateInput).split('T')[0];
  return new Date(`${key}T00:00:00.000Z`);
}

function buildSessionKey(date, session, courseCode, department) {
  return `${formatDateKey(date)}|${session}|${String(courseCode).trim().toUpperCase()}|${normalizeDepartment(department)}`;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSessionDisplayStatus(session) {
  if (session.status === 'cancelled') return 'cancelled';
  if (session.rescheduleType === 'prepone' || session.rescheduleType === 'postpone') return 'rescheduled';
  const sessionKey = formatDateKey(session.date);
  const todayKey = getTodayKey();
  if (sessionKey < todayKey) return 'completed';
  return 'active';
}

async function findDuplicateSession({ date, session, courseCode, department, excludeId }) {
  const { start, end } = getUtcDayBounds(date);
  const normalizedDepartment = normalizeDepartment(department);
  const query = {
    date: { $gte: start, $lte: end },
    session,
    courseCode: String(courseCode).trim().toUpperCase(),
    department: normalizedDepartment,
    status: { $ne: 'cancelled' },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Session.findOne(query);
}

function findDuplicatesInBatch(sessions) {
  const seen = new Set();
  const duplicates = [];

  for (const session of sessions) {
    const key = buildSessionKey(
      session.date,
      session.session,
      session.courseCode,
      session.department
    );
    if (seen.has(key)) {
      duplicates.push(key);
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

function inferRescheduleType(oldDate, newDate) {
  const oldTime = new Date(oldDate).getTime();
  const newTime = new Date(newDate).getTime();
  if (newTime < oldTime) return 'prepone';
  if (newTime > oldTime) return 'postpone';
  return null;
}

function enrichSession(sessionDoc) {
  const session = sessionDoc.toObject ? sessionDoc.toObject() : { ...sessionDoc };
  session.department = normalizeDepartment(session.department);
  session.displayStatus = getSessionDisplayStatus(session);
  return session;
}

module.exports = {
  DUPLICATE_MESSAGE,
  formatDateKey,
  getUtcDayBounds,
  normalizeDepartment,
  parseSessionDate,
  buildSessionKey,
  getTodayKey,
  getSessionDisplayStatus,
  findDuplicateSession,
  findDuplicatesInBatch,
  inferRescheduleType,
  enrichSession,
};
