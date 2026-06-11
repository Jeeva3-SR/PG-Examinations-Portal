const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  findDuplicatesInBatch,
  buildSessionKey,
  inferRescheduleType,
  getUtcDayBounds,
  formatDateKey,
  getSessionDisplayStatus,
  DUPLICATE_MESSAGE,
} = require('../utils/sessionHelpers');

test('buildSessionKey normalizes course code and includes department', () => {
  const key = buildSessionKey('2025-06-04', 'FN', 'cs101', 'Computer Science and Engineering');
  assert.equal(key, '2025-06-04|FN|CS101|Computer Science and Engineering');
});

test('findDuplicatesInBatch detects duplicate rows with department', () => {
  const duplicates = findDuplicatesInBatch([
    {
      date: '2025-06-04T00:00:00.000Z',
      session: 'FN',
      courseCode: 'CS101',
      department: 'Computer Science and Engineering',
    },
    {
      date: '2025-06-04T00:00:00.000Z',
      session: 'FN',
      courseCode: 'CS101',
      department: 'Computer Science and Engineering',
    },
    {
      date: '2025-06-04T00:00:00.000Z',
      session: 'FN',
      courseCode: 'CS101',
      department: 'Mechanical Engineering',
    },
  ]);

  assert.equal(duplicates.length, 1);
});

test('getSessionDisplayStatus prioritizes cancelled and rescheduled', () => {
  assert.equal(getSessionDisplayStatus({ status: 'cancelled', date: '2030-01-01' }), 'cancelled');
  assert.equal(getSessionDisplayStatus({ status: 'active', rescheduleType: 'postpone', date: '2030-01-01' }), 'rescheduled');
});

test('duplicate message mentions department', () => {
  assert.match(DUPLICATE_MESSAGE, /department/i);
});

test('getUtcDayBounds creates full UTC day range', () => {
  const bounds = getUtcDayBounds('2025-06-04');
  assert.equal(bounds.start.toISOString(), '2025-06-04T00:00:00.000Z');
  assert.equal(bounds.end.toISOString(), '2025-06-04T23:59:59.999Z');
  assert.equal(formatDateKey('2025-06-04'), '2025-06-04');
});

test('inferRescheduleType detects prepone and postpone', () => {
  assert.equal(
    inferRescheduleType('2025-06-10T00:00:00.000Z', '2025-06-08T00:00:00.000Z'),
    'prepone'
  );
  assert.equal(
    inferRescheduleType('2025-06-08T00:00:00.000Z', '2025-06-10T00:00:00.000Z'),
    'postpone'
  );
});
