import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

const InvigilationDuty = () => {
  const [duties, setDuties] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDuties();
    }
  }, [dateRange]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchDuties = async () => {
    try {
      const response = await axios.get(
        `/api/duties/range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      setDuties(response.data);
    } catch (error) {
      console.error('Error fetching duties:', error);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const handleGenerateDuties = async () => {
    if (!selectedSession) return;

    try {
      await axios.post(`/api/duties/generate/${selectedSession}`);
      fetchDuties();
    } catch (error) {
      console.error('Error generating duties:', error);
    }
  };

  const handleStatusChange = async (dutyId, newStatus) => {
    try {
      await axios.patch(`/api/duties/${dutyId}`, {
        status: newStatus,
      });
      fetchDuties();
    } catch (error) {
      console.error('Error updating duty status:', error);
    }
  };

  const generateAdvanceClaimLetter = (duty) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text('Advance Claim Request', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Examination Cell', pageWidth / 2, 30, { align: 'center' });

    // Content
    doc.setFontSize(10);
    doc.text(`Faculty Name: ${duty.invigilator.name}`, 20, 50);
    doc.text(`Department: ${duty.invigilator.department}`, 20, 60);
    doc.text(`Employee ID: ${duty.invigilator.employeeId}`, 20, 70);
    doc.text(`Date: ${format(new Date(duty.date), 'MMMM d, yyyy')}`, 20, 80);
    doc.text(`Session: ${duty.session}`, 20, 90);
    doc.text(`Room: ${duty.room}`, 20, 100);
    doc.text(`Course: ${duty.courseCode.courseCode}`, 20, 110);

    // Footer
    doc.setFontSize(10);
    doc.text('Authorized Signature', 20, 150);
    doc.text('Examination Cell', 20, 160);

    // Save the PDF
    doc.save(`Advance_Claim_${duty.invigilator.employeeId}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Invigilation Duty</h1>

      <div className="card">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Session for Duty Generation
            </label>
            <div className="flex space-x-4">
              <select
                value={selectedSession || ''}
                onChange={handleSessionChange}
                className="input-field flex-1"
              >
                <option value="">Select a session</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {format(new Date(session.date), 'MMM d, yyyy')} - {session.session} -{' '}
                    {session.courseCode.courseCode}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerateDuties}
                className="btn-primary"
                disabled={!selectedSession}
              >
                Generate Duties
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Duty List</h2>
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
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invigilator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {duties.map((duty) => (
                <tr key={duty._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(duty.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {duty.session}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {duty.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {duty.courseCode.courseCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {duty.invigilator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={duty.status}
                      onChange={(e) => handleStatusChange(duty._id, e.target.value)}
                      className="text-sm text-gray-900 border-0 focus:ring-0"
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => generateAdvanceClaimLetter(duty)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Generate Letter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvigilationDuty; 