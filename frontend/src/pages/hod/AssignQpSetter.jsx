import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignQPSetter = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedQPSetters, setAssignedQPSetters] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // For HOD, fetch all QP orders (or adjust as needed for your backend)
        const response = await axios.get('http://localhost:5000/api/qporders');
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch QP Orders');
        setLoading(false);
      }
    };

    const fetchAssignedQPSetters = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assigned-qpsetters');
        setAssignedQPSetters(response.data);
      } catch (err) {
        // ignore error, just show '-'
      }
    };

    fetchOrders();
    fetchAssignedQPSetters();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allOrderIds = orders.map(order => order._id);
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const handleViewLetter = (letterText) => {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>QP Order Letter</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              white-space: pre-wrap;
              font-size: 14px;
            }
            @media print {
              body {
                margin: 20mm;
              }
            }
          </style>
        </head>
        <body>${letterText}</body>
      </html>
    `);
    newWindow.document.close();
  };

  const handleDownloadLetter = (letterText, type, courseCode) => {
    const element = document.createElement('a');
    const file = new Blob([letterText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${type}_QP_Order_${courseCode}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleApprove = async (orderId) => {
    try {
      await axios.patch(`http://localhost:5000/api/qporders/${orderId}/status`, { status: 'Approved' });
      setOrders(prev => prev.filter(order => order._id !== orderId));
      setToast('Approved!');
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      alert('Failed to approve order');
    }
  };

  const handleReject = async (orderId) => {
    try {
      await axios.patch(`http://localhost:5000/api/qporders/${orderId}/status`, { status: 'Rejected' });
      setOrders(prev => prev.filter(order => order._id !== orderId));
      setToast('Rejected!');
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      alert('Failed to reject order');
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedOrders.length === 0) {
      alert(`Please select orders to ${status.toLowerCase()}.`);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/qporders/bulk-status', {
        orderIds: selectedOrders,
        status,
      });
      setOrders(prev => prev.filter(order => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
      setToast(`${status}!`);
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      alert(`Failed to ${status.toLowerCase()} selected orders.`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
          {toast}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">QP Orders</h1>
      
      {selectedOrders.length > 0 && (
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => handleBulkAction('Approved')}
            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction('Rejected')}
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
          >
            Reject Selected
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center text-gray-600 mt-4">
          No QP orders found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const assignment = assignedQPSetters.find(a => a.subject === order.courseName);
                return (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.courseCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment ? assignment.facultyName : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewLetter(order.letterText)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleApprove(order._id)}
                        disabled={order.status === 'Approved' || order.status === 'Rejected'}
                        className="text-green-600 hover:text-green-900 mr-2 border border-green-600 rounded px-2 py-1 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(order._id)}
                        disabled={order.status === 'Approved' || order.status === 'Rejected'}
                        className="text-red-600 hover:text-red-900 border border-red-600 rounded px-2 py-1 transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignQPSetter; 