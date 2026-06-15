import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { m } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';

const parseCount = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
};

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
      const res = await api.get(`/api/student-inputs/by-session/${sessionId}`);
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
      const uniqueSpecializations = [...new Set([...sessions.map(session => session.specialization), 'M.E'])];
      setSpecializations(uniqueSpecializations);
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedCourseCode) {
      const course = courses.find(c => c.courseCode === selectedCourseCode);
      if (course) setSelectedCourseName(course.courseName);
      const session = sessions.find(s => s.courseCode === selectedCourseCode);
      setSelectedSession(session || null);
    } else {
      setSelectedCourseName('');
      setSelectedSession(null);
    }
  }, [selectedCourseCode, courses, sessions]);

  useEffect(() => {
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
      const response = await api.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await api.get('/api/student-inputs');
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const res = await api.patch(`/api/student-inputs/${uploadModalEntry._id}/upload`, formData);
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
    try {
      const res = await api.patch(`/api/student-inputs/${uploadModalEntry._id}/status`, { field, status });
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

    const normalize = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const cegRegular = normalize(formData.cegRegular);
    const cegArrear = normalize(formData.cegArrear);
    const mitRegular = normalize(formData.mitRegular);
    const mitArrear = normalize(formData.mitArrear);

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
        const response = await api.put(`/api/student-inputs/${editingId}`, entryData);
        savedEntry = response.data;
        setEntries(entries.map(entry => entry._id === editingId ? savedEntry : entry));
        setEditingId(null);
      } else {
        const response = await api.post('/api/student-inputs', entryData);
        savedEntry = response.data;
        setEntries([...entries, savedEntry]);
      }

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

  const totalCEG = (parseInt(formData.cegRegular) || 0) + (parseInt(formData.cegArrear) || 0);
  const totalMIT = (parseInt(formData.mitRegular) || 0) + (parseInt(formData.mitArrear) || 0);

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Input Management</h1>
            <p className="mt-1 text-sm text-slate-500">Configure core specialization and student details here.</p>
          </div>
        </m.div>

        {/* Input Form Card */}
        <m.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-6">
            {/* Section 1: Course Info */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Course Allocation details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Specialization
                  </label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec, index) => (
                      <option key={spec || index} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Course Selection
                  </label>
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    required
                  >
                    <option value="">Choose Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.courseCode}>
                        {c.courseCode} — {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Section 2: Student Data Count Matrix */}
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Student Counts </h2>
              <div className="space-y-4">
                {/* CEG Stream row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">CEG Regular Count</label>
                    <input
                      type="number"
                      name="cegRegular"
                      value={formData.cegRegular}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">CEG Arrear Count</label>
                    <input
                      type="number"
                      name="cegArrear"
                      value={formData.cegArrear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">CEG total</label>
                    <input
                      type="number"
                      value={totalCEG}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm outline-none"
                      tabIndex={-1}
                    />
                  </div>
                </div>

                {/* MIT Stream row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">MIT Regular Count</label>
                    <input
                      type="number"
                      name="mitRegular"
                      value={formData.mitRegular}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">MIT Arrear Count</label>
                    <input
                      type="number"
                      name="mitArrear"
                      value={formData.mitArrear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">MIT total</label>
                    <input
                      type="number"
                      value={totalMIT}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm outline-none"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summaries Block */}
            <div className="grid grid-cols-3 gap-4 bg-slate-900 text-white p-5 rounded-xl mt-4">
              <div className="text-center border-r border-slate-800">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Regular</span>
                <span className="text-xl font-bold tracking-tight">{formData.totalRegular}</span>
              </div>
              <div className="text-center border-r border-slate-800">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Arrear</span>
                <span className="text-xl font-bold tracking-tight">{formData.totalArrear}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-400">Grand Total</span>
                <span className="text-xl font-bold tracking-tight text-amber-400">{formData.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3.5 flex justify-end border-t border-slate-200">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              {editingId ? 'Update' : 'Submit'}
            </button>
          </div>
        </m.form>

        {/* Dynamic Data Table */}
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {entries.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70">
                <h2 className="text-base font-semibold text-slate-900">Submitted Entries</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3">Specialization</th>
                      <th className="px-6 py-3">Course Catalog</th>
                      <th className="px-6 py-3 text-center">CEG</th>
                      <th className="px-6 py-3 text-center">MIT</th>
                      <th className="px-6 py-3 text-center">Total</th>
                      <th className="px-6 py-3 text-center">Upload status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{entry.specialization}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{entry.courseCode}</div>
                          <div className="text-xs text-slate-400">{entry.courseName}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-medium">{entry.cegRegular + entry.cegArrear}</td>
                        <td className="px-6 py-4 text-center font-mono font-medium">{entry.mitRegular + entry.mitArrear}</td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-blue-600">{entry.total}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {['cegRegular', 'cegArrear', 'mitRegular', 'mitArrear'].map(f => {
                              const status = entry[f + 'Status'] || 'pending';
                              const styles = status === 'uploaded' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : status === 'skipped' 
                                ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-amber-50 text-amber-600 border-amber-200';
                              return (
                                <span 
                                  key={f} 
                                  title={`${f}: ${status}`} 
                                  className={`w-5 h-5 flex items-center justify-center rounded-md border text-[10px] font-bold ${styles}`}
                                >
                                  {status === 'uploaded' ? '✓' : status === 'skipped' ? '–' : '○'}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(entry)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenUploadModal(entry)}
                            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                          >
                            Upload Student Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </m.div>
      </div>

      {/* Upload Matrix Dialog Modal */}
      {uploadModalEntry && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Import Student Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {uploadModalEntry.courseCode} — {uploadModalEntry.courseName} ({uploadModalEntry.specialization})
                </p>
              </div>
              <button 
                onClick={() => setUploadModalEntry(null)} 
                className="text-slate-400 hover:text-slate-600 text-2xl transition-colors outline-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { key: 'cegRegularStatus', label: 'CEG Regular ', count: uploadModalEntry.cegRegular },
                { key: 'cegArrearStatus', label: 'CEG Arrear ', count: uploadModalEntry.cegArrear },
                { key: 'mitRegularStatus', label: 'MIT Regular ', count: uploadModalEntry.mitRegular },
                { key: 'mitArrearStatus', label: 'MIT Arrear ', count: uploadModalEntry.mitArrear }
              ].map(({ key, label, count }) => {
                const status = localStatuses[key];
                const isZero = count === 0;
                const isUploaded = status === 'uploaded';
                const isSkipped = status === 'skipped';
                const isDone = isUploaded || isSkipped;

                return (
                  <div key={key} className={`border rounded-lg p-4 flex items-center justify-between transition-all ${
                    isUploaded ? 'bg-green-50/50 border-green-200' :
                    isSkipped ? 'bg-slate-50 border-slate-200 opacity-60' :
                    isZero ? 'bg-slate-50/60 border-slate-200/60 opacity-50' :
                    'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">{label}</span>
                        <span className="text-xs text-slate-400 font-mono">({count} Headcount)</span>
                      </div>
                      <div className="mt-1">
                        {isUploaded && <span className="text-[11px] text-green-600 font-medium inline-flex items-center gap-1">✓ Storage verification verified</span>}
                        {(isSkipped || (isDone && isZero)) && <span className="text-[11px] text-slate-400 font-medium">Excluded from execution pipeline</span>}
                        {!isDone && !isZero && <span className="text-[11px] text-amber-500 font-medium"></span>}
                      </div>
                    </div>

                    <div>
                      {isZero && !isDone && (
                        <button
                          onClick={() => handleUploadOrSkip(key, 'skipped')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                        >
                          Skip Field
                        </button>
                      )}
                      {!isZero && !isDone && (
                        <button
                          onClick={() => document.getElementById(`file-${key}`).click()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                          disabled={uploadingField === key}
                        >
                          {uploadingField === key ? 'Uploading...' : 'Attach Sheet'}
                        </button>
                      )}
                      {isUploaded && (
                        <button
                          onClick={() => document.getElementById(`file-${key}`).click()}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                          disabled={uploadingField === key}
                        >
                          {uploadingField === key ? 'Processing...' : 'Overwrite'}
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
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
              {allFieldsDone() ? (
                <button
                  onClick={() => { setUploadModalEntry(null); navigate(`/dashboard/seating-plan?entryId=${uploadModalEntry._id}`); }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
                >
                  Generate Seating Layout
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400 py-1 font-medium">
                  Provide assets for all structural fields to unlock execution layout pipelines.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentInput;