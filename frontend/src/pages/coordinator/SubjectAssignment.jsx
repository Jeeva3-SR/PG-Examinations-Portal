import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';

const SubjectAssignment = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    courseCode: '',
    courseName: '',
    specialization: '',
    facultyId: '',
    facultyName: '',
    year: '',
    semester: '',
    batch: '',
    academicYear: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchFaculty();
    fetchAssignments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data);
    } catch { setError('Failed to load courses'); }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/api/faculty');
      setFaculty(res.data);
    } catch { setError('Failed to load faculty'); }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/subject-assignments');
      setAssignments(res.data);
    } catch { setError('Failed to load assignments'); }
  };

  const handleCourseSelect = (e) => {
    const code = e.target.value;
    const course = courses.find(c => c.courseCode === code);
    setForm(prev => ({
      ...prev,
      courseCode: code,
      courseName: course ? course.courseName : ''
    }));
  };

  const handleFacultySelect = (e) => {
    const id = e.target.value;
    const f = faculty.find(f => f.facultyId === id);
    setForm(prev => ({
      ...prev,
      facultyId: id,
      facultyName: f ? f.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/api/subject-assignments', form);
      setMessage('Subject assigned successfully');
      setForm({ courseCode: '', courseName: '', specialization: '', facultyId: '', facultyName: '', year: '', semester: '', batch: '', academicYear: '' });
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign subject');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/api/subject-assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  const specializations = [...new Set(courses.map(c => c.college))];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Assign Subjects to Faculty</h2>

        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
            <select value={form.courseCode} onChange={handleCourseSelect} required className="w-full p-2 border rounded-md">
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c.courseCode} value={c.courseCode}>{c.courseCode} - {c.courseName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input type="text" value={form.courseName} readOnly className="w-full p-2 border rounded-md bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization / College</label>
            <select value={form.specialization} onChange={e => setForm(prev => ({ ...prev, specialization: e.target.value }))} required className="w-full p-2 border rounded-md">
              <option value="">Select</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select value={form.facultyId} onChange={handleFacultySelect} required className="w-full p-2 border rounded-md">
              <option value="">Select faculty</option>
              {faculty.map(f => (
                <option key={f.facultyId} value={f.facultyId}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={form.year} onChange={e => setForm(prev => ({ ...prev, year: Number(e.target.value) }))} required className="w-full p-2 border rounded-md">
              <option value="">Select year</option>
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select value={form.semester} onChange={e => setForm(prev => ({ ...prev, semester: Number(e.target.value) }))} required className="w-full p-2 border rounded-md">
              <option value="">Select semester</option>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
              <option value={3}>Semester 3</option>
              <option value={4}>Semester 4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <input type="text" value={form.batch} onChange={e => setForm(prev => ({ ...prev, batch: e.target.value }))} placeholder="e.g. 2024-2026" required className="w-full p-2 border rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input type="text" value={form.academicYear} onChange={e => setForm(prev => ({ ...prev, academicYear: e.target.value }))} placeholder="e.g. 2024-2025" required className="w-full p-2 border rounded-md" />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Assign Subject
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Subject Assignments</h3>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 font-medium">Course Code</th>
                  <th className="p-3 font-medium">Course Name</th>
                  <th className="p-3 font-medium">College</th>
                  <th className="p-3 font-medium">Faculty</th>
                  <th className="p-3 font-medium">Year</th>
                  <th className="p-3 font-medium">Sem</th>
                  <th className="p-3 font-medium">Batch</th>
                  <th className="p-3 font-medium">Acad Year</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{a.courseCode}</td>
                    <td className="p-3">{a.courseName}</td>
                    <td className="p-3">{a.specialization}</td>
                    <td className="p-3">{a.facultyName}</td>
                    <td className="p-3">{a.year}</td>
                    <td className="p-3">{a.semester}</td>
                    <td className="p-3">{a.batch}</td>
                    <td className="p-3">{a.academicYear}</td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAssignment;
