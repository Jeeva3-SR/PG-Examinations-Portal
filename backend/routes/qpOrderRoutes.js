const express = require('express');
const router = express.Router();
const QPOrder = require('../models/QPOrder');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Session = require('../models/Session');
const StudentInput = require('../models/StudentInput');

/**
 * @openapi
 * /api/qporders:
 *   get:
 *     summary: Get all QP orders
 *     responses:
 *       200:
 *         description: Array of QP orders
 */
// Get all QP orders
router.get('/', async (req, res) => {
  try {
    const orders = await QPOrder.find()
      .populate('courseCode', 'courseCode courseName studentCount')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/qporders:
 *   post:
 *     summary: Create a QP order for a course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created QP order
 */
// Add a new QP order
router.post('/', async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseCode);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Calculate quantity with 10% buffer
    const quantity = Math.ceil(course.studentCount * 1.1);

    const order = new QPOrder({
      courseCode: req.body.courseCode,
      quantity,
      status: 'Pending',
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/qporders/{id}/status:
 *   patch:
 *     summary: Update QP order status
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
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
// Update QP order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await QPOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/qporders/{id}:
 *   delete:
 *     summary: Delete a QP order
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
// Delete a QP order
router.delete('/:id', async (req, res) => {
  try {
    const order = await QPOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.remove();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/qporders/generate-all:
 *   post:
 *     summary: Generate QP orders for all courses
 *     responses:
 *       201:
 *         description: Orders generated
 */
// Generate QP orders for all courses
router.post('/generate-all', async (req, res) => {
  try {
    const courses = await Course.find();
    const orders = [];

    for (const course of courses) {
      const quantity = Math.ceil(course.studentCount * 1.1);
      const order = new QPOrder({
        courseCode: course._id,
        quantity,
        status: 'Pending',
      });
      orders.push(order);
    }

    await QPOrder.insertMany(orders);
    res.status(201).json({ message: 'Orders generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/qporders/generate:
 *   post:
 *     summary: Generate a QP order and letter for a faculty
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facultyId:
 *                 type: string
 *               courseName:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated letter text
 */
// Generate QP Order
router.post('/generate', async (req, res) => {
  try {
    const { facultyId, courseName, type } = req.body;

    // Find faculty
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Find session
    const session = await Session.findOne({ courseName });
    if (!session) {
      return res.status(404).json({ error: 'Course session not found' });
    }

    // Format exam month from session date
    const examDate = new Date(session.date);
    const examMonth = examDate.toLocaleString('default', { month: 'long' }).toUpperCase() + ' ' + examDate.getFullYear();

    // Calculate last date to submit (7 days before exam)
    const lastDateToSubmit = new Date(examDate);
    lastDateToSubmit.setDate(lastDateToSubmit.getDate() - 7);

    // Generate letter text based on type
    let letterText = '';
    if (type === 'regular') {
      letterText = `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING  
COLLEGE OF ENGINEERING, GUINDY CAMPUS  
ANNA UNIVERSITY:: CHENNAI - 600 025.  
                 PG (FT) & Ph.D REGULAR EXAMINATIONS – ${examMonth}

                                            Date: ${new Date().toLocaleDateString()}

To  
\tDr. ${faculty.name},  
\tDepartment of Computer Science and Engineering,  
\tCEG Campus,  
\tAnna University, Chennai 600 025.  

Sir/Madam,

Sub: PG (FT) – Regular Examination ${examMonth} – Appointment of Question Paper Setter – Reg.

It is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth} for the subject whose details are given below:

<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; margin-bottom: 10px;">
  <tr style="background:#f2f2f2; font-weight:bold;">
    <td>DEGREE</td>
    <td>BRANCH</td>
    <td>DURATION</td>
    <td>MAX. MARKS</td>
    <td>REGULATION</td>
  </tr>
  <tr>
    <td>M.E.</td>
    <td>${session.specialization}</td>
    <td>3 Hrs.</td>
    <td>100</td>
    <td>2023</td>
  </tr>
</table>

Sl.No  Subject Code and Subject Title     Last Date to submit the Question Paper  
1.     ${session.courseCode} - ${session.courseName}    ${lastDateToSubmit.toLocaleDateString()}

You are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to Dr. C. Valliyammai, Professor, Chief Superintendent (P.G. Examinations) in the Department of Computer Science and Engineering.

Your kind cooperation is requested for the smooth and successful conduct of examination as per schedule.

  
\tHead of the department`;
    } else {
      letterText = `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
COLLEGE OF ENGINEERING, GUINDY CAMPUS
ANNA UNIVERSITY:: CHENNAI - 600 025.
PG (FT) & Ph.D ARREAR EXAMINATIONS – ${examMonth}


                                        Date: ${new Date().toLocaleDateString()}
To
Dr. ${faculty.name},
Department of Computer Science and Engineering,
CEG Campus,
Anna University, Chennai 600 025.

Sir/Madam,

Sub: PG (FT) – Arrear Examination ${examMonth} – Appointment of Question Paper Setter – Reg.

It is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth} for the subject whose details are given below:

<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; margin-bottom: 10px;">
  <tr style="background:#f2f2f2; font-weight:bold;">
    <td>DEGREE</td>
    <td>BRANCH</td>
    <td>DURATION</td>
    <td>MAX. MARKS</td>
    <td>REGULATION</td>
  </tr>
  <tr>
    <td>M.E.</td>
    <td>${session.specialization}</td>
    <td>3 Hrs.</td>
    <td>100</td>
    <td>2023</td>
  </tr>
</table>

Sl.No Subject Code and Subject Title Total number of copies Last Date to submit the Question Paper


${session.courseCode} - ${session.courseName}    50           ${lastDateToSubmit.toLocaleDateString()}

You are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to Dr. C. Valliyammai, Professor, Chief Superintendent (P.G. Examinations) in the Department of Computer Science and Engineering.

Your kind cooperation is requested for the smooth and successful conduct of examination as per schedule.

Head of the department`;
    }

    // Create QP Order
    const qpOrder = new QPOrder({
      facultyId,
      facultyName: faculty.name,
      courseCode: session.courseCode,
      courseName: session.courseName,
      specialization: session.specialization,
      type,
      examMonth,
      lastDateToSubmit,
      letterText,
      status: 'Waiting for Response'
    });

    await qpOrder.save();

    res.json({ success: true, letterText });
  } catch (error) {
    console.error('Error generating QP Order:', error);
    res.status(500).json({ error: 'Failed to generate QP Order' });
  }
});

/**
 * @openapi
 * /api/qporders/{facultyId}:
 *   get:
 *     summary: Get QP orders for a faculty
 *     parameters:
 *       - name: facultyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of orders
 */
// Get QP Orders for a faculty
router.get('/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const orders = await QPOrder.find({ facultyId }).sort({ generatedAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching QP Orders:', error);
    res.status(500).json({ error: 'Failed to fetch QP Orders' });
  }
});

// Generate arrear evaluation letter content
/**
 * @openapi
 * /api/qporders/generate-arrear-eval-letter:
 *   post:
 *     summary: Generate arrear evaluation letter content
 *     responses:
 *       200:
 *         description: Letter text
 */
router.post('/generate-arrear-eval-letter', async (req, res) => {
  try {
    const studentInputs = await StudentInput.find({ cegArrear: { $ne: 0 } });
    const rows = await Promise.all(studentInputs.map(async (input) => {
      const faculty = await Faculty.findOne({ course: input.courseCode }) || await Faculty.findOne({ course: input.courseName });
      return {
        courseCode: input.courseCode,
        courseName: input.courseName,
        facultyName: faculty ? faculty.name : '',
        facultyId: faculty ? faculty.facultyId : ''
      };
    }));
    let letter = `From\nHead of Department\nDepartment of Computer Science and Engineering\nAnna University\nChennai 600025\n\nTo\nThe ACOE\nAnna University\nChennai 600025\n\nDear Ma'am,\n\nSub: Assignment of evaluators for PG arrear examinations – reg.\n\nKindly assign faculty members to evaluate the PG arrear answer scripts as per the mapping given below:\n\n`;
    letter += `Course Code    Course Title    Faculty Name    Faculty Emp. ID\n`;
    letter += `----------------------------------------------------------\n`;
    letter += rows.map(row => `${row.courseCode}    ${row.courseName}    ${row.facultyName}    ${row.facultyId}`).join('\n');
    letter += `\n\nThank you`;
    res.json({ letterText: letter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/qporders/exam-month:
 *   get:
 *     summary: Get exam month from latest QP order
 *     responses:
 *       200:
 *         description: Exam month
 */
// GET: The examMonth from the latest QP Order
router.get('/exam-month', async (req, res) => {
  try {
    const QPOrder = require('../models/QPOrder');
    const latestOrder = await QPOrder.findOne().sort({ createdAt: -1 });
    if (!latestOrder) {
      return res.status(404).json({ message: 'No QP order found.' });
    }
    res.json({ examMonth: latestOrder.examMonth });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching exam month.' });
  }
});

/**
 * @openapi
 * /api/qporders/{orderId}/status:
 *   patch:
 *     summary: Update QP order status
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated order
 */
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await QPOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.post('/bulk-status', async (req, res) => {
  const { orderIds, status } = req.body;

  if (!orderIds || !status || !Array.isArray(orderIds)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    await QPOrder.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: status } }
    );
    res.status(200).json({ message: 'Bulk update successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
});

module.exports = router; 