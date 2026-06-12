const Faculty = require('../models/Faculty');
const Session = require('../models/Session');
const ForwardedEvaluationLetter = require('../models/ForwardedEvaluationLetter');
const QPOrder = require('../models/QPOrder');

exports.getLetter = async (req, res) => {
  try {
    const arrearOrders = await QPOrder.find({ type: 'arrear' });
    if (!arrearOrders || arrearOrders.length === 0) {
      return res.status(404).json({ error: 'No arrear QP orders found' });
    }
    const rows = arrearOrders.map(order => {
      return `${order.courseCode.padEnd(8)} ${order.courseName.padEnd(40)} ${order.facultyName.padEnd(25)} ${order.facultyId}`;
    });
    const dynamicRows = rows.filter(row => row !== null).join('\n');
    if (!dynamicRows) {
      return res.status(404).json({ error: 'No valid arrear QP orders found' });
    }
    const letterText = `From\nHead of Department\nDepartment of Computer Science and Engineering\nAnna University\nChennai 600025\n\nTo\nThe ACOE\nAnna University\nChennai 600025\n\nDear Ma'am,\n\nSub: Assignment of evaluators for PG arrear examinations – reg.\n\nKindly assign faculty members to evaluate the PG arrear answer scripts as per the mapping given below:\n\nCourse Code    Course Title                               FacultyName                      FacultyId\n-------------------------------------------------------------------------------\n${dynamicRows}\n\nThank you`;
    res.json({ letterText });
  } catch (error) {
    console.error('Error generating evaluation letter:', error);
    res.status(500).json({ error: 'Failed to generate evaluation letter' });
  }
};

exports.forwardLetter = async (req, res) => {
  try {
    const { letterText } = req.body;
    if (!letterText) return res.status(400).json({ error: 'letterText is required' });
    const forwarded = new ForwardedEvaluationLetter({ letterText });
    await forwarded.save();
    res.status(201).json({ message: 'Evaluation letter forwarded successfully' });
  } catch (error) {
    console.error('Error forwarding evaluation letter:', error);
    res.status(500).json({ error: 'Failed to forward evaluation letter' });
  }
};

exports.getForwardedLetter = async (req, res) => {
  try {
    const latest = await ForwardedEvaluationLetter.findOne({ status: 'pending' }).sort({ forwardedAt: -1 });
    if (!latest) return res.status(404).json({ error: 'No pending evaluation letter found' });
    res.json(latest);
  } catch (error) {
    console.error('Error fetching forwarded evaluation letter:', error);
    res.status(500).json({ error: 'Failed to fetch forwarded evaluation letter' });
  }
};

exports.getLatestLetter = async (req, res) => {
  try {
    const latest = await ForwardedEvaluationLetter.findOne().sort({ forwardedAt: -1 });
    if (!latest) return res.status(404).json({ error: 'No forwarded evaluation letter found' });
    res.json(latest);
  } catch (error) {
    console.error('Error fetching latest evaluation letter:', error);
    res.status(500).json({ error: 'Failed to fetch latest evaluation letter' });
  }
};

exports.approveLetter = async (req, res) => {
  try {
    const letter = await ForwardedEvaluationLetter.findById(req.params.id);
    if (!letter) return res.status(404).json({ error: 'Evaluation letter not found' });
    if (letter.status !== 'pending') return res.status(400).json({ error: 'Letter is not pending and cannot be approved.' });
    letter.status = 'approved';
    letter.letterText += '\n\nApproved by Head of the Department';
    await letter.save();
    res.json({ message: 'Evaluation letter approved successfully' });
  } catch (error) {
    console.error('Error approving evaluation letter:', error);
    res.status(500).json({ error: 'Failed to approve evaluation letter' });
  }
};

exports.rejectLetter = async (req, res) => {
  try {
    const letter = await ForwardedEvaluationLetter.findById(req.params.id);
    if (!letter) return res.status(404).json({ error: 'Evaluation letter not found' });
    if (letter.status !== 'pending') return res.status(400).json({ error: 'Letter is not pending and cannot be rejected.' });
    letter.status = 'rejected';
    await letter.save();
    res.json({ message: 'Evaluation letter rejected successfully' });
  } catch (error) {
    console.error('Error rejecting evaluation letter:', error);
    res.status(500).json({ error: 'Failed to reject evaluation letter' });
  }
};
