import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import TimetableUpload from '../../components/TimetableUpload';


const SessionView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    session: 'FN',
    specialization: '',
    courseCode: '',
    courseName: '',
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/sessions');
      setSessions(res.data);
    } catch (err) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSession = async () => {
    try {
      await axios.post('http://localhost:5000/api/sessions', newSession);
      alert('Session added successfully!');
      setNewSession({
        date: '',
        session: 'FN',
        specialization: '',
        courseCode: '',
        courseName: '',
      });
      fetchSessions(); // Refresh data
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Failed to add session.');
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sessions/${id}`);
        alert('Session deleted successfully!');
        fetchSessions(); // Refresh data
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete session.');
      }
    }
  };

  return (

      <div className="min-h-screen bg-gradient-to-tr from-slate-100 to-blue-50 font-sans">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold mb-2 tracking-wide text-slate-900">
                 Session Timetable
              </h1>
              <p className="text-slate-900 text-lg">
                Upload and manage examination timetables
              </p>
            </motion.div>

            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
              className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl"
            >
              <TimetableUpload onUploadSuccess={fetchSessions} />
            </motion.div>

            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Add New Session</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="date"
                  name="date"
                  value={newSession.date}
                  onChange={handleNewSessionChange}
                  className="p-2 border rounded-md"
                />
                <select
                  name="session"
                  value={newSession.session}
                  onChange={handleNewSessionChange}
                  className="p-2 border rounded-md"
                >
                  <option value="FN">FN</option>
                  <option value="AN">AN</option>
                </select>
                <input
                  type="text"
                  name="specialization"
                  placeholder="Specialization"
                  value={newSession.specialization}
                  onChange={handleNewSessionChange}
                  className="p-2 border rounded-md"
                />
                <input
                  type="text"
                  name="courseCode"
                  placeholder="Course Code"
                  value={newSession.courseCode}
                  onChange={handleNewSessionChange}
                  className="p-2 border rounded-md"
                />
                <input
                  type="text"
                  name="courseName"
                  placeholder="Course Name"
                  value={newSession.courseName}
                  onChange={handleNewSessionChange}
                  className="p-2 border rounded-md"
                />
              </div>
              <button
                onClick={handleAddSession}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Session
              </button>
            </div>

            {/* Table Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="bg-white shadow-xl rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl"
            >
              <h2 className="text-xl font-semibold mb-6 tracking-wide text-slate-900">
                Session List
              </h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Session</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Course Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessions.map((s) => (
                        <tr key={s._id} className="hover:bg-blue-50 transition duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {s.date ? new Date(s.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : 'Invalid Date'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.day}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {s.session}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.courseCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.courseName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.specialization}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSession(s._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default SessionView; 