import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignedCourses = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const loggedInFaculty = localStorage.getItem('loggedInFaculty');
        const token = localStorage.getItem('token');

        if (!loggedInFaculty) {
          setError('User profile session data missing. Please try logging in again.');
          setLoading(false);
          return;
        }

        const facultyInfo = JSON.parse(loggedInFaculty);
        const facultyId = facultyInfo.facultyId || facultyInfo.userId;

        if (!facultyId) {
          setError('Faculty ID not found in profile.');
          setLoading(false);
          return;
        }

        const res = await axios.get('/api/subject-assignments');
        const myAssignments = res.data.filter(a => a.facultyId === facultyId);
        setAssignments(myAssignments);
      } catch (err) {
        setError('Failed to fetch assigned subjects.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl max-w-2xl mx-auto text-left flex items-start space-x-2 font-medium" role="alert">
        <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-xl max-w-2xl mx-auto text-left flex items-start space-x-2 font-medium" role="alert">
        <svg className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>No subjects assigned yet.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 animate-fadeIn text-left space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Assigned Subjects</h2>
        <p className="text-xs text-slate-400 mt-0.5">Subjects mapped to you by the coordinator.</p>
      </div>

      <div className="overflow-hidden border border-slate-100 rounded-xl bg-slate-50/50">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Code</th>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Name</th>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">College</th>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Year</th>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Semester</th>
              <th scope="col" className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Batch</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {assignments.map(a => (
              <tr key={a._id} className="hover:bg-slate-50/40 transition-colors">
                <td className="py-4 px-6 text-sm font-mono text-indigo-600 font-bold">{a.courseCode}</td>
                <td className="py-4 px-6 text-sm font-semibold text-slate-800">{a.courseName}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{a.specialization}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{a.year}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{a.semester}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{a.batch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedCourses;
