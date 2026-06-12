const StudentInput = require('../models/StudentInput');

exports.getAllInputs = async (req, res) => {
  try {
    const studentInputs = await StudentInput.find().sort({ date: 1, session: 1 });
    res.json(studentInputs);
  } catch (error) {
    console.error('Error fetching student inputs:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.addInput = async (req, res) => {
  try {
    console.log('Received student input data:', req.body);

    const requiredFields = ['specialization', 'courseCode', 'courseName', 'date', 'session'];
    const isMissing = value => value === undefined || value === null || value === '';
    const missingFields = requiredFields.filter(field => isMissing(req.body[field]));
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    let date;
    try {
      date = typeof req.body.date === 'string' ? new Date(req.body.date) : req.body.date;
      if (isNaN(date.getTime())) throw new Error('Invalid date format');
    } catch (error) {
      return res.status(400).json({ message: 'Invalid date format. Please provide a valid date.' });
    }

    const parseCount = (value) => {
      if (value === null || value === undefined || value === '') return 0;
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const cegRegular = parseCount(req.body.cegRegular);
    const cegArrear = parseCount(req.body.cegArrear);
    const mitRegular = parseCount(req.body.mitRegular);
    const mitArrear = parseCount(req.body.mitArrear);

    const totalRegular = cegRegular + mitRegular;
    const totalArrear = cegArrear + mitArrear;
    const total = totalRegular + totalArrear;
    const totalCEG = cegRegular + cegArrear;
    const totalMIT = mitRegular + mitArrear;

    const studentInput = new StudentInput({
      specialization: req.body.specialization,
      courseCode: req.body.courseCode,
      courseName: req.body.courseName,
      cegRegular, cegArrear, mitRegular, mitArrear,
      totalRegular, totalArrear, total, totalCEG, totalMIT,
      date, session: req.body.session
    });

    console.log('Creating student input:', studentInput);
    const savedInput = await studentInput.save();
    console.log('Student input saved successfully:', savedInput);
    res.status(201).json(savedInput);
  } catch (error) {
    console.error('Error saving student input:', error);
    res.status(400).json({ message: error.message, details: error.errors || 'Validation failed' });
  }
};

exports.getInputsByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const studentInputs = await StudentInput.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ date: 1, session: 1 });
    res.json(studentInputs);
  } catch (error) {
    console.error('Error fetching student inputs by range:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getInputBySession = async (req, res) => {
  try {
    const Session = require('../models/Session');
    let entry = await StudentInput.findOne({ sessionRef: req.params.sessionId });
    if (entry) return res.json(entry);

    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.json(null);

    entry = await StudentInput.findOne({
      courseCode: session.courseCode,
      specialization: session.specialization,
      date: session.date,
      session: session.session
    });

    if (entry) {
      entry.sessionRef = req.params.sessionId;
      await entry.save();
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInputsBySpecialization = async (req, res) => {
  try {
    const studentInputs = await StudentInput.find({
      specialization: req.params.specialization
    }).sort({ date: 1, session: 1 });
    res.json(studentInputs);
  } catch (error) {
    console.error('Error fetching student inputs by specialization:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateInput = async (req, res) => {
  try {
    const updatedInput = await StudentInput.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!updatedInput) return res.status(404).json({ message: 'Entry not found' });
    res.json(updatedInput);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { field, status } = req.body;
    const validFields = ['cegRegularStatus', 'cegArrearStatus', 'mitRegularStatus', 'mitArrearStatus'];
    const validStatuses = ['pending', 'uploaded', 'skipped'];

    if (!validFields.includes(field)) {
      return res.status(400).json({ message: `Invalid field. Must be one of: ${validFields.join(', ')}` });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await StudentInput.findByIdAndUpdate(
      req.params.id, { [field]: status }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Entry not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const { field } = req.body;
    const { uploadFile } = require('../utils/s3');
    const validFields = ['cegRegularStatus', 'cegArrearStatus', 'mitRegularStatus', 'mitArrearStatus'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: `Invalid field. Must be one of: ${validFields.join(', ')}` });
    }
    const entry = await StudentInput.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const keyField = field.replace('Status', 'Key');
    const fileKey = await uploadFile(req.params.id, field, req.file.buffer);
    entry[keyField] = fileKey;
    entry[field] = 'uploaded';
    await entry.save();
    res.json(entry);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInput = async (req, res) => {
  try {
    const studentInput = await StudentInput.findById(req.params.id);
    if (!studentInput) return res.status(404).json({ message: 'Student input not found' });

    await studentInput.deleteOne();
    res.json({ message: 'Student input deleted' });
  } catch (error) {
    console.error('Error deleting student input:', error);
    res.status(500).json({ message: 'Failed to delete student input' });
  }
};

exports.getSpecializationSummary = async (req, res) => {
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
            { $group: { _id: null, totalArrearSheets: { $sum: "$cegArrear" } } }
          ]
        }
      }
    ]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch specialization summary', error: error.message });
  }
};

exports.getTotalCeg = async (req, res) => {
  try {
    const result = await StudentInput.aggregate([
      { $group: { _id: null, totalCeg: { $sum: "$totalCEG" } } }
    ]);
    res.json({ totalCeg: result[0]?.totalCeg || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching total CEG students.' });
  }
};