const Course = require('../models/Course');

const defaultCourses = [
  { courseCode: 'CP3351', courseName: 'Data Warehousing and Mining', studentCount: 50, type: 'Regular', college: 'CEG' },
  { courseCode: 'CP3061', courseName: 'Design Patterns', studentCount: 50, type: 'Regular', college: 'CEG' },
  { courseCode: 'OR3003', courseName: 'PERT/CPM', studentCount: 50, type: 'Regular', college: 'CEG' },
  { courseCode: 'OR3005', courseName: 'Supply Chain Management', studentCount: 50, type: 'Regular', college: 'CEG' },
  { courseCode: 'CP3064', courseName: 'Formal Specification Techniques', studentCount: 50, type: 'Regular', college: 'CEG' },
  { courseCode: 'CP3079', courseName: 'UI/UX Design', studentCount: 50, type: 'Regular', college: 'CEG' },
  { courseCode: 'CS23601', courseName: 'Machine Learning', studentCount: 50, type: 'Regular', college: 'CEG' }
];

const ensureDefaultCourses = async () => {
  const count = await Course.countDocuments();
  if (count > 0) return;
  await Course.insertMany(defaultCourses, { ordered: false }).catch(() => {});
};

exports.getAllCourses = async (req, res) => {
    try{
        await ensureDefaultCourses();
        const courses = await Course.find().sort({ courseCode : 1});
        res.json(courses);
    }
    catch(error)
    {
        res.status(500).json({ message: error.message });
    }
}

exports.addCourse = async (req, res) => {
    const course = new Course({
        courseCode : req.body.courseCode,
        courseName : req.body.courseName,
        studentCount : req.body.studentCount,
        type : req.body.type,
        college : req.body.college
    });

    try {
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    }
    catch(error)    {
        res.status(400).json({ message: error.message });
    }
}

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        Object.keys(req.body).forEach(key => {
            course[key] = req.body[key];
        });
        const updatedCourse = await course.save();
        res.json(updatedCourse);
    }
    catch(error)    {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteCourse = async (req, res) => {
     try {
        const course = await Course.findById(req.params.id);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
    
        await course.remove();
        res.json({ message: 'Course deleted' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}