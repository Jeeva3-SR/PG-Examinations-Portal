const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/qpOrderController');

// Get all QP orders
router.get('/', ctrl.getAllOrders);

// Add a new QP order
router.post('/', ctrl.addOrder);

// Update QP order status
router.patch('/:id/status', ctrl.updateOrderStatus);

// Delete a QP order
router.delete('/:id', ctrl.deleteOrder);

// Generate QP orders for all courses
router.post('/generate-all', ctrl.generateAllOrders);

// Generate a QP order and letter for a faculty
router.post('/generate', ctrl.generateOrder);

// Get QP orders for a faculty
router.get('/:facultyId', ctrl.getOrdersByFaculty);

// Generate arrear evaluation letter content
router.post('/generate-arrear-eval-letter', ctrl.generateArrearEvalLetter);

// Get exam month from latest QP order
router.get('/exam-month', ctrl.getExamMonth);

// Update QP order status by orderId
router.patch('/:orderId/status', ctrl.updateOrderStatusByOrderId);

// Bulk update QP order status
router.post('/bulk-status', ctrl.bulkUpdateStatus);

module.exports = router;
