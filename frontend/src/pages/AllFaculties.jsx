import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllFaculties = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.filter(u => u.role === 'faculty'));
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">All Faculties</h2>
        <p className="text-xs text-slate-400 mt-0.5">Complete list of registered faculty members.</p>
      </div>
      {users.length === 0 ? (
        <p className="text-gray-500">No faculties found.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Faculty ID</th>
                <th className="text-left py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800">{u.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{u.email}</td>
                  <td className="py-4 px-6 text-sm font-mono text-indigo-600 font-bold">{u.userId || u.employeeId}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{u.department || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllFaculties;
