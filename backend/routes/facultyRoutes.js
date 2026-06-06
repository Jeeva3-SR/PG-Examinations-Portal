const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Duty = require('../models/Duty');

// Get all faculty members or a random sample
router.get('/', async (req, res) => {
  const { limit, date, session, excludeIds } = req.query;
  try {
    let faculties;
    if (limit) {
        const count = parseInt(limit, 10);
        if (isNaN(count) || count <= 0) {
            return res.status(400).json({ message: 'Invalid limit parameter' });
        }

        const aggregationPipeline = [];
        
        let allExcludedIds = [];

        // If date and session are provided, find and exclude faculty already assigned in the DB
        if (date && session) {
            const queryDate = new Date(date).toISOString().split('T')[0];
            const busyFaculty = await Duty.find({ date: queryDate, session }).select('facultyId -_id');
            const busyFacultyIds = busyFaculty.map(f => f.facultyId);
            allExcludedIds.push(...busyFacultyIds);
        }
        
        // Exclude faculty already in the current proposed list on the frontend
        if (excludeIds) {
            allExcludedIds.push(...excludeIds.split(','));
        }

        if (allExcludedIds.length > 0) {
            aggregationPipeline.push({ $match: { facultyId: { $nin: allExcludedIds } } });
        }
        
        aggregationPipeline.push({ $sample: { size: count } });
        
        faculties = await Faculty.aggregate(aggregationPipeline);

    } else {
        faculties = await Faculty.find().sort({ name: 1 });
    }
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by ID
router.get('/:facultyId', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ facultyId: req.params.facultyId });
    if (!faculty) {
      return res.status(404).json({ error: 'Invalid Faculty ID' });
    }
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new faculty member
router.post('/', async (req, res) => {
  const faculty = new Faculty({
    name: req.body.name,
    employeeId: req.body.employeeId,
    department: req.body.department,
    email: req.body.email,
    phone: req.body.phone,
    specialization: req.body.specialization,
    isAvailable: req.body.isAvailable,
    maxDutiesPerDay: req.body.maxDutiesPerDay,
    maxDutiesPerWeek: req.body.maxDutiesPerWeek
  });

  try {
    const newFaculty = await faculty.save();
    res.status(201).json(newFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update faculty member
router.put('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    Object.assign(faculty, req.body);
    const updatedFaculty = await faculty.save();
    res.json(updatedFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update faculty by facultyId
router.put('/:facultyId', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ facultyId: req.params.facultyId });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }
    Object.assign(faculty, req.body);
    const updatedFaculty = await faculty.save();
    res.json(updatedFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upsert (create or update) faculty profile by facultyId
router.post('/update-profile', async (req, res) => {
  try {
    const { facultyId, ...rest } = req.body;
    if (!facultyId) {
      return res.status(400).json({ message: 'facultyId is required' });
    }
    const updated = await Faculty.findOneAndUpdate(
      { facultyId },
      { $set: { facultyId, ...rest } },
      { upsert: true, new: true }
    );
    res.json({ message: 'Profile updated successfully', faculty: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete faculty member
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    await faculty.deleteOne();
    res.json({ message: 'Faculty member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by department
router.get('/department/:department', async (req, res) => {
  try {
    const faculty = await Faculty.find({ department: req.params.department }).sort({ name: 1 });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by specialization
router.get('/specialization/:specialization', async (req, res) => {
  try {
    const faculty = await Faculty.find({ specialization: req.params.specialization }).sort({ name: 1 });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update faculty availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    faculty.isAvailable = req.body.isAvailable;
    const updatedFaculty = await faculty.save();
    res.json(updatedFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;