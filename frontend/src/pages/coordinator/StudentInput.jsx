import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StudentInput = () => {
  const [sessions, setSessions] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [courseCodes, setCourseCodes] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    cegRegular: '',
    cegArrear: '',
    mitRegular: '',
    mitArrear: '',
    total: 0,
    totalRegular: 0,
    totalArrear: 0
  });
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSessions();
    fetchEntries();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      // Extract unique specializations
      const uniqueSpecializations = [...new Set(sessions.map(session => session.specialization))];
      setSpecializations(uniqueSpecializations);
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedSpecialization) {
      // Filter course codes based on selected specialization
      const filteredSessions = sessions.filter(
        session => session.specialization === selectedSpecialization
      );
      const uniqueCourseCodes = [...new Set(filteredSessions.map(session => session.courseCode))];
      setCourseCodes(uniqueCourseCodes);
    } else {
      setCourseCodes([]);
    }
    setSelectedCourseCode('');
    setSelectedCourseName('');
    setSelectedSession(null);
  }, [selectedSpecialization, sessions]);

  useEffect(() => {
    if (selectedCourseCode) {
      // Find the session for the selected course code
      const session = sessions.find(
        session => session.courseCode === selectedCourseCode && 
                 session.specialization === selectedSpecialization
      );
      if (session) {
        setSelectedCourseName(session.courseName);
        setSelectedSession(session);
      }
    } else {
      setSelectedCourseName('');
      setSelectedSession(null);
    }
  }, [selectedCourseCode, selectedSpecialization, sessions]);

  useEffect(() => {
    // Calculate totals whenever any student count changes
    const cegRegular = parseInt(formData.cegRegular) || 0;
    const cegArrear = parseInt(formData.cegArrear) || 0;
    const mitRegular = parseInt(formData.mitRegular) || 0;
    const mitArrear = parseInt(formData.mitArrear) || 0;

    const totalRegular = cegRegular + mitRegular;
    const totalArrear = cegArrear + mitArrear;
    const total = totalRegular + totalArrear;

    setFormData(prev => ({ 
      ...prev, 
      total,
      totalRegular,
      totalArrear
    }));
  }, [formData.cegRegular, formData.cegArrear, formData.mitRegular, formData.mitArrear]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/student-inputs');
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to convert null/empty values to 0
  const parseCount = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleEditClick = (entry) => {
    setEditingId(entry._id);
    setSelectedSpecialization(entry.specialization);
    setSelectedCourseCode(entry.courseCode);
    setSelectedCourseName(entry.courseName);
    setFormData({
      cegRegular: entry.cegRegular,
      cegArrear: entry.cegArrear,
      mitRegular: entry.mitRegular,
      mitArrear: entry.mitArrear,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedSpecialization || !selectedCourseCode || !selectedCourseName || !selectedSession) {
      alert('Please fill in all required fields (Specialization, Course Code, Course Name, and Session)');
      return;
    }

    // Normalize numeric values
    const normalize = (val) => {
      if (val === null || val === undefined || val === '') {
        return 0;
      }
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const cegRegular = normalize(formData.cegRegular);
    const cegArrear = normalize(formData.cegArrear);
    const mitRegular = normalize(formData.mitRegular);
    const mitArrear = normalize(formData.mitArrear);

    // Calculate totals
    const totalRegular = cegRegular + mitRegular;
    const totalArrear = cegArrear + mitArrear;
    const total = totalRegular + totalArrear;

    // Create new entry
    const entryData = {
      specialization: selectedSpecialization,
      courseCode: selectedCourseCode,
      courseName: selectedCourseName,
      cegRegular,
      cegArrear,
      mitRegular,
      mitArrear,
      total,
      totalRegular,
      totalArrear,
      date: selectedSession.date,
      session: selectedSession.session
    };

    try {
      let savedEntry;
      if (editingId) {
        // Update existing entry
        const response = await axios.put(`http://localhost:5000/api/student-inputs/${editingId}`, entryData);
        savedEntry = response.data;
        setEntries(entries.map(entry => entry._id === editingId ? savedEntry : entry));
        setEditingId(null);
      } else {
        // Save new entry
        const response = await axios.post('http://localhost:5000/api/student-inputs', entryData);
        savedEntry = response.data;
        setEntries([...entries, savedEntry]);
      }
      
      console.log('Entry saved successfully:', savedEntry);

      // Clear form
      setSelectedSpecialization('');
      setSelectedCourseCode('');
      setSelectedCourseName('');
      setFormData({
        cegRegular: '',
        cegArrear: '',
        mitRegular: '',
        mitArrear: '',
        total: 0,
        totalRegular: 0,
        totalArrear: 0
      });
      setSelectedSession(null);

    } catch (error) {
      console.error('Error saving entry:', error);
      alert(error.message || 'Failed to save entry. Please try again.');
    }
  };

  // Calculate CEG and MIT totals for summary fields
  const totalCEG = (parseInt(formData.cegRegular) || 0) + (parseInt(formData.cegArrear) || 0);
  const totalMIT = (parseInt(formData.mitRegular) || 0) + (parseInt(formData.mitArrear) || 0);

  return (

      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Input</h1>
          <p className="text-gray-600">Enter student counts for each category</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          {/* Specialization Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Specialization</option>
              {specializations.map((spec, index) => (
                <option key={index} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Course Code Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!selectedSpecialization}
            >
              <option value="">Select Course Code</option>
              {courseCodes.map((code, index) => (
                <option key={index} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          {/* Course Name (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name
            </label>
            <input
              type="text"
              value={selectedCourseName}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          {/* Student Count Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEG Regular
              </label>
              <input
                type="number"
                name="cegRegular"
                value={formData.cegRegular}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEG Arrear
              </label>
              <input
                type="number"
                name="cegArrear"
                value={formData.cegArrear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>
            {/* Total CEG Students (Read-only) */}
            <div className="col-span-2 flex flex-col sm:flex-row items-stretch gap-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Total CEG Students</label>
                <input
                  type="number"
                  value={totalCEG}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold shadow-sm"
                  tabIndex={-1}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MIT Regular
              </label>
              <input
                type="number"
                name="mitRegular"
                value={formData.mitRegular}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MIT Arrear
              </label>
              <input
                type="number"
                name="mitArrear"
                value={formData.mitArrear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>
            {/* Total MIT Students (Read-only) */}
            <div className="col-span-2 flex flex-col sm:flex-row items-stretch gap-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Total MIT Students</label>
                <input
                  type="number"
                  value={totalMIT}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold shadow-sm"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>

          {/* Total Displays */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Regular
              </label>
              <input
                type="number"
                value={formData.totalRegular}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Arrear
              </label>
              <input
                type="number"
                value={formData.totalArrear}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Students
              </label>
              <input
                type="number"
                value={formData.total}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingId ? 'Update' : 'Submit'}
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        >
        {/* Table to display entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Submitted Entries</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Specialization</th>
                    <th className="px-4 py-2 text-left">Course Code</th>
                    <th className="px-4 py-2 text-left">Course Name</th>
                      <th className="px-4 py-2 text-center">Total CEG</th>
                      <th className="px-4 py-2 text-center">Total MIT</th>
                    <th className="px-4 py-2 text-center">Total</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry._id}>
                      <td className="px-4 py-2">{entry.specialization}</td>
                      <td className="px-4 py-2">{entry.courseCode}</td>
                      <td className="px-4 py-2">{entry.courseName}</td>
                      <td className="px-4 py-2 text-center font-semibold">{entry.cegRegular + entry.cegArrear}</td>
                      <td className="px-4 py-2 text-center font-semibold">{entry.mitRegular + entry.mitArrear}</td>
                      <td className="px-4 py-2 text-center font-semibold">{entry.total}</td>
                      <td className="px-4 py-2 text-center font-semibold">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </motion.div>
      </div>

  );
};

export default StudentInput; 