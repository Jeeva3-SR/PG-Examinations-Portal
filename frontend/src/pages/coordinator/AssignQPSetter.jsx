import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';


const AssignQPSetter = () => {
  const [courses, setCourses] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignedRows, setAssignedRows] = useState(() => {
    const saved = sessionStorage.getItem('assignedRows');
    return saved ? JSON.parse(saved) : [];
  });
  const [generatingRow, setGeneratingRow] = useState(null);
  const [qpOrders, setQpOrders] = useState([]);

  // Fetch courses and faculty on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, facultyRes, qpRes] = await Promise.all([
          api.get('/api/courses'),
          api.get('/api/faculty'),
          api.get('/api/qporders'),
        ]);
        setCourses(coursesRes.data);
        setAllFaculty(facultyRes.data);
        setQpOrders(qpRes.data);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show all faculty when subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setFaculty([]);
      return;
    }
    setFaculty(allFaculty);
  }, [selectedSubject, allFaculty]);

  const handleAssign = async () => {
    if (!selectedSubject || !selectedFaculty) {
      setError('Please select both subject and faculty');
      return;
    }

    try {
      const selectedFacultyData = faculty.find(f => f.facultyId === selectedFaculty);
      await api.post('/api/assigned-qpsetters', {
        subject: selectedSubject,
        facultyId: selectedFacultyData.facultyId,
        facultyName: selectedFacultyData.name
      });
      const selectedCourse = courses.find(c => c.courseName === selectedSubject);
      setSuccess('Faculty assigned successfully');
      setIsAssigned(false);
      setAssignedRows(prev => [
        ...prev,
        {
          courseName: selectedSubject,
          courseCode: selectedCourse?.courseCode || '',
          facultyName: selectedFacultyData.name,
          facultyId: selectedFacultyData.facultyId,
          generatedType: null
        }
      ]);
      setSelectedSubject('');
      setSelectedFaculty('');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error assigning faculty');
      setSuccess('');
      setIsAssigned(false);
    }
  };

  const handleGenerateOrder = async (type, rowIdx) => {
    const row = assignedRows[rowIdx];
    if (!row.courseName || !row.facultyId) {
      setError('Missing course or faculty');
      return;
    }
    setGeneratingRow(rowIdx);
    try {
      setError('');
      setSuccess('');
      await api.post('/api/qporders/generate', {
        facultyId: row.facultyId,
        courseCode: row.courseCode,
        courseName: row.courseName,
        type
      });
      setSuccess(`Successfully generated ${type} QP Order`);
      // Save the generated type in local state for immediate UI update
      setAssignedRows(prev => prev.map((r, i) =>
        i === rowIdx ? { ...r, generatedType: type } : r
      ));
      setGeneratingRow(null);
    } catch (error) {
      console.log('[QP Frontend] Error response:', error.response?.status, JSON.stringify(error.response?.data));
      setError(error.response?.data?.error || 'Failed to generate QP Order');
      setGeneratingRow(null);
    }
  };

  // Reset assignment state when subject or faculty changes
  useEffect(() => {
    setIsAssigned(false);
  }, [selectedSubject, selectedFaculty]);

  // Keep sessionStorage in sync if assignedRows changes
  useEffect(() => {
    sessionStorage.setItem('assignedRows', JSON.stringify(assignedRows));
  }, [assignedRows]);

  // Helper to get QP order for a row
  const getQpOrderForRow = (row) => {
    return qpOrders.find(
      (order) =>
        order.facultyId === row.facultyId &&
        order.courseName === row.courseName
    );
  };

  const handleSendToFaculty = (orderId) => {
    // Placeholder: implement actual send logic (e.g., email, notification)
    alert('Letter sent to faculty!');
  };

  return (

      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-3xl font-bold mb-6"
          >
            Assign QP Setters
          </motion.h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Subject Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isAssigned}
                >
                  <option value="">Select a subject</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c.courseName}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
            </div>

            {/* Faculty Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Faculty
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedSubject || loading || isAssigned}
              >
                <option value="">Select a faculty member</option>
                {faculty.map((f) => (
                  <option key={f.facultyId} value={f.facultyId}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleAssign}
                disabled={!selectedSubject || !selectedFaculty}
                className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                  !selectedSubject || !selectedFaculty
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Assign
              </button>
            </div>

            {/* Assigned QP Setters Table */}
            {assignedRows.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Assigned QP Setters</h2>
                <div className="flex flex-row items-start w-full">
                  <div className="flex-1">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <colgroup>
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '24%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '18%' }} />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Course Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Faculty Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {assignedRows.map((row, idx) => {
                          const qpOrder = getQpOrderForRow(row);
                          return (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.courseName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.facultyName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {qpOrder && qpOrder.type ? (
                                  <span className="px-3 py-1 rounded bg-gray-100 text-gray-800 font-medium capitalize">{qpOrder.type}</span>
                                ) : row.generatedType ? (
                                  <span className="px-3 py-1 rounded bg-gray-100 text-gray-800 font-medium capitalize">{row.generatedType}</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleGenerateOrder('regular', idx)}
                                      disabled={generatingRow === idx}
                                      className="mr-2 px-3 py-1 rounded bg-green-600 text-white font-medium hover:bg-green-700"
                                    >
                                      Generate Regular QP Order
                                    </button>
                                    <button
                                      onClick={() => handleGenerateOrder('arrear', idx)}
                                      disabled={generatingRow === idx}
                                      className="px-3 py-1 rounded bg-yellow-600 text-white font-medium hover:bg-yellow-700"
                                    >
                                      Generate Arrear QP Order
                                    </button>
                                  </>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {qpOrder ? (
                                  qpOrder.status === 'Waiting for Response' ? (
                                    <span className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-medium cursor-not-allowed">Waiting for Response</span>
                                  ) : qpOrder.status === 'Approved' ? (
                                    <span className="px-3 py-1 rounded bg-green-200 text-green-700 font-medium">Approved</span>
                                  ) : qpOrder.status === 'Rejected' ? (
                                    <span className="px-3 py-1 rounded bg-red-200 text-red-700 font-medium">Rejected</span>
                                  ) : qpOrder.status
                                ) : (row.generatedType ? (
                                  <span className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-medium cursor-not-allowed">Waiting for Response</span>
                                ) : '-')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {qpOrder && qpOrder.status === 'Approved' ? (
                                  <button
                                    onClick={() => handleSendToFaculty(qpOrder._id)}
                                    className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                                  >
                                    Send to Faculty
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
  );
};

export default AssignQPSetter; 