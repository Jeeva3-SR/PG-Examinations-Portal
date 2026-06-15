import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TimetableUpload from '../../components/TimetableUpload';
import SessionReportModal from '../../components/SessionReportModal';

const DEPARTMENT_OPTIONS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Mathematics',
  'Physics',
  'Civil Engineering',
  'Electrical Engineering',
];

const DUPLICATE_ALERT = 'This session entity is already present. Same date, session slot, department, and course code cannot be duplicated.';

const VIEW_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'future', label: 'Future' },
  { id: 'cancelled', label: 'Cancelled' },
];

const STICKY_HEAD = 'sticky left-0 z-30 bg-blue-100 border-r border-slate-300 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)]';

const toDateInputValue = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const getDisplayStatus = (session) => {
  if (session.displayStatus) return session.displayStatus;
  if (session.status === 'cancelled') return 'cancelled';
  if (session.rescheduleType === 'prepone' || session.rescheduleType === 'postpone') return 'rescheduled';
  const sessionKey = toDateInputValue(session.date);
  const todayKey = getTodayKey();
  if (sessionKey && sessionKey < todayKey) return 'completed';
  return 'active';
};

const getStatusLabel = (status) => {
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'rescheduled') return 'Rescheduled';
  if (status === 'completed') return 'Completed';
  return 'Scheduled';
};

const matchesViewFilter = (session, filter) => {
  const status = getDisplayStatus(session);
  const sessionKey = toDateInputValue(session.date);
  const todayKey = getTodayKey();

  switch (filter) {
    case 'completed':
      return status !== 'cancelled' && sessionKey && sessionKey < todayKey;
    case 'future':
      return status !== 'cancelled' && sessionKey && sessionKey >= todayKey;
    case 'cancelled':
      return status === 'cancelled';
    case 'all':
    default:
      return true;
  }
};

const getRowClassName = (session) => {
  const status = getDisplayStatus(session);
  if (status === 'cancelled') return 'bg-red-50';
  if (status === 'rescheduled') return 'bg-blue-50';
  if (status === 'completed') return 'bg-green-50';
  return 'bg-white hover:bg-slate-50';
};

const stickyCellClass = (rowBg) =>
  `sticky left-0 z-20 ${rowBg} border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.1)] px-2 py-4 text-center min-w-[52px]`;

const PencilIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 20h9" strokeLinecap="round" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const isDuplicateSession = (sessions, { date, session, courseCode, department, excludeId }) => {
  const code = String(courseCode).trim().toUpperCase();
  const dept = String(department || '').trim();
  return sessions.some((s) => {
    if (excludeId && s._id === excludeId) return false;
    if (s.status === 'cancelled') return false;
    return (
      toDateInputValue(s.date) === date
      && s.session === session
      && String(s.courseCode).trim().toUpperCase() === code
      && String(s.department || '').trim() === dept
    );
  });
};

const DepartmentSelect = ({ value, onChange, className = '' }) => {
  const options = [...DEPARTMENT_OPTIONS];
  if (value && !options.includes(value)) {
    options.unshift(value);
  }

  return (
    <select value={value} onChange={onChange} className={className}>
      <option value="">Select Department</option>
      {options.map((dept) => (
        <option key={dept} value={dept}>{dept}</option>
      ))}
    </select>
  );
};

const SessionView = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [viewFilter, setViewFilter] = useState('all');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    session: 'FN',
    specialization: '',
    department: '',
    courseCode: '',
    courseName: '',
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/sessions');
      setSessions(res.data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    api.get('/api/courses').then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSession = async () => {
    if (!newSession.department) {
      alert('Please select a department.');
      return;
    }
    if (!newSession.date || !newSession.courseCode) {
      alert('Please fill all required fields.');
      return;
    }

    if (isDuplicateSession(sessions, newSession)) {
      alert(DUPLICATE_ALERT);
      return;
    }

    try {
      await api.post('/api/sessions', newSession);
      alert('Session added successfully!');
      setNewSession({
        date: '',
        session: 'FN',
        specialization: '',
        department: '',
        courseCode: '',
        courseName: '',
      });
      fetchSessions();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to add session.';
      alert(msg);
    }
  };

  const startEdit = (session) => {
    setEditingId(session._id);
    setEditForm({
      date: toDateInputValue(session.date),
      day: session.day || '',
      session: session.session,
      department: session.department || '',
      courseCode: session.courseCode,
      courseName: session.courseName,
      specialization: session.specialization,
      originalDate: toDateInputValue(session.date),
      originalSession: session.session,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setRescheduleModal(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const scheduleChanged = (form) => form.date !== form.originalDate || form.session !== form.originalSession;

  const submitEdit = async (rescheduleData = null) => {
    if (!editForm.department) {
      alert('Department name is required.');
      return;
    }

    if (isDuplicateSession(sessions, {
      date: editForm.date,
      session: editForm.session,
      courseCode: editForm.courseCode,
      department: editForm.department,
      excludeId: editingId,
    })) {
      alert(DUPLICATE_ALERT);
      return;
    }

    const changed = scheduleChanged(editForm);
    if (changed && !rescheduleData) {
      setRescheduleModal({
        rescheduleType: 'postpone',
        rescheduleReason: '',
      });
      return;
    }

    if (changed && (!rescheduleData.rescheduleType || !rescheduleData.rescheduleReason.trim())) {
      alert('Pre-pone/Postpone selection and reason are required when changing date or session.');
      return;
    }

    try {
      const payload = {
        date: editForm.date,
        day: editForm.day,
        session: editForm.session,
        department: editForm.department,
        courseCode: editForm.courseCode,
        courseName: editForm.courseName,
        specialization: editForm.specialization,
      };

      if (changed) {
        payload.rescheduleType = rescheduleData.rescheduleType;
        payload.rescheduleReason = rescheduleData.rescheduleReason.trim();
      }

      await api.patch(`/api/sessions/${editingId}`, payload);
      alert(changed
        ? 'Session updated and assigned faculty notified about the schedule change.'
        : 'Session updated successfully!');
      cancelEdit();
      fetchSessions();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update session.';
      alert(msg);
    }
  };

  const buildImpactMessage = (impact, actionLabel) => {
    const lines = [];
    if (impact.hasStudents) {
      lines.push(`- ${impact.studentInputCount} student input record(s) will be kept (not deleted)`);
    }
    if (impact.hasSeating) {
      lines.push(`- ${impact.seatingCount} seating arrangement(s) will be released`);
    }
    if (impact.hasDuties) {
      lines.push(`- ${impact.dutyCount} assigned duty(s) will be freed`);
    }
    if (lines.length === 0) return '';
    return ['', `This session has linked allocations:`, ...lines, '', `Assigned faculty will be notified about the ${actionLabel}.`, '', 'Do you want to continue?'].join('\n');
  };

  const handleCancelSession = async (session) => {
    let impact = { hasStudents: false, hasSeating: false, hasDuties: false, studentInputCount: 0 };
    try {
      const impactRes = await api.get(`/api/sessions/${session._id}/delete-impact`);
      impact = impactRes.data;
    } catch {
      // continue with basic confirmation
    }

    let confirmMessage = `Cancel session for ${session.courseCode} - ${session.courseName}?`;
    confirmMessage += buildImpactMessage(impact, 'cancellation') || '\n\nAssigned faculty will be notified about the cancellation.';

    if (!window.confirm(confirmMessage)) return;

    const cancelReason = window.prompt('Enter cancellation reason (optional):') || '';

    try {
      const res = await api.post(`/api/sessions/${session._id}/cancel`, { cancelReason });
      const notified = res.data?.notified || 0;
      alert(`Session cancelled and marked in red. ${notified} assigned person(s) notified.`);
      fetchSessions();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to cancel session.';
      alert(msg);
    }
  };

  const handleDeleteSession = async (session) => {
    let impact = { hasStudents: false, hasSeating: false, hasDuties: false, studentInputCount: 0 };
    try {
      const impactRes = await api.get(`/api/sessions/${session._id}/delete-impact`);
      impact = impactRes.data;
    } catch {
      // proceed with basic confirmation if impact check fails
    }

    let confirmMessage = `Delete session for ${session.courseCode} on ${toDateInputValue(session.date)} (${session.session})?`;
    confirmMessage += buildImpactMessage(impact, 'deletion') || '\n\nAssigned invigilators, QP setters, and faculty will be notified.';

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await api.delete(`/api/sessions/${session._id}`);
      const notified = res.data?.notified || 0;
      const cleanup = res.data?.cleanup;
      let successMsg = `Session deleted. ${notified} assigned person(s) notified.`;
      if (cleanup) {
        if (cleanup.studentInputsPreserved > 0) {
          successMsg += ` ${cleanup.studentInputsPreserved} student input record(s) preserved.`;
        }
        if (cleanup.seatingDeleted > 0) {
          successMsg += ` ${cleanup.seatingDeleted} seating arrangement(s) released.`;
        }
        if (cleanup.dutiesDeleted > 0) {
          successMsg += ` ${cleanup.dutiesDeleted} duty assignment(s) freed.`;
        }
      }
      alert(successMsg);
      fetchSessions();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete session.';
      alert(msg);
    }
  };

  const filteredSessions = sessions.filter((s) => matchesViewFilter(s, viewFilter));

  const renderRow = (s) => {
    const isEditing = editingId === s._id;
    const rowBg = isEditing ? 'bg-yellow-50' : getRowClassName(s);

    if (isEditing && editForm) {
      return (
        <tr key={s._id} className={rowBg}>
          <td className={stickyCellClass(rowBg)}>
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => submitEdit()}
                title="Save"
                className="p-1.5 rounded-md text-green-700 hover:bg-green-100"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                title="Cancel edit"
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
          </td>
          <td className="px-3 py-2">
            <input type="date" value={editForm.date} onChange={(e) => handleEditChange('date', e.target.value)} className="w-full p-1 border rounded text-sm" />
          </td>
          <td className="px-3 py-2">
            <input type="text" value={editForm.day} onChange={(e) => handleEditChange('day', e.target.value)} className="w-full p-1 border rounded text-sm" />
          </td>
          <td className="px-3 py-2">
            <select value={editForm.session} onChange={(e) => handleEditChange('session', e.target.value)} className="w-full p-1 border rounded text-sm">
              <option value="FN">FN</option>
              <option value="AN">AN</option>
            </select>
          </td>
          <td className="px-3 py-2">
            <DepartmentSelect value={editForm.department} onChange={(e) => handleEditChange('department', e.target.value)} className="w-full p-1 border rounded text-sm" />
          </td>
          <td className="px-3 py-2">
            <input type="text" value={editForm.courseCode} onChange={(e) => handleEditChange('courseCode', e.target.value)} className="w-full p-1 border rounded text-sm" />
          </td>
          <td className="px-3 py-2">
            <input type="text" value={editForm.courseName} onChange={(e) => handleEditChange('courseName', e.target.value)} className="w-full p-1 border rounded text-sm" />
          </td>
          <td className="px-3 py-2">
            <input type="text" value={editForm.specialization} onChange={(e) => handleEditChange('specialization', e.target.value)} className="w-full p-1 border rounded text-sm" />
          </td>
          <td className="px-3 py-2 text-xs text-slate-500">Editing</td>
          <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-400">—</td>
        </tr>
      );
    }

    return (
      <tr key={s._id} className={`${rowBg} transition duration-200`}>
        <td className={stickyCellClass(rowBg)}>
          {s.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => startEdit(s)}
              title="Edit session"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-700 hover:bg-blue-100 hover:text-blue-900"
            >
              <PencilIcon />
            </button>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
          {s.date ? new Date(s.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
          }) : 'Invalid Date'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.day}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{s.session}</span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-900 whitespace-normal min-w-[180px]">{s.department || 'Unassigned'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.courseCode}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.courseName}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.specialization}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            getDisplayStatus(s) === 'cancelled' ? 'bg-red-200 text-red-900'
              : getDisplayStatus(s) === 'rescheduled' ? 'bg-blue-200 text-blue-900'
                : getDisplayStatus(s) === 'completed' ? 'bg-green-200 text-green-900'
                  : 'bg-slate-200 text-slate-800'
          }`}>
            {getStatusLabel(getDisplayStatus(s))}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          {s.status !== 'cancelled' && (
            <>
              <button
                onClick={() => navigate(`/student-input?sessionId=${s._id}&specialization=${encodeURIComponent(s.specialization)}&courseCode=${encodeURIComponent(s.courseCode)}&courseName=${encodeURIComponent(s.courseName)}&date=${encodeURIComponent(s.date)}&session=${s.session}`)}
                className="text-green-600 hover:text-green-900"
              >
                Enter Students
              </button>
              <button
                onClick={() => navigate(`/duties?date=${encodeURIComponent(s.date)}&session=${s.session}`)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Assign Duties
              </button>
              <button onClick={() => handleCancelSession(s)} className="text-orange-600 hover:text-orange-900">Cancel</button>
            </>
          )}
          <button onClick={() => handleDeleteSession(s)} className="text-red-600 hover:text-red-900">Delete</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 to-blue-50 font-sans">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl">
          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-wide text-slate-900">Session Timetable</h1>
            <p className="text-slate-900 text-lg">Upload and manage examination timetables</p>
          </m.div>

          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }} className="bg-white shadow-xl rounded-2xl p-6 mb-8">
            <TimetableUpload onUploadSuccess={fetchSessions} departmentOptions={DEPARTMENT_OPTIONS} />
          </m.div>

          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Add New Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <input type="date" name="date" value={newSession.date} onChange={handleNewSessionChange} className="p-2 border rounded-md" />
              <select name="session" value={newSession.session} onChange={handleNewSessionChange} className="p-2 border rounded-md">
                <option value="FN">FN</option>
                <option value="AN">AN</option>
              </select>
              <DepartmentSelect value={newSession.department} onChange={(e) => setNewSession((prev) => ({ ...prev, department: e.target.value }))} className="p-2 border rounded-md w-full" />
              <select name="specialization" value={newSession.specialization} onChange={handleNewSessionChange} className="p-2 border rounded-md">
                <option value="">Select Specialization</option>
                <option value="B.E">B.E</option>
                <option value="M.E">M.E</option>
              </select>
              <select
                name="courseCode"
                value={newSession.courseCode}
                onChange={(e) => {
                  const code = e.target.value;
                  const course = courses.find((c) => c.courseCode === code);
                  setNewSession((prev) => ({ ...prev, courseCode: code, courseName: course ? course.courseName : '' }));
                }}
                className="p-2 border rounded-md"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.courseCode}>{c.courseCode} - {c.courseName}</option>
                ))}
              </select>
              <input type="text" name="courseName" placeholder="Course Name" value={newSession.courseName} readOnly className="p-2 border rounded-md bg-gray-50" />
            </div>
            <button onClick={handleAddSession} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Session</button>
          </div>

          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }} className="bg-white shadow-xl rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold tracking-wide text-slate-900">Session List</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setReportModalOpen(true)} className="px-4 py-1.5 rounded-full text-sm font-medium bg-slate-800 text-white hover:bg-slate-900 shadow">Print / PDF Report</button>
                {VIEW_FILTERS.map((option) => (
                  <button key={option.id} type="button" onClick={() => setViewFilter(option.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${viewFilter === option.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Showing {filteredSessions.length} of {sessions.length} session(s)
              {viewFilter !== 'all' && ` — ${VIEW_FILTERS.find((f) => f.id === viewFilter)?.label} view`}
            </p>
            <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-700">
              <span className="inline-flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-50 border border-green-200" /> Completed</span>
              <span className="inline-flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-50 border border-blue-200" /> Rescheduled</span>
              <span className="inline-flex items-center gap-2"><span className="w-4 h-4 rounded bg-white border border-slate-200" /> Scheduled</span>
              <span className="inline-flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-50 border border-red-200" /> Cancelled</span>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className={`${STICKY_HEAD} px-2 py-3 text-center text-xs font-medium text-slate-900 uppercase tracking-wider w-[52px]`} aria-label="Edit" />
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Course Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Course Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Specialization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-10 text-center text-sm text-slate-500">No sessions match the selected view.</td>
                      </tr>
                    ) : (
                      filteredSessions.map((s) => renderRow(s))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </m.div>
        </div>
      </div>

      <SessionReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} sessions={sessions} />

      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Schedule Change</h3>
            <p className="text-sm text-slate-600 mb-4">Select pre-pone or postpone and provide a reason. Assigned faculty will be notified.</p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="rescheduleType" value="prepone" checked={rescheduleModal.rescheduleType === 'prepone'} onChange={() => setRescheduleModal((prev) => ({ ...prev, rescheduleType: 'prepone' }))} />
                  Pre-pone
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="rescheduleType" value="postpone" checked={rescheduleModal.rescheduleType === 'postpone'} onChange={() => setRescheduleModal((prev) => ({ ...prev, rescheduleType: 'postpone' }))} />
                  Postpone
                </label>
              </div>
              <textarea value={rescheduleModal.rescheduleReason} onChange={(e) => setRescheduleModal((prev) => ({ ...prev, rescheduleReason: e.target.value }))} placeholder="Enter reason (required)" className="w-full p-2 border rounded-md text-sm min-h-[100px]" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setRescheduleModal(null)} className="px-4 py-2 text-sm text-gray-700">Back</button>
              <button onClick={() => submitEdit(rescheduleModal)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm & Notify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionView;
