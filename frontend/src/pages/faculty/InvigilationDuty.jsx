import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';

const InvigilationDuty = () => {
  const user = useAuthStore((s) => s.user);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [statusLoading, setStatusLoading] = useState({});

  useEffect(() => {
    const fetchDutiesAndStatus = async () => {
      try {
        const facultyId = user?.facultyId;
        if (!facultyId) {
          setError('Faculty ID not found. Please log in again.');
          setLoading(false);
          return;
        }
        const [dutiesRes, statusRes] = await Promise.all([
          api.get(`/api/duties/faculty/${facultyId}`),
          api.get(`/api/duties/completed-duties?facultyId=${facultyId}`)
        ]);
        setDuties(dutiesRes.data);
        const map = {};
        statusRes.data.forEach(record => {
          map[record.dutyId] = record.status;
        });
        setStatusMap(map);
      } catch (err) {
        setError('Failed to fetch invigilation duties.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDutiesAndStatus();
  }, [user]);

  const handleStatus = async (dutyId, status) => {
    const facultyId = user?.facultyId;
    const facultyName = user?.name || '';
    if (!facultyId) return;
    setStatusLoading(prev => ({ ...prev, [dutyId]: true }));
    try {
      await api.post('/api/duties/completed-duties', { facultyId, facultyName, dutyId, status });
      setStatusMap(prev => ({ ...prev, [dutyId]: status }));
    } catch (err) {
      alert('Failed to update status.');
      console.error(err);
    } finally {
      setStatusLoading(prev => ({ ...prev, [dutyId]: false }));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Invigilation Duties</h2>
      
      {loading && <p>Loading duties...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hall Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duty Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {duties.length > 0 ? (
                duties.map((duty, index) => (
                  <tr key={duty._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(duty.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {duty.session}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {duty.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {'Invigilator'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {statusMap[duty._id] === 'completed' ? (
                        <span className="text-green-600 font-semibold">Completed</span>
                      ) : statusMap[duty._id] === 'not completed' ? (
                        <span className="text-red-600 font-semibold">Not Completed</span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(duty._id, 'completed')}
                            disabled={statusLoading[duty._id]}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 text-xs"
                          >
                            {statusLoading[duty._id] ? '...' : 'Completed'}
                          </button>
                          <button
                            onClick={() => handleStatus(duty._id, 'not completed')}
                            disabled={statusLoading[duty._id]}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 text-xs"
                          >
                            {statusLoading[duty._id] ? '...' : 'Not Completed'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No duties assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvigilationDuty; 