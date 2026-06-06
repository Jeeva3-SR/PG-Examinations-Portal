const express = require('express');
const router = express.Router();
const StudentInput = require('../models/StudentInput');
const Session = require('../models/Session');
const AdvanceClaim = require('../models/AdvanceClaim');
const ForwardedAdvanceRequisitionLetter = require('../models/ForwardedAdvanceRequisitionLetter');
const moment = require('moment');

// @route   GET /api/letters/advance-claim
// @desc    Get data for the advance claim letter and save it
// @access  Private (should be protected)
router.get('/advance-claim', async (req, res) => {
  try {
    // 1. Other Expenses Data
    const otherExpensesData = await StudentInput.aggregate([
      {
        $group: {
          _id: null,
          totalRegistered: {
            $sum: {
              $cond: {
                if: { $eq: ['$specialization', 'Ph. D'] },
                then: '$totalCEG',
                else: '$cegArrear',
              },
            },
          },
        },
      },
    ]);
    const totalRegistered = otherExpensesData.length > 0 ? otherExpensesData[0].totalRegistered : 0;
    const otherExpensesAmount = totalRegistered * 4;

    // 2. Misc. Expenses Data
    const sessionCount = await Session.countDocuments();
    const miscExpensesAmount = sessionCount * 250;

    // 3. External Examiner (Thesis + Viva) Data
    const thesisVivaData = await StudentInput.aggregate([
      { $group: { _id: null, totalCandidates: { $sum: '$totalCEG' } } },
    ]);
    const thesisVivaCandidates = thesisVivaData.length > 0 ? thesisVivaData[0].totalCandidates : 0;
    const thesisVivaAmount = thesisVivaCandidates * (150 + 100); // 150 for thesis, 100 for viva

    // 4. External Examiner TA/DA Data
    const taDaSessions = await StudentInput.countDocuments();
    const taDaAmount = taDaSessions * 1500;

    // 5. Total Amount
    const totalAmount = otherExpensesAmount + miscExpensesAmount + thesisVivaAmount + taDaAmount;

    // Save the new advance claim to the database
    const newAdvanceClaim = new AdvanceClaim({
      totalAmount,
      details: {
        otherExpensesAmount,
        miscExpensesAmount,
        thesisVivaAmount,
        taDaAmount,
      }
    });
    await newAdvanceClaim.save();

    res.json({
      date: moment().format('DD.MM.YYYY'),
      totalRegistered,
      otherExpensesAmount,
      sessionCount,
      miscExpensesAmount,
      thesisVivaCandidates,
      thesisVivaAmount,
      taDaSessions,
      taDaAmount,
      totalAmount,
    });

  } catch (error) {
    console.error('Error fetching advance claim data:', error);
    res.status(500).send('Server Error');
  }
});

// POST /api/letters/advance-requisition/forward - Forward the advance requisition letter
router.post('/advance-requisition/forward', async (req, res) => {
  try {
    const { letterText } = req.body;
    if (!letterText) {
      return res.status(400).json({ error: 'letterText is required' });
    }
    const forwarded = new ForwardedAdvanceRequisitionLetter({ letterText });
    await forwarded.save();
    res.status(201).json({ message: 'Advance requisition letter forwarded successfully' });
  } catch (error) {
    console.error('Error forwarding advance requisition letter:', error);
    res.status(500).json({ error: 'Failed to forward advance requisition letter' });
  }
});

// GET /api/letters/advance-requisition/forwarded - Get the latest forwarded advance requisition letter
router.get('/advance-requisition/forwarded', async (req, res) => {
  try {
    const latest = await ForwardedAdvanceRequisitionLetter.findOne({ status: 'pending' }).sort({ forwardedAt: -1 });
    if (!latest) {
      return res.status(404).json({ error: 'No pending advance requisition letter found' });
    }
    res.json(latest);
  } catch (error) {
    console.error('Error fetching forwarded advance requisition letter:', error);
    res.status(500).json({ error: 'Failed to fetch forwarded advance requisition letter' });
  }
});

// GET /api/letters/advance-requisition/latest - Get the very latest letter
router.get('/advance-requisition/latest', async (req, res) => {
  try {
    const latest = await ForwardedAdvanceRequisitionLetter.findOne().sort({ forwardedAt: -1 });
    if (!latest) {
      return res.status(404).json({ error: 'No forwarded advance requisition letter found' });
    }
    res.json(latest);
  } catch (error) {
    console.error('Error fetching latest advance requisition letter:', error);
    res.status(500).json({ error: 'Failed to fetch latest advance requisition letter' });
  }
});

// PUT /api/letters/advance-requisition/:id/approve - Approve latest letter
router.put('/advance-requisition/:id/approve', async (req, res) => {
  try {
    const letter = await ForwardedAdvanceRequisitionLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Advance requisition letter not found.' });
    }
    if (letter.status !== 'pending') {
      return res.status(400).json({ error: 'Letter is not pending and cannot be approved.' });
    }
    letter.status = 'approved';
    letter.letterText += '\n\nApproved by Head of the Department';
    await letter.save();
    res.json({ message: 'Letter approved successfully.' });
  } catch (error) {
    console.error('Error approving letter:', error);
    res.status(500).json({ error: 'Failed to approve letter.' });
  }
});

// PUT /api/letters/advance-requisition/:id/reject - Reject latest letter
router.put('/advance-requisition/:id/reject', async (req, res) => {
  try {
    const letter = await ForwardedAdvanceRequisitionLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Advance requisition letter not found.' });
    }
    if (letter.status !== 'pending') {
      return res.status(400).json({ error: 'Letter is not pending and cannot be rejected.' });
    }
    letter.status = 'rejected';
    await letter.save();
    res.json({ message: 'Letter rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting letter:', error);
    res.status(500).json({ error: 'Failed to reject letter.' });
  }
});

module.exports = router; 