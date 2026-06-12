import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Calendar, Clock, Building2, Users, AlertCircle, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const sessionOptions = [
  { value: 'FN', label: 'FN' },
  { value: 'AN', label: 'AN' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const SeatingArrangement = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [session, setSession] = useState('');
  const [rooms, setRooms] = useState([]);
  const [sessionDates, setSessionDates] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [arrangements, setArrangements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchSessionDates();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/api/seating-arrangement/rooms');
      setRooms(response.data);
    } catch (error) {
      setError('Failed to fetch rooms');
    }
  };

  const fetchSessionDates = async () => {
    try {
      // Fetch all sessions from the backend
      const response = await api.get('/api/sessions');
      // Extract unique dates from the session objects
      const sessions = response.data;
      const uniqueDatesSet = new Set();
      sessions.forEach(session => {
        if (session.date) {
          // Normalize to ISO date string (yyyy-mm-dd)
          const dateStr = new Date(session.date).toISOString().split('T')[0];
          uniqueDatesSet.add(dateStr);
        }
      });
      // Convert set to array and sort
      const uniqueDates = Array.from(uniqueDatesSet).sort();
      setSessionDates(uniqueDates);
    } catch (error) {
      setError('Failed to fetch session dates');
    }
  };

  const generateArrangement = async () => {
    if (!date || !session) {
      setError('Please select both date and session');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/seating-arrangement/generate', {
        date,
        session
      });
      setArrangements(response.data.arrangements || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate seating arrangement');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!arrangements.length) return;

    const doc = new jsPDF();
    let y = 10;

    arrangements.forEach((room, idx) => {
      if (idx > 0) doc.addPage();

      doc.setFontSize(16);
      doc.text(`Room: ${room.roomNumber} (${room.floor})`, 14, y);
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(room.date).toLocaleDateString()} | Session: ${room.session}`, 14, y + 8);

      autoTable(doc, {
        startY: y + 14,
        head: [['Seat No', 'Reg No', 'Name', 'Course Code', 'Specialization']],
        body: room.students.map(s => [
          s.seatNo,
          s.regNo,
          s.studentName,
          s.courseCode,
          s.specialization
        ]),
        styles: { fontSize: 11, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });
    });

    doc.save('seating-arrangement.pdf');
  };

  return (
      <div className="max-w-6xl mx-auto p-6">
        <m.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl"
        >
          <m.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-3xl font-bold mb-6"
          >
            Seating Arrangement
          </m.h1>
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Selection Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generate New Arrangement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span>Select Date</span>
                      </div>
                    </label>
                    <Select value={date} onValueChange={setDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a date" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span>Select Session</span>
                      </div>
                    </label>
                    <Select value={session} onValueChange={setSession}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    onClick={generateArrangement}
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    {loading ? 'Generating...' : 'Generate Arrangement'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Arrangements Display */}
            {arrangements.length > 0 && (
              <>
                <div className="bg-gray-100 p-4 rounded mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {arrangements.map((room, idx) => (
                          <tr key={room._id || room.roomNumber || idx}>
                            <td className="px-4 py-2 whitespace-nowrap">{room.roomNumber}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{new Date(room.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{room.session}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{room.floor}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{room.students.length}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <button
                                onClick={() => navigate(`/duties?date=${encodeURIComponent(room.date)}&session=${room.session}`)}
                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <UserPlus size={14} />
                                Assign Invigilator
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                <button
                  onClick={downloadPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
                >
                  Download PDF
                </button>
              </>
            )}
          </m.div>
        </m.div>
      </div>
  );
};

export default SeatingArrangement; 