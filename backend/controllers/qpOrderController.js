const QPOrder = require('../models/QPOrder');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Session = require('../models/Session');
const StudentInput = require('../models/StudentInput');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await QPOrder.find()
      .populate('courseCode', 'courseCode courseName studentCount')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addOrder = async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseCode);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quantity = Math.ceil(course.studentCount * 1.1);
    const order = new QPOrder({ courseCode: req.body.courseCode, quantity, status: 'Pending' });
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await QPOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await QPOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.remove();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateAllOrders = async (req, res) => {
  try {
    const courses = await Course.find();
    const orders = [];
    for (const course of courses) {
      const quantity = Math.ceil(course.studentCount * 1.1);
      orders.push({ courseCode: course._id, quantity, status: 'Pending' });
    }
    await QPOrder.insertMany(orders);
    res.status(201).json({ message: 'Orders generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateOrder = async (req, res) => {
  console.log('[QP Generate] Body:', JSON.stringify(req.body));
  try {
    const { facultyId, courseCode, courseName, type } = req.body;

    console.log('[QP Generate] Looking up Faculty with facultyId:', facultyId);
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      console.log('[QP Generate] Faculty NOT found for facultyId:', facultyId);
      console.log('[QP Generate] Faculty model name:', Faculty.modelName);
      return res.status(404).json({ error: 'Faculty not found' });
    }
    console.log('[QP Generate] Faculty found:', faculty.name, '(model:', Faculty.modelName + ')');

    console.log('[QP Generate] Looking up Session with courseCode:', courseCode, '| courseName:', courseName);
    let session = null;
    if (courseCode) {
      session = await Session.findOne({ courseCode });
      console.log('[QP Generate] Session lookup by courseCode:', courseCode, '->', session ? session.courseCode : 'NOT FOUND');
    }
    if (!session) {
      session = await Session.findOne({ courseName });
      console.log('[QP Generate] Session lookup by courseName:', courseName, '->', session ? session.courseCode : 'NOT FOUND');
    }
    if (!session) return res.status(404).json({ error: 'Course session not found' });

    const examDate = new Date(session.date);
    const examMonth = examDate.toLocaleString('default', { month: 'long' }).toUpperCase() + ' ' + examDate.getFullYear();
    const lastDateToSubmit = new Date(examDate);
    lastDateToSubmit.setDate(lastDateToSubmit.getDate() - 7);

    let letterText = '';
    if (type === 'regular') {
      letterText = `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nCOLLEGE OF ENGINEERING, GUINDY CAMPUS\nANNA UNIVERSITY:: CHENNAI - 600 025.\n                 PG (FT) & Ph.D REGULAR EXAMINATIONS – ${examMonth}\n\n                                            Date: ${new Date().toLocaleDateString()}\n\nTo  \n\tDr. ${faculty.name},  \n\tDepartment of Computer Science and Engineering,  \n\tCEG Campus,  \n\tAnna University, Chennai 600 025.  \n\nSir/Madam,\n\nSub: PG (FT) – Regular Examination ${examMonth} – Appointment of Question Paper Setter – Reg.\n\nIt is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth} for the subject whose details are given below:\n\n<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; margin-bottom: 10px;">\n  <tr style="background:#f2f2f2; font-weight:bold;">\n    <td>DEGREE</td>\n    <td>BRANCH</td>\n    <td>DURATION</td>\n    <td>MAX. MARKS</td>\n    <td>REGULATION</td>\n  </tr>\n  <tr>\n    <td>M.E.</td>\n    <td>${session.specialization}</td>\n    <td>3 Hrs.</td>\n    <td>100</td>\n    <td>2023</td>\n  </tr>\n</table>\n\nSl.No  Subject Code and Subject Title     Last Date to submit the Question Paper  \n1.     ${session.courseCode} - ${session.courseName}    ${lastDateToSubmit.toLocaleDateString()}\n\nYou are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to Dr. C. Valliyammai, Professor, Chief Superintendent (P.G. Examinations) in the Department of Computer Science and Engineering.\n\nYour kind cooperation is requested for the smooth and successful conduct of examination as per schedule.\n\n  \n\tHead of the department`;
    } else {
      letterText = `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nCOLLEGE OF ENGINEERING, GUINDY CAMPUS\nANNA UNIVERSITY:: CHENNAI - 600 025.\nPG (FT) & Ph.D ARREAR EXAMINATIONS – ${examMonth}\n\n\n                                        Date: ${new Date().toLocaleDateString()}\nTo\nDr. ${faculty.name},\nDepartment of Computer Science and Engineering,\nCEG Campus,\nAnna University, Chennai 600 025.\n\nSir/Madam,\n\nSub: PG (FT) – Arrear Examination ${examMonth} – Appointment of Question Paper Setter – Reg.\n\nIt is informed that, you are appointed as Question Paper Setter for the Examinations to be held in ${examMonth} for the subject whose details are given below:\n\n<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; margin-bottom: 10px;">\n  <tr style="background:#f2f2f2; font-weight:bold;">\n    <td>DEGREE</td>\n    <td>BRANCH</td>\n    <td>DURATION</td>\n    <td>MAX. MARKS</td>\n    <td>REGULATION</td>\n  </tr>\n  <tr>\n    <td>M.E.</td>\n    <td>${session.specialization}</td>\n    <td>3 Hrs.</td>\n    <td>100</td>\n    <td>2023</td>\n  </tr>\n</table>\n\nSl.No Subject Code and Subject Title Total number of copies Last Date to submit the Question Paper\n\n\n${session.courseCode} - ${session.courseName}    50           ${lastDateToSubmit.toLocaleDateString()}\n\nYou are requested to prepare the question paper with required number of copies, securely sealed in a cover, along with two additional copies placed in a separate sealed cover, and hand over both the covers to Dr. C. Valliyammai, Professor, Chief Superintendent (P.G. Examinations) in the Department of Computer Science and Engineering.\n\nYour kind cooperation is requested for the smooth and successful conduct of examination as per schedule.\n\nHead of the department`;
    }

    const qpOrder = new QPOrder({
      facultyId, facultyName: faculty.name,
      courseCode: session.courseCode, courseName: session.courseName,
      specialization: session.specialization, type, examMonth, lastDateToSubmit, letterText,
      status: 'Waiting for Response'
    });
    await qpOrder.save();
    res.json({ success: true, letterText });
  } catch (error) {
    console.error('Error generating QP Order:', error);
    res.status(500).json({ error: 'Failed to generate QP Order' });
  }
};

exports.getOrdersByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const orders = await QPOrder.find({ facultyId }).sort({ generatedAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching QP Orders:', error);
    res.status(500).json({ error: 'Failed to fetch QP Orders' });
  }
};

exports.generateArrearEvalLetter = async (req, res) => {
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
};

exports.getExamMonth = async (req, res) => {
  try {
    const QPOrderModel = require('../models/QPOrder');
    const latestOrder = await QPOrderModel.findOne().sort({ createdAt: -1 });
    if (!latestOrder) return res.status(404).json({ message: 'No QP order found.' });
    res.json({ examMonth: latestOrder.examMonth });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching exam month.' });
  }
};

exports.updateOrderStatusByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await QPOrder.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  const { orderIds, status } = req.body;
  if (!orderIds || !status || !Array.isArray(orderIds)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  try {
    await QPOrder.updateMany({ _id: { $in: orderIds } }, { $set: { status } });
    res.status(200).json({ message: 'Bulk update successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk update' });
  }
};
