import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { m } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, UserCheck } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}-${month}-${year}`;
};

const DutyAssignment = () => {
    const [searchParams] = useSearchParams();
    const [dateSessions, setDateSessions] = useState([]);
    const [selectedDateSession, setSelectedDateSession] = useState('');
    const [rooms, setRooms] = useState([]);
    const [allAssignedDuties, setAllAssignedDuties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allFaculty, setAllFaculty] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [roomStudentCount, setRoomStudentCount] = useState({});
    const [selectedFacultyByRoom, setSelectedFacultyByRoom] = useState({});

    const fetchAllDuties = useCallback(() => {
        api.get('/api/duties')
            .then(response => setAllAssignedDuties(response.data))
            .catch(() => setError('Failed to fetch the list of assigned duties.'));
    }, []);

    const fetchAllFaculty = useCallback(async () => {
        try {
            const response = await api.get('/api/faculty');
            setAllFaculty(response.data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    }, []);

    useEffect(() => {
        fetchAllDuties();
        fetchAllFaculty();
        api.get('/api/duties/dates')
            .then(response => setDateSessions(response.data))
            .catch(() => setError('Failed to fetch exam dates and sessions.'));
        api.get('/api/duties/completed-duties')
            .then(res => {
                const map = {};
                res.data.forEach(record => {
                    if (record.dutyId) map[record.dutyId] = record.status;
                });
                setStatusMap(map);
            })
            .catch(() => {});
    }, [fetchAllDuties, fetchAllFaculty]);

    // Auto-select date/session from URL query params
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const sessionParam = searchParams.get('session');
        if (dateParam && sessionParam && dateSessions.length > 0 && !selectedDateSession) {
            const dateStr = new Date(dateParam).toISOString().split('T')[0];
            const match = dateSessions.find(ds => {
                const dsDateStr = new Date(ds.date).toISOString().split('T')[0];
                return dsDateStr === dateStr && ds.session === sessionParam;
            });
            if (match) {
                setSelectedDateSession(JSON.stringify({ date: match.date, session: match.session }));
            }
        }
    }, [dateSessions, searchParams, selectedDateSession]);

    // Load rooms and student counts when date/session changes
    useEffect(() => {
        setRooms([]);
        setSelectedFacultyByRoom({});
        if (selectedDateSession) {
            const { date, session } = JSON.parse(selectedDateSession);
            api.get(`/api/duties/rooms?date=${date}&session=${session}`)
                .then(async (response) => {
                    const roomList = response.data;
                    setRooms(roomList);
                    // Fetch student counts for all rooms
                    const counts = {};
                    await Promise.all(roomList.map(async (room) => {
                        try {
                            const summaryRes = await api.get(`/api/seating-arrangement/room-summary?date=${date}&session=${session}&room=${room}`);
                            counts[room] = summaryRes.data.studentCount || 0;
                        } catch {
                            counts[room] = 0;
                        }
                    }));
                    setRoomStudentCount(counts);
                })
                .catch(() => setError('Failed to fetch rooms for the selected session.'));
        }
    }, [selectedDateSession]);

    const assignDutyToRoom = async (room, facultyId) => {
        if (!facultyId || !selectedDateSession) return;
        const { date, session } = JSON.parse(selectedDateSession);
        const faculty = allFaculty.find(f => f.facultyId === facultyId || f._id === facultyId);
        if (!faculty) return;

        setIsLoading(true);
        setError(null);
        try {
            const duty = {
                facultyId: faculty.facultyId || faculty._id,
                facultyName: faculty.name,
                room,
                date,
                session
            };
            const response = await api.post('/api/duties', [duty]);
            setAllAssignedDuties(prev => [...prev, ...response.data]);
            setSelectedFacultyByRoom(prev => ({ ...prev, [room]: '' }));
        } catch (error) {
            setError('Failed to assign duty.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeDuty = async (dutyId) => {
        if (!window.confirm('Remove this invigilator from the room?')) return;
        setIsLoading(true);
        try {
            await api.delete(`/api/duties/${dutyId}`);
            setAllAssignedDuties(prev => prev.filter(d => d._id !== dutyId));
            setStatusMap(prev => {
                const newMap = { ...prev };
                delete newMap[dutyId];
                return newMap;
            });
            try {
                await api.delete(`/api/duties/completed-duties/${dutyId}`);
            } catch {}
        } catch (error) {
            setError('Failed to remove duty.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatus = async (dutyId, status) => {
        const duty = allAssignedDuties.find(d => d._id === dutyId);
        if (!duty) return;
        try {
            await api.post('/api/duties/completed-duties', {
                dutyId: duty._id, facultyId: duty.facultyId,
                facultyName: duty.facultyName, status
            });
            setStatusMap(prev => ({ ...prev, [dutyId]: status }));
        } catch (err) {
            alert('Failed to update status.');
            console.error(err);
        }
    };

    const getDutiesForRoom = (room) => {
        if (!selectedDateSession) return [];
        let session;
        try { session = JSON.parse(selectedDateSession).session; } catch { return []; }
        return allAssignedDuties.filter(d => d.room === room && d.session === session);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <m.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white shadow-xl rounded-2xl p-6 mb-8"
            >
                <h1 className="text-3xl font-bold mb-6">Duty Assignment</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        {error}
                        <button className="float-right font-bold" onClick={() => setError(null)}>&times;</button>
                    </div>
                )}

                {/* Date/Session Selector */}
                <div className="mb-6 max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Date & Session</label>
                    <select
                        value={selectedDateSession}
                        onChange={e => setSelectedDateSession(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">-- Select Date & Session --</option>
                        {dateSessions.map(({ date, session }) => (
                            <option key={`${date}-${session}`} value={JSON.stringify({ date, session })}>
                                {formatDate(date)} ({session})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rooms Grid */}
                {selectedDateSession && rooms.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-slate-400 text-sm">
                        No rooms found. Generate a seating arrangement first.
                    </div>
                )}

                {rooms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {rooms.map(room => {
                            const roomDuties = getDutiesForRoom(room);
                            const studentCount = roomStudentCount[room] || 0;
                            return (
                                <m.div
                                    key={room}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    {/* Room Header */}
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{room}</h3>
                                            <p className="text-xs text-slate-500">{studentCount} students</p>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-full border">
                                            {roomDuties.length} invigilator{roomDuties.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Assigned Invigilators */}
                                    <div className="px-4 py-3 space-y-2 min-h-[80px]">
                                        {roomDuties.length === 0 && (
                                            <p className="text-xs text-slate-400 italic">No invigilators assigned</p>
                                        )}
                                        {roomDuties.map(duty => (
                                            <div key={duty._id} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <UserCheck size={14} className="text-indigo-500 flex-shrink-0" />
                                                    <span className="text-sm font-medium text-slate-900 truncate">{duty.facultyName}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeDuty(duty._id)}
                                                    disabled={isLoading}
                                                    className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Assign Controls */}
                                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedFacultyByRoom[room] || ''}
                                                onChange={e => setSelectedFacultyByRoom(prev => ({ ...prev, [room]: e.target.value }))}
                                                className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-slate-300 rounded-md"
                                            >
                                                <option value="">-- Assign Invigilator --</option>
                                                {allFaculty.map(f => (
                                                    <option key={f.facultyId || f._id} value={f.facultyId || f._id}>
                                                        {f.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => assignDutyToRoom(room, selectedFacultyByRoom[room])}
                                                disabled={isLoading || !selectedFacultyByRoom[room]}
                                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                                            >
                                                <Plus size={14} className="inline mr-0.5" />
                                                Assign
                                            </button>
                                        </div>
                                    </div>
                                </m.div>
                            );
                        })}
                    </div>
                )}

                {/* All Assigned Duties Table */}
                <m.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                >
                    <h2 className="text-xl font-semibold mb-4">All Assigned Duties</h2>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Faculty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Session</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {allAssignedDuties.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-400">
                                            No duties assigned yet.
                                        </td>
                                    </tr>
                                ) : (
                                    allAssignedDuties.map((duty, index) => (
                                        <tr key={duty._id || index} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                        {duty.facultyName?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900">{duty.facultyName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{duty.room}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDate(duty.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {duty.session}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {statusMap[duty._id] === 'completed' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                            Completed
                                                        </span>
                                                        <button
                                                            onClick={() => removeDuty(duty._id)}
                                                            disabled={isLoading}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                            title="Remove duty"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                ) : statusMap[duty._id] === 'not completed' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                            Not Completed
                                                        </span>
                                                        <button
                                                            onClick={() => removeDuty(duty._id)}
                                                            disabled={isLoading}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                            title="Remove duty"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => handleStatus(duty._id, 'completed')}
                                                            className="bg-green-500 text-white px-2.5 py-1 rounded text-xs hover:bg-green-600"
                                                        >
                                                            Completed
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(duty._id, 'not completed')}
                                                            className="bg-red-500 text-white px-2.5 py-1 rounded text-xs hover:bg-red-600"
                                                        >
                                                            Not Completed
                                                        </button>
                                                        <button
                                                            onClick={() => removeDuty(duty._id)}
                                                            disabled={isLoading}
                                                            className="text-red-400 hover:text-red-600 p-1"
                                                            title="Remove duty"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </m.div>
            </m.div>
        </div>
    );
};

export default DutyAssignment; 