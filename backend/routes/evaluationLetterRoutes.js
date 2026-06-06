const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Session = require('../models/Session');
const ForwardedEvaluationLetter = require('../models/ForwardedEvaluationLetter');
const QPOrder = require('../models/QPOrder');

// Generate Evaluation Letter
router.get('/', async (req, res) => {
  try {
    // Fetch all QPOrders of type 'arrear'
    const arrearOrders = await QPOrder.find({ type: 'arrear' });
    if (!arrearOrders || arrearOrders.length === 0) {
      return res.status(404).json({ error: 'No arrear QP orders found' });
    }
    // Create rows for each arrear order
    const rows = arrearOrders.map(order => {
      return `${order.courseCode.padEnd(8)} ${order.courseName.padEnd(40)} ${order.facultyName.padEnd(25)} ${order.facultyId}`;
    });
    // Filter out any null rows and join with newlines
    const dynamicRows = rows.filter(row => row !== null).join('\n');
    if (!dynamicRows) {
      return res.status(404).json({ error: 'No valid arrear QP orders found' });
    }
    // Create the letter template
    const letterText = `From
Head of Department
Department of Computer Science and Engineering
Anna University
Chennai 600025

To
The ACOE
Anna University
Chennai 600025

Dear Ma'am,

Sub: Assignment of evaluators for PG arrear examinations – reg.

Kindly assign faculty members to evaluate the PG arrear answer scripts as per the mapping given below:

Course Code    Course Title                               FacultyName                      FacultyId
-------------------------------------------------------------------------------
${dynamicRows}

Thank you`;
    res.json({ letterText });
  } catch (error) {
    console.error('Error generating evaluation letter:', error);
    res.status(500).json({ error: 'Failed to generate evaluation letter' });
  }
});

// POST /api/evaluation-letter/forward - Forward the evaluation letter
router.post('/forward', async (req, res) => {
  try {
    const { letterText } = req.body;
    if (!letterText) {
      return res.status(400).json({ error: 'letterText is required' });
    }
    const forwarded = new ForwardedEvaluationLetter({ letterText });
    await forwarded.save();
    res.status(201).json({ message: 'Evaluation letter forwarded successfully' });
  } catch (error) {
    console.error('Error forwarding evaluation letter:', error);
    res.status(500).json({ error: 'Failed to forward evaluation letter' });
  }
});

// GET /api/evaluation-letter/forwarded - Get the latest forwarded evaluation letter
router.get('/forwarded', async (req, res) => {
  try {
    const latest = await ForwardedEvaluationLetter.findOne({ status: 'pending' }).sort({ forwardedAt: -1 });
    if (!latest) {
      return res.status(404).json({ error: 'No pending evaluation letter found' });
    }
    res.json(latest); // Return the full object, including _id
  } catch (error) {
    console.error('Error fetching forwarded evaluation letter:', error);
    res.status(500).json({ error: 'Failed to fetch forwarded evaluation letter' });
  }
});

// GET /api/evaluation-letter/latest - Get the very latest forwarded evaluation letter regardless of status
router.get('/latest', async (req, res) => {
  try {
    const latest = await ForwardedEvaluationLetter.findOne().sort({ forwardedAt: -1 });
    if (!latest) {
      return res.status(404).json({ error: 'No forwarded evaluation letter found' });
    }
    res.json(latest);
  } catch (error) {
    console.error('Error fetching latest evaluation letter:', error);
    res.status(500).json({ error: 'Failed to fetch latest evaluation letter' });
  }
});

// PUT /api/evaluation-letter/:id/approve - Approve a specific evaluation letter
router.put('/:id/approve', async (req, res) => {
  try {
    const letter = await ForwardedEvaluationLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Evaluation letter not found' });
    }
    if (letter.status !== 'pending') {
      return res.status(400).json({ error: 'Letter is not pending and cannot be approved.'});
    }
    letter.status = 'approved';
    letter.letterText += '\n\nApproved by Head of the Department';
    await letter.save();
    res.json({ message: 'Evaluation letter approved successfully' });
  } catch (error) {
    console.error('Error approving evaluation letter:', error);
    res.status(500).json({ error: 'Failed to approve evaluation letter' });
  }
});

// PUT /api/evaluation-letter/:id/reject - Reject a specific evaluation letter
router.put('/:id/reject', async (req, res) => {
  try {
    const letter = await ForwardedEvaluationLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Evaluation letter not found' });
    }
     if (letter.status !== 'pending') {
      return res.status(400).json({ error: 'Letter is not pending and cannot be rejected.'});
    }
    letter.status = 'rejected';
    await letter.save();
    res.json({ message: 'Evaluation letter rejected successfully' });
  } catch (error) {
    console.error('Error rejecting evaluation letter:', error);
    res.status(500).json({ error: 'Failed to reject evaluation letter' });
  }
});

module.exports = router; 