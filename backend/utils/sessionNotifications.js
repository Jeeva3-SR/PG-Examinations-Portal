const Duty = require('../models/Duty');
const Faculty = require('../models/Course');
const AssignedQPSetter = require('../models/AssignedQPSetter');
const SubjectAssignment = require('../models/SubjectAssignment');
const sendEmail = require('./email');

function formatDateKey(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { timeZone: 'UTC' });
}

async function getFacultyContacts(facultyIds) {
  const uniqueIds = [...new Set(facultyIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const facultyList = await Faculty.find({ facultyId: { $in: uniqueIds } });
  return facultyList.map((f) => ({
    facultyId: f.facultyId,
    name: f.name,
    email: f.email,
  }));
}

async function getAssignedPeopleForSession(sessionDoc) {
  const dateKey = formatDateKey(sessionDoc.date);
  const duties = await Duty.find({ date: dateKey, session: sessionDoc.session });
  const dutyFacultyIds = duties.map((d) => d.facultyId);

  const qpSetters = await AssignedQPSetter.find({
    $or: [
      { subject: sessionDoc.courseCode },
      { subject: sessionDoc.courseName },
    ],
  });
  const qpFacultyIds = qpSetters.map((q) => q.facultyId);

  const subjectAssignments = await SubjectAssignment.find({ courseCode: sessionDoc.courseCode });
  const assignmentFacultyIds = subjectAssignments.map((s) => s.facultyId);

  return getFacultyContacts([...dutyFacultyIds, ...qpFacultyIds, ...assignmentFacultyIds]);
}

async function notifyAssignedPeople({ session, type, details = {} }) {
  const recipients = await getAssignedPeopleForSession(session);

  if (recipients.length === 0) {
    console.log(`[SESSION NOTIFY] No assigned people found for ${session.courseCode} on ${formatDateKey(session.date)} ${session.session}`);
    return { notified: 0, recipients: 0 };
  }

  let subject = '';
  let message = '';

  if (type === 'deleted' || type === 'cancelled') {
    subject = `Exam Session Cancelled: ${session.courseCode}`;
    message = [
      'Dear Faculty,',
      '',
      'The examination session below has been CANCELLED:',
      `Course: ${session.courseCode} - ${session.courseName}`,
      `Date: ${formatDisplayDate(session.date)} (${session.session})`,
      `Department: ${session.department || 'N/A'}`,
      `Specialization: ${session.specialization}`,
      details.cancelReason ? `Reason: ${details.cancelReason}` : '',
      '',
      'Please check the PG Examinations Portal for updates.',
      '',
      'PG Examinations Portal',
    ].filter(Boolean).join('\n');
  } else if (type === 'rescheduled') {
    const {
      oldDate,
      oldSession,
      rescheduleType,
      rescheduleReason,
      newDate,
      newSession,
    } = details;
    const actionLabel = rescheduleType === 'prepone' ? 'PRE-PONED' : 'POSTPONED';
    subject = `Exam Session ${actionLabel}: ${session.courseCode}`;
    message = [
      'Dear Faculty,',
      '',
      `The examination session below has been ${actionLabel}:`,
      `Course: ${session.courseCode} - ${session.courseName}`,
      `Previous schedule: ${formatDisplayDate(oldDate)} (${oldSession})`,
      `New schedule: ${formatDisplayDate(newDate)} (${newSession})`,
      `Department: ${session.department || 'N/A'}`,
      `Reason: ${rescheduleReason}`,
      '',
      'Please check the PG Examinations Portal for updates.',
      '',
      'PG Examinations Portal',
    ].join('\n');
  }

  let notified = 0;
  for (const person of recipients) {
    try {
      await sendEmail({
        email: person.email,
        subject,
        message,
      });
      notified += 1;
    } catch (err) {
      console.error(`[SESSION NOTIFY] Failed to notify ${person.email}:`, err.message);
    }
  }

  return { notified, recipients: recipients.length };
}

module.exports = {
  formatDateKey,
  getAssignedPeopleForSession,
  notifyAssignedPeople,
};
