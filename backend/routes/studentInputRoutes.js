const express = require('express');
const router = express.Router();
const StudentInput = require('../models/StudentInput');

// Get all student inputs
router.get('/', async (req, res) => {
  try {
    const studentInputs = await StudentInput.find()
      .sort({ date: 1, session: 1 });
    res.json(studentInputs);
  } catch (error) {
    console.error('Error fetching student inputs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new student input
router.post('/', async (req, res) => {
  try {
    console.log('Received student input data:', req.body);

    // Validate only the non-count required fields
    const requiredFields = [
      'specialization',
      'courseCode',
      'courseName',
      'date',
      'session',
    ];

    // Use a helper to check for missing values (0 is valid)
    const isMissing = value => value === undefined || value === null || value === '';
    const missingFields = requiredFields.filter(field => isMissing(req.body[field]));
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Convert date string to Date object if it's a string
    let date;
    try {
      date = typeof req.body.date === 'string' ? new Date(req.body.date) : req.body.date;
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid date format. Please provide a valid date.'
      });
    }

    // Parse student counts, allowing 0 as a valid value
    const parseCount = (value) => {
      if (value === null || value === undefined || value === '') {
        return 0;
      }
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const cegRegular = parseCount(req.body.cegRegular);
    const cegArrear = parseCount(req.body.cegArrear);
    const mitRegular = parseCount(req.body.mitRegular);
    const mitArrear = parseCount(req.body.mitArrear);

    // Calculate totals
    const totalRegular = cegRegular + mitRegular;
    const totalArrear = cegArrear + mitArrear;
    const total = totalRegular + totalArrear;
    const totalCEG = cegRegular + cegArrear;
    const totalMIT = mitRegular + mitArrear;

    // Create new student input
    const studentInput = new StudentInput({
      specialization: req.body.specialization,
      courseCode: req.body.courseCode,
      courseName: req.body.courseName,
      cegRegular,
      cegArrear,
      mitRegular,
      mitArrear,
      totalRegular,
      totalArrear,
      total,
      totalCEG,
      totalMIT,
      date,
      session: req.body.session
    });

    console.log('Creating student input:', studentInput);

    const savedInput = await studentInput.save();
    console.log('Student input saved successfully:', savedInput);
    res.status(201).json(savedInput);
  } catch (error) {
    console.error('Error saving student input:', error);
    res.status(400).json({
      message: error.message,
      details: error.errors || 'Validation failed'
    });
  }
});

// Get student inputs by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentInputs = await StudentInput.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1, session: 1 });
    res.json(studentInputs);
  } catch (error) {
    console.error('Error fetching student inputs by range:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get student inputs by specialization
router.get('/specialization/:specialization', async (req, res) => {
  try {
    const studentInputs = await StudentInput.find({
      specialization: req.params.specialization
    }).sort({ date: 1, session: 1 });
    res.json(studentInputs);
  } catch (error) {
    console.error('Error fetching student inputs by specialization:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update student input
router.put('/:id', async (req, res) => {
  try {
    const updatedInput = await StudentInput.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedInput) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json(updatedInput);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student input
router.delete('/:id', async (req, res) => {
  try {
    const studentInput = await StudentInput.findById(req.params.id);
    if (!studentInput) {
      return res.status(404).json({ message: 'Student input not found' });
    }

    await studentInput.deleteOne();
    res.json({ message: 'Student input deleted' });
  } catch (error) {
    console.error('Error deleting student input:', error);
    res.status(500).json({ message: 'Failed to delete student input' });
  }
});

// GET /api/student-inputs/specialization-summary - Aggregate student counts by specialization
router.get('/specialization-summary', async (req, res) => {
  try {
    const results = await StudentInput.aggregate([
      {
        $facet: {
          bySpecialization: [
            {
              $match: {
                specialization: {
                  $in: [
                    "M.E. Computer Science and Engineering",
                    "M.E. Software Engineering",
                    "M.E. CSE (Specialization in Big Data Analytics)",
                    "M.E. Computer Science and Engineering (OR)",
                    "Ph. D"
                  ]
                }
              }
            },
            {
              $group: {
                _id: "$specialization",
                totalSheets: { $sum: { $add: ["$cegRegular", "$cegArrear"] } }
              }
            }
          ],
          totalArrear: [
            {
              $group: {
                _id: null,
                totalArrearSheets: { $sum: "$cegArrear" }
              }
            }
          ]
        }
      }
    ]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch specialization summary', error: error.message });
  }
});

// GET: The total number of CEG students
router.get('/total-ceg', async (req, res) => {
  try {
    const result = await StudentInput.aggregate([
      {
        $group: {
          _id: null,
          totalCeg: { $sum: "$totalCEG" }
        }
      }
    ]);
    res.json({ totalCeg: result[0]?.totalCeg || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching total CEG students.' });
  }
});

module.exports = router; 