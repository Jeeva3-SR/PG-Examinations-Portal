const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const Duty = require('../models/Duty');
const AdvanceClaim = require('../models/AdvanceClaim');
const Session = require('../models/Session');
const ForwardedAdvanceClaim = require('../models/ForwardedAdvanceClaim');
const AssignedQPSetter = require('../models/AssignedQPSetter');
const CompletedDuty = require('../models/CompletedDuty');
const QPOrder = require('../models/QPOrder');

/**
 * @openapi
 * /api/claims:
 *   get:
 *     summary: Get all claims
 *     responses:
 *       200:
 *         description: Array of claims
 */
// Get all claims
router.get('/', async (req, res) => {
  try {
    const claims = await Claim.find()
      .sort({ claimDate: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/claims:
 *   post:
 *     summary: Create a new claim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               claimId:
 *                 type: string
 *               facultyId:
 *                 type: string
 *               facultyName:
 *                 type: string
 *               dutyType:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created claim
 */
// Add a new claim
router.post('/', async (req, res) => {
  try {
    const { claimId, facultyId, facultyName, dutyType, amount, status } = req.body;
    if (
      !claimId || !facultyId || !facultyName || !dutyType ||
      typeof amount !== 'number' || amount < 0 ||
      !['Signed Off'].includes(status)
    ) {
      return res.status(400).json({ message: 'Invalid data' });
    }
    const existing = await Claim.findOne({ claimId });
    if (existing) {
      return res.status(400).json({ message: 'Claim already exists' });
    }
    const newClaim = new Claim({ claimId, facultyId, facultyName, dutyType, amount, status });
    await newClaim.save();
    res.status(201).json(newClaim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: 'Server error while creating claim.' });
  }
});

/**
 * @openapi
 * /api/claims/{id}:
 *   patch:
 *     summary: Update a claim
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated claim
 */
// Update a claim
router.patch('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    Object.keys(req.body).forEach(key => {
      claim[key] = req.body[key];
    });

    const updatedClaim = await claim.save();
    res.json(updatedClaim);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/claims/{id}:
 *   delete:
 *     summary: Delete a claim
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
// Delete a claim
router.delete('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    await claim.remove();
    res.json({ message: 'Claim deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/claims/generate:
 *   post:
 *     summary: Generate claims from completed duties in a date range
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Claims generated
 */
// Generate claims from duties
router.post('/generate', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const duties = await Duty.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: 'Completed',
    });

    // Group duties by invigilator
    const dutiesByInvigilator = duties.reduce((acc, duty) => {
      const key = duty.invigilator.employeeId;
      if (!acc[key]) {
        acc[key] = {
          facultyName: duty.invigilator.name,
          department: duty.invigilator.department,
          employeeId: duty.invigilator.employeeId,
          sessions: [],
        };
      }
      acc[key].sessions.push({
        date: duty.date,
        session: duty.session,
        courseCode: duty.courseCode,
        room: duty.room,
      });
      return acc;
    }, {});

    // Create claims
    const claims = Object.values(dutiesByInvigilator).map(invigilator => {
      const sessionCount = invigilator.sessions.length;
      const amount = sessionCount * 500; // ₹500 per session

      return new Claim({
        facultyName: invigilator.facultyName,
        department: invigilator.department,
        employeeId: invigilator.employeeId,
        dutyType: 'Invigilation',
        amount,
        sessions: invigilator.sessions,
        status: 'Pending',
      });
    });

    await Claim.insertMany(claims);
    res.status(201).json({ message: 'Claims generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/claims/faculty/{employeeId}:
 *   get:
 *     summary: Get claims by faculty employeeId
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of claims
 */
// Get claims by faculty
router.get('/faculty/:employeeId', async (req, res) => {
  try {
    const claims = await Claim.find({ employeeId: req.params.employeeId })
      .sort({ claimDate: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/claims/advance-details:
 *   get:
 *     summary: Get latest advance claim details
 *     responses:
 *       200:
 *         description: Advance details
 */
router.get('/advance-details', async (req, res) => {
    try {
        // Fetch the latest advance claim amount
        const latestClaim = await AdvanceClaim.findOne().sort({ createdAt: -1 });
        if (!latestClaim) {
            return res.status(404).json({ message: 'No advance claim records found.' });
        }
        const totalAmount = latestClaim.totalAmount;

        // Fetch the latest session to determine the exam month and year
        const latestSession = await Session.findOne().sort({ date: -1 });
        if (!latestSession) {
            return res.status(404).json({ message: 'No session records found.' });
        }
        
        // Format the date
        const date = new Date(latestSession.date);
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const year = date.getFullYear();

        const allMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthIndex = date.getMonth();

        let formattedMonthYear;
        //This logic is based on common exam periods
        if (monthIndex >= 3 && monthIndex <= 5) { // Apr, May, Jun
            formattedMonthYear = `APR/MAY ${year}`;
        } else if (monthIndex >= 10 && monthIndex <= 12) { // Nov, Dec, Jan
            formattedMonthYear = `NOV/DEC ${year}`;
        } else {
            formattedMonthYear = `${allMonths[monthIndex]} ${year}`;
        }


        res.json({ totalAmount, formattedMonthYear });
    } catch (error) {
        console.error('Error fetching advance details:', error);
        res.status(500).json({ message: 'Server error while fetching advance details.' });
    }
});

/**
 * @openapi
 * /api/claims/forward-advance-letter:
 *   post:
 *     summary: Forward advance claim letter data
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalAmount:
 *                 type: number
 *               formattedMonthYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Letter forwarded
 */
// POST: Forward advance claim letter data
router.post('/forward-advance-letter', async (req, res) => {
    try {
        const { totalAmount, formattedMonthYear } = req.body;
        if (typeof totalAmount !== 'number' || !formattedMonthYear) {
            return res.status(400).json({ message: 'Invalid data' });
        }
        const forwarded = new ForwardedAdvanceClaim({ totalAmount, formattedMonthYear });
        await forwarded.save();
        res.status(201).json({ message: 'Letter forwarded successfully' });
    } catch (error) {
        console.error('Error forwarding advance claim letter:', error);
        res.status(500).json({ message: 'Server error while forwarding letter.' });
    }
});

/**
 * @openapi
 * /api/claims/forwarded-advance-letter:
 *   get:
 *     summary: Get latest forwarded advance claim letter
 *     responses:
 *       200:
 *         description: Forwarded letter
 */
// GET: Latest forwarded advance claim letter
router.get('/forwarded-advance-letter', async (req, res) => {
    try {
        const latest = await ForwardedAdvanceClaim.findOne().sort({ forwardedAt: -1 });
        if (!latest) {
            return res.status(404).json({ message: 'No forwarded letter found.' });
        }
        res.json({ totalAmount: latest.totalAmount, formattedMonthYear: latest.formattedMonthYear });
    } catch (error) {
        console.error('Error fetching forwarded advance claim letter:', error);
        res.status(500).json({ message: 'Server error while fetching forwarded letter.' });
    }
});

/**
 * @openapi
 * /api/claims/all:
 *   get:
 *     summary: Aggregated claim items across sources
 *     responses:
 *       200:
 *         description: Aggregated claims
 */
// GET /api/claims/all
router.get('/all', async (req, res) => {
  try {
    // QP Setting claims
    const qpSetters = await AssignedQPSetter.find({});
    const qpSetterClaims = qpSetters.map(d => ({
      claimId: `QP-${d._id}`,
      facultyId: d.facultyId,
      facultyName: d.facultyName,
      dutyType: 'QP Setting',
      amount: null,
      status: 'Pending',
    }));

    // Invigilation claims
    const completedDuties = await CompletedDuty.find({ status: 'completed' });
    const invigilationClaims = completedDuties.map(d => ({
      claimId: `INV-${d._id}`,
      facultyId: d.facultyId,
      facultyName: d.facultyName,
      dutyType: 'Invigilation',
      amount: null,
      status: 'Pending',
    }));

    // Evaluation (Arrear) claims
    const arrearQPs = await QPOrder.find({ type: 'arrear' });
    const evaluationClaims = arrearQPs.map(d => ({
      claimId: `EV-${d._id}`,
      facultyId: d.facultyId,
      facultyName: d.facultyName,
      dutyType: 'Evaluation (Arrear)',
      amount: null,
      status: 'Pending',
    }));

    // Merge all
    const allClaims = [...qpSetterClaims, ...invigilationClaims, ...evaluationClaims];
    res.json(allClaims);
  } catch (error) {
    console.error('Error fetching all claims:', error);
    res.status(500).json({ message: 'Server error while fetching all claims.' });
  }
});

/**
 * @openapi
 * /api/claims/{claimId}:
 *   patch:
 *     summary: Update or upsert a claim by claimId
 *     parameters:
 *       - name: claimId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated claim
 */
// PATCH /api/claims/:claimId
router.patch('/:claimId', async (req, res) => {
  try {
    const { facultyId, facultyName, dutyType, amount, status } = req.body;
    if (
      !facultyId || !facultyName || !dutyType ||
      typeof amount !== 'number' || amount < 0 ||
      !['Signed Off'].includes(status)
    ) {
      return res.status(400).json({ message: 'Invalid data' });
    }
    const updated = await Claim.findOneAndUpdate(
      { claimId: req.params.claimId },
      {
        claimId: req.params.claimId,
        facultyId,
        facultyName,
        dutyType,
        amount,
        status
      },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ message: 'Server error while updating claim.' });
  }
});

/**
 * @openapi
 * /api/claims/advance:
 *   get:
 *     summary: Get total from the latest advance claim
 *     responses:
 *       200:
 *         description: Latest advance amount
 */
// GET: The total from the latest advance claim
router.get('/advance', async (req, res) => {
  try {
    const AdvanceClaim = require('../models/AdvanceClaim');
    const latestClaim = await AdvanceClaim.findOne().sort({ createdAt: -1 });
    if (!latestClaim) {
      return res.status(404).json({ message: 'No advance claim found.' });
    }
    res.json({ totalAmount: latestClaim.totalAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching advance claim.' });
  }
});

module.exports = router; 