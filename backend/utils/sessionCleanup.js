const StudentInput = require('../models/StudentInput');
const SeatingArrangement = require('../models/SeatingArrangement');
const Duty = require('../models/Duty');
const { formatDateKey, getUtcDayBounds } = require('./sessionHelpers');

async function getSessionDeleteImpact(sessionDoc) {
  const studentInputs = await StudentInput.find({ sessionRef: sessionDoc._id });
  const entryIds = studentInputs.map((si) => si._id);
  const { start, end } = getUtcDayBounds(sessionDoc.date);

  const seatingCount = await SeatingArrangement.countDocuments(
    entryIds.length > 0
      ? {
          $or: [
            { entryRef: { $in: entryIds } },
            {
              courseCode: sessionDoc.courseCode,
              session: sessionDoc.session,
              date: { $gte: start, $lte: end },
            },
          ],
        }
      : {
          courseCode: sessionDoc.courseCode,
          session: sessionDoc.session,
          date: { $gte: start, $lte: end },
        }
  );

  const dateKey = formatDateKey(sessionDoc.date);
  const dutyCount = await Duty.countDocuments({
    date: dateKey,
    session: sessionDoc.session,
  });

  const hasStudents = studentInputs.length > 0;
  const hasSeating = seatingCount > 0;
  const hasDuties = dutyCount > 0;

  return {
    hasStudents,
    hasSeating,
    hasDuties,
    hasAllocations: hasSeating || hasDuties,
    studentInputCount: studentInputs.length,
    seatingCount,
    dutyCount,
  };
}

async function cleanupSessionRelatedData(sessionDoc) {
  const impact = await getSessionDeleteImpact(sessionDoc);
  const studentInputs = await StudentInput.find({ sessionRef: sessionDoc._id });
  const entryIds = studentInputs.map((si) => si._id);
  const { start, end } = getUtcDayBounds(sessionDoc.date);
  const dateKey = formatDateKey(sessionDoc.date);

  let seatingDeleted = 0;
  if (entryIds.length > 0) {
    const byEntry = await SeatingArrangement.deleteMany({ entryRef: { $in: entryIds } });
    seatingDeleted += byEntry.deletedCount;
  }

  const byCourse = await SeatingArrangement.deleteMany({
    courseCode: sessionDoc.courseCode,
    session: sessionDoc.session,
    date: { $gte: start, $lte: end },
  });
  seatingDeleted += byCourse.deletedCount;

  let dutiesDeleted = 0;
  if (impact.hasSeating || impact.hasDuties) {
    const dutyResult = await Duty.deleteMany({
      date: dateKey,
      session: sessionDoc.session,
    });
    dutiesDeleted = dutyResult.deletedCount;
  }

  return {
    studentInputsPreserved: studentInputs.length,
    seatingDeleted,
    dutiesDeleted,
  };
}

module.exports = {
  getSessionDeleteImpact,
  cleanupSessionRelatedData,
};
