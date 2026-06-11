const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
  parseDateString,
  parseCourseInfo,
  extractSessionAndDay,
  parseCsvFile,
  buildExtractedCourses,
  normalizeSessionsForCommit,
  getFileCategory,
} = require('../utils/timetableParser');

test('parseDateString extracts date from timetable header', () => {
  const date = parseDateString('04-JUN-25 FN [WED]');
  assert.equal(date.toISOString(), '2025-06-04T00:00:00.000Z');
});

test('extractSessionAndDay reads FN/AN and weekday', () => {
  const result = extractSessionAndDay('05-JUN-25 AN [THU]');
  assert.equal(result.session, 'AN');
  assert.equal(result.day, 'THU');
});

test('parseCourseInfo extracts code and name', () => {
  const result = parseCourseInfo('CS101 Computer Science 101');
  assert.equal(result.courseCode, 'CS101');
  assert.equal(result.courseName, 'Computer Science 101');
});

test('parseCourseInfo falls back to known course map when name missing', () => {
  const result = parseCourseInfo('MA201');
  assert.equal(result.courseCode, 'MA201');
  assert.equal(result.courseName, 'Mathematics 201');
});

test('parseCsvFile reads sample timetable csv', async () => {
  const csvPath = path.join(__dirname, '../../test/sample_timetable.csv');
  const sessions = await parseCsvFile(csvPath);

  assert.equal(sessions.length, 5);
  assert.ok(sessions.some((s) => s.courseCode === 'CS101'));
  assert.ok(sessions.some((s) => s.courseCode === 'EC401' && s.session === 'AN'));
});

test('buildExtractedCourses marks missing names for review', () => {
  const courses = buildExtractedCourses([
    { courseCode: 'CS101', courseName: 'Computer Science 101' },
    { courseCode: 'XX999', courseName: '' },
  ]);

  assert.equal(courses.length, 2);
  assert.equal(courses.find((c) => c.courseCode === 'CS101').extracted, true);
  assert.equal(courses.find((c) => c.courseCode === 'XX999').extracted, false);
});

test('normalizeSessionsForCommit validates required fields', () => {
  assert.throws(() => {
    normalizeSessionsForCommit([
      {
        date: '2025-06-04T00:00:00.000Z',
        session: 'FN',
        courseCode: 'CS101',
        courseName: '',
        specialization: 'CSE',
        department: 'Department of Computer Science and Engineering',
      },
    ]);
  }, /course code, course name, specialization, and department/);
});

test('normalizeSessionsForCommit accepts complete session rows', () => {
  const normalized = normalizeSessionsForCommit([
    {
      date: '2025-06-04T00:00:00.000Z',
      session: 'FN',
      courseCode: 'CS101',
      courseName: 'Computer Science 101',
      specialization: 'CSE',
      department: 'Department of Computer Science and Engineering',
    },
  ]);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].department, 'Department of Computer Science and Engineering');
});

test('getFileCategory recognizes supported upload types', () => {
  assert.equal(getFileCategory('.xlsx'), 'excel');
  assert.equal(getFileCategory('.csv'), 'csv');
  assert.equal(getFileCategory('.pdf'), 'unsupported');
  assert.equal(getFileCategory('.doc'), 'unsupported');
});
