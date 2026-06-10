import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';

const StudentInput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionRef = searchParams.get('sessionId') || '';
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get('specialization') || '');
  const [selectedCourseCode, setSelectedCourseCode] = useState(searchParams.get('courseCode') || '');
  const [selectedCourseName, setSelectedCourseName] = useState(searchParams.get('courseName') || '');
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
  const [uploadModalEntry, setUploadModalEntry] = useState(null);
  const [localStatuses, setLocalStatuses] = useState({});
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    fetchSessions();
    fetchCourses();
    fetchEntries();
    if (sessionRef) {
      fetchExistingEntry(sessionRef);
    }
  }, []);

  const fetchExistingEntry = async (sessionId) => {
    try {
      const res = await axios.get(`/api/student-inputs/by-session/${sessionId}`);
      if (res.data) {
        const entry = res.data;
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
      }
    } catch (error) {
      console.error('Error fetching existing entry:', error);
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      // Extract unique specializations and add M.E.
      const uniqueSpecializations = [...new Set([...sessions.map(session => session.specialization), 'M.E.'])];
      setSpecializations(uniqueSpecializations);
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedCourseCode) {
      const course = courses.find(c => c.courseCode === selectedCourseCode);
      if (course) {
        setSelectedCourseName(course.courseName);
      }
      const session = sessions.find(s => s.courseCode === selectedCourseCode);
      setSelectedSession(session || null);
    } else {
      setSelectedCourseName('');
      setSelectedSession(null);
    }
  }, [selectedCourseCode, courses, sessions]);

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
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/student-inputs');
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

  const handleOpenUploadModal = (entry) => {
    console.log('[StudentInput] Opening upload modal for entry:', entry._id);
    setUploadModalEntry(entry);
    setLocalStatuses({
      cegRegularStatus: entry.cegRegularStatus || 'pending',
      cegArrearStatus: entry.cegArrearStatus || 'pending',
      mitRegularStatus: entry.mitRegularStatus || 'pending',
      mitArrearStatus: entry.mitArrearStatus || 'pending'
    });
  };

  const handleFileSelect = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField(field);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field', field);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`/api/student-inputs/${uploadModalEntry._id}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setLocalStatuses(prev => ({ ...prev, [field]: 'uploaded' }));
      setEntries(entries.map(e => e._id === uploadModalEntry._id ? res.data : e));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    }
    setUploadingField(null);
    e.target.value = '';
  };

  const handleUploadOrSkip = async (field, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.patch(`/api/student-inputs/${uploadModalEntry._id}/status`,
        { field, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocalStatuses(prev => ({ ...prev, [field]: status }));
      setEntries(entries.map(e => e._id === uploadModalEntry._id ? res.data : e));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const allFieldsDone = () => {
    return ['cegRegularStatus', 'cegArrearStatus', 'mitRegularStatus', 'mitArrearStatus']
      .every(f => localStatuses[f] === 'uploaded' || localStatuses[f] === 'skipped');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSpecialization || !selectedCourseCode || !selectedCourseName) {
      alert('Please fill in all required fields (Specialization, Course, and Course Name)');
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
      date: selectedSession?.date || '',
      session: selectedSession?.session || '',
      sessionRef: sessionRef || undefined
    };

    try {
      let savedEntry;
      if (editingId) {
        // Update existing entry
        const response = await axios.put(`/api/student-inputs/${editingId}`, entryData);
        savedEntry = response.data;
        setEntries(entries.map(entry => entry._id === editingId ? savedEntry : entry));
        setEditingId(null);
      } else {
        const response = await axios.post('/api/student-inputs', entryData);
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
    <>
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
              Course Code - Course
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c.courseCode}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
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
                      <th className="px-4 py-2 text-center">Upload Status</th>
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
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenUploadModal(entry)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Upload Students List
                        </button>
                      </td>
                      <td className="px-4 py-2 text-center text-xs">
                        {['cegRegular', 'cegArrear', 'mitRegular', 'mitArrear']
                          .map(f => {
                            const statusKey = f + 'Status';
                            const status = entry[statusKey] || 'pending';
                            const label = status === 'uploaded' ? '✓' : status === 'skipped' ? '–' : '○';
                            return <span key={f} title={`${f}: ${status}`} className="mx-0.5">{label}</span>;
                          })}
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

      {uploadModalEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Upload Students List</h2>
              <button onClick={() => setUploadModalEntry(null)} className="text-slate-400 hover:text-slate-700 text-xl">&times;</button>
            </div>
            <p className="text-sm text-slate-500">
              {uploadModalEntry.courseCode} - {uploadModalEntry.courseName} ({uploadModalEntry.specialization})
            </p>

            {[
              { key: 'cegRegularStatus', label: 'CEG Regular', count: uploadModalEntry.cegRegular },
              { key: 'cegArrearStatus', label: 'CEG Arrear', count: uploadModalEntry.cegArrear },
              { key: 'mitRegularStatus', label: 'MIT Regular', count: uploadModalEntry.mitRegular },
              { key: 'mitArrearStatus', label: 'MIT Arrear', count: uploadModalEntry.mitArrear }
            ].map(({ key, label, count }) => {
              const status = localStatuses[key];
              const isZero = count === 0;
              const isUploaded = status === 'uploaded';
              const isSkipped = status === 'skipped';
              const isDone = isUploaded || isSkipped;
              const isGreyed = isZero && !isDone;
              return (
                <div key={key} className={`border rounded-xl p-4 transition-colors ${
                  isUploaded ? 'bg-green-50 border-green-200' :
                  isSkipped ? 'bg-slate-100 border-slate-200 opacity-60' :
                  isZero ? 'bg-slate-100 border-slate-200 opacity-50' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sm">{label}</span>
                      <span className="ml-2 text-xs text-slate-500">({count} students)</span>
                      {isUploaded && <span className="ml-2 text-xs text-green-600 font-medium">✓ Uploaded</span>}
                      {(isSkipped || (isDone && isZero)) && <span className="ml-2 text-xs text-slate-400 font-medium">– Skipped</span>}
                    </div>
                    {isZero && !isDone && (
                      <button
                        onClick={() => handleUploadOrSkip(key, 'skipped')}
                        className="px-4 py-1.5 bg-slate-400 text-white text-sm rounded-lg hover:bg-slate-500"
                      >
                        Skip
                      </button>
                    )}
                    {!isZero && !isDone && (
                      <button
                        onClick={() => document.getElementById(`file-${key}`).click()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        disabled={uploadingField === key}
                      >
                        {uploadingField === key ? 'Uploading...' : 'Upload Excel'}
                      </button>
                    )}
                    {isUploaded && (
                      <button
                        onClick={() => document.getElementById(`file-${key}`).click()}
                        className="px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
                        disabled={uploadingField === key}
                      >
                        {uploadingField === key ? 'Uploading...' : 'Change Excel'}
                      </button>
                    )}
                    <input
                      id={`file-${key}`}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, key)}
                    />
                  </div>
                </div>
              );
            })}

            {allFieldsDone() && (
              <button
                onClick={() => { setUploadModalEntry(null); navigate(`/dashboard/seating-plan?entryId=${uploadModalEntry._id}`); }}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
              >
                Generate Seating Arrangement
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentInput; 