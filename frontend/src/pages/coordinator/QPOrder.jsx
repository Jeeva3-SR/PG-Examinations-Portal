import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const QPOrder = () => {
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchCourses();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/qporders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleGenerateOrders = async () => {
    try {
      await axios.post('http://localhost:5000/api/qporders/generate-all');
      fetchOrders();
    } catch (error) {
      console.error('Error generating orders:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/qporders/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text('Question Paper Order Request', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Examination Cell', pageWidth / 2, 30, { align: 'center' });

    // Content
    doc.setFontSize(10);
    doc.text(`Course Code: ${order.courseCode.courseCode}`, 20, 50);
    doc.text(`Course Name: ${order.courseCode.courseName}`, 20, 60);
    doc.text(`Student Count: ${order.courseCode.studentCount}`, 20, 70);
    doc.text(`Quantity Required: ${order.quantity}`, 20, 80);
    doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 90);

    // Footer
    doc.setFontSize(10);
    doc.text('Authorized Signature', 20, 150);
    doc.text('Examination Cell', 20, 160);

    // Save the PDF
    doc.save(`QP_Order_${order.courseCode.courseCode}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">QP Order</h1>
        <button onClick={handleGenerateOrders} className="btn-primary">
          Generate All Orders
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.courseCode.courseCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.courseCode.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.courseCode.studentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="text-sm text-gray-900 border-0 focus:ring-0"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Received">Received</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => generatePDF(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Generate Letter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QPOrder; 