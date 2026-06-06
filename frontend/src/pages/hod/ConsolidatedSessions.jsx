import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ConsolidatedSessions = () => {
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both student inputs and sessions
        const [studentInputsRes, sessionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/student-inputs'),
          axios.get('http://localhost:5000/api/sessions')
        ]);

        const studentInputs = studentInputsRes.data;
        const sessions = sessionsRes.data;

        // Create a map of sessions for quick lookup
        const sessionMap = new Map();
        sessions.forEach(session => {
          const key = `${session.courseCode}-${session.specialization}`;
          sessionMap.set(key, session);
        });

        // Combine the data
        const consolidated = studentInputs.map(input => {
          const sessionKey = `${input.courseCode}-${input.specialization}`;
          const session = sessionMap.get(sessionKey);
          
          return {
            id: input._id,
            date: session ? new Date(session.date).toLocaleDateString('en-GB') : input.date,
            session: session ? session.session : input.session,
            specialization: input.specialization,
            courseCode: input.courseCode,
            courseName: input.courseName,
            totalCEG: input.totalCEG
          };
        });

        // Sort by date and session
        consolidated.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          if (dateA === dateB) {
            return a.session.localeCompare(b.session);
          }
          return dateA - dateB;
        });

        setConsolidatedData(consolidated);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Consolidated Sessions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Specialization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total CEG
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consolidatedData.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.session}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.specialization}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.courseCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.courseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.totalCEG}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsolidatedSessions; 