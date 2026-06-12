import React, { useState, useEffect } from 'react';
import api from '../lib/api';

const AllSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/courses');
        setSubjects(res.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 animate-fadeIn text-left space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">All Subjects</h2>
        <p className="text-xs text-slate-400 mt-0.5">Master list of all courses and subjects offered.</p>
      </div>
      {subjects.length === 0 ? (
        <p className="text-gray-500">No subjects found.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Code</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Name</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">College</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Students</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {subjects.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono text-indigo-600 font-bold">{s.courseCode}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800">{s.courseName}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{s.college || '-'}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{s.type || '-'}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{s.studentCount || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllSubjects;
