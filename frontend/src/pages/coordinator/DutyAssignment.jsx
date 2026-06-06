import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const DutyAssignment = () => {
    const [dateSessions, setDateSessions] = useState([]);
    const [selectedDateSession, setSelectedDateSession] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [assignedFaculties, setAssignedFaculties] = useState([]);
    const [allAssignedDuties, setAllAssignedDuties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [eligibleFacultyByRoom, setEligibleFacultyByRoom] = useState({});
    const [manualFacultySelection, setManualFacultySelection] = useState({});
    const [statusMap, setStatusMap] = useState({});
    const [statusLoading, setStatusLoading] = useState({});
    const [reassigningDuty, setReassigningDuty] = useState(null);
    const [reassignFacultyId, setReassignFacultyId] = useState('');
    const [allFaculty, setAllFaculty] = useState([]);

    const fetchAllDuties = () => {
        axios.get('/api/duties')
            .then(response => {
                setAllAssignedDuties(response.data);
            })
            .catch(error => {
                console.error('Error fetching all duties:', error);
                setError('Failed to fetch the list of assigned duties.');
            });
    };

    const fetchAllFaculty = async () => {
        try {
            const response = await axios.get('/api/faculty');
            setAllFaculty(response.data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    useEffect(() => {
        // Fetch initial data
        fetchAllDuties();
        fetchAllFaculty();
        axios.get('/api/duties/dates')
            .then(response => {
                setDateSessions(response.data);
            })
            .catch(error => {
                console.error('Error fetching dates and sessions:', error);
                setError('Failed to fetch exam dates and sessions.');
            });
        // Fetch completed status for all duties
        axios.get('/api/duties/completed-duties')
            .then(res => {
                const map = {};
                res.data.forEach(record => {
                    if (record.dutyId) map[record.dutyId] = record.status;
                });
                setStatusMap(map);
            })
            .catch(err => {
                // Optionally handle error
            });
    }, []);

    useEffect(() => {
        setRooms([]);
        setSelectedRoom('');
        setAssignedFaculties([]);
        if (selectedDateSession) {
            const { date, session } = JSON.parse(selectedDateSession);
            axios.get(`/api/duties/rooms?date=${date}&session=${session}`)
                .then(response => {
                    setRooms(response.data);
                })
                .catch(error => {
                    console.error('Error fetching rooms:', error);
                    setError('Failed to fetch rooms for the selected session.');
                });
        }
    }, [selectedDateSession]);

    useEffect(() => {
        async function fetchEligibleFaculty() {
            if (!selectedDateSession || !rooms.length) return;
            const { date, session } = JSON.parse(selectedDateSession);
            const newEligible = {};
            for (const room of rooms) {
                // Fetch the seating arrangement for this room/date/session
                // const arrangementRes = await axios.get(`/api/seating-arrangement/rooms`);
                // Find the arrangement for this room
                // Use POST to generate/fetch arrangements
                const allArrangements = await axios.post(`/api/seating-arrangement/generate`, { date, session });
                let arrangement = null;
                if (Array.isArray(allArrangements.data.arrangements)) {
                    arrangement = allArrangements.data.arrangements.find(a => a.roomNumber === room);
                }
                let uniqueCourseCodes = [];
                if (arrangement && Array.isArray(arrangement.students)) {
                    uniqueCourseCodes = [...new Set(arrangement.students.map(s => s.courseCode && s.courseCode.toUpperCase()).filter(Boolean))];
                }
                // Fetch all faculty
                const facultiesRes = await axios.get(`/api/faculty`);
                // Filter only those whose courseCode matches any in uniqueCourseCodes
                newEligible[room] = facultiesRes.data.filter(f => f.courseCode && uniqueCourseCodes.includes(f.courseCode.toUpperCase()));
            }
            setEligibleFacultyByRoom(newEligible);
        }
        fetchEligibleFaculty();
    }, [selectedDateSession, rooms]);

    const handleRoomSelect = async (room) => {
        setSelectedRoom(room);

        // Prevent adding the same room twice to the proposed list
        if (assignedFaculties.some(duty => duty.room === room)) {
            alert('This room has already been added to the proposed list.');
            return;
        }

        if (room && selectedDateSession) {
            const { date, session } = JSON.parse(selectedDateSession);
            // Check if the room is already fully staffed in the "All Assigned Duties" list
            const summaryRes = await axios.get(`/api/seating-arrangement/room-summary?date=${date}&session=${session}&room=${room}`);
            const studentCount = summaryRes.data.studentCount;
            const facultiesNeeded = Math.ceil(studentCount / 20);
            const alreadyAssignedCount = allAssignedDuties.filter(d => d.room === room && d.date === date && d.session === session).length;
            if (alreadyAssignedCount >= facultiesNeeded) {
                alert('This room has already been fully staffed with invigilators.');
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                if (studentCount > 0) {
                    const remainingNeeded = facultiesNeeded - alreadyAssignedCount;
                    // Get eligible faculty for this room (course handlers)
                    let eligibleFaculty = eligibleFacultyByRoom[room] || [];
                    // Get all faculty for random assignment
                    const facultiesRes = await axios.get(`/api/faculty?limit=${remainingNeeded}&date=${date}&session=${session}`);
                    let randomFaculty = facultiesRes.data.filter(f => !eligibleFaculty.some(ef => ef.facultyId === f.facultyId));
                    // If a manual selection exists for this room, assign that faculty first
                    let manual = manualFacultySelection[room];
                    let newAssignments = [];
                    if (manual && manual.facultyId) {
                        newAssignments.push({
                            facultyId: manual.facultyId,
                            facultyName: manual.facultyName,
                            room: room,
                            date: date,
                            session: session,
                            studentCount: studentCount
                        });
                    } else if (eligibleFaculty.length > 0) {
                        // If no manual selection, assign the first eligible handler by default
                        newAssignments.push({
                            facultyId: eligibleFaculty[0].facultyId,
                            facultyName: eligibleFaculty[0].name,
                            room: room,
                            date: date,
                            session: session,
                            studentCount: studentCount
                        });
                    }
                    // Fill remaining slots with random faculty
                    let needed = remainingNeeded - newAssignments.length;
                    if (needed > 0) {
                        newAssignments = [
                            ...newAssignments,
                            ...randomFaculty.slice(0, needed).map(faculty => ({
                                facultyId: faculty.facultyId || faculty._id,
                                facultyName: faculty.name,
                                room: room,
                                date: date,
                                session: session,
                                studentCount: studentCount
                            }))
                        ];
                    }
                    setAssignedFaculties(prevAssignments => [...prevAssignments, ...newAssignments]);
                }
            } catch (error) {
                console.error('Error assigning duties:', error);
                setError('Failed to generate duty assignments.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAssignSingleDuty = async (dutyToAssign, index) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/duties', [dutyToAssign]);
            alert(`Duty assigned successfully to ${dutyToAssign.facultyName}!`);
            
            setAssignedFaculties(prev => prev.filter((_, i) => i !== index));
            setAllAssignedDuties(prevDuties => [...prevDuties, ...response.data]);
        } catch (error) {
            console.error('Error saving duty assignment:', error);
            setError('Failed to save duty assignment.');
            alert('Failed to assign duty.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatus = async (dutyId, status) => {
        setStatusLoading(prev => ({ ...prev, [dutyId]: true }));
        try {
            const duty = allAssignedDuties.find(d => d._id === dutyId);
            if (!duty) throw new Error('Duty not found');
            await axios.post('/api/duties/completed-duties', {
                dutyId: duty._id,
                facultyId: duty.facultyId,
                facultyName: duty.facultyName,
                status
            });
            setStatusMap(prev => ({ ...prev, [dutyId]: status }));
        } catch (err) {
            alert('Failed to update status.');
            console.error(err);
        } finally {
            setStatusLoading(prev => ({ ...prev, [dutyId]: false }));
        }
    };

    const handleReassignDuty = async (dutyId) => {
        if (!reassignFacultyId) {
            alert('Please select a faculty to reassign.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const duty = allAssignedDuties.find(d => d._id === dutyId);
            if (!duty) throw new Error('Duty not found');

            // Get faculty details
            const facultyRes = await axios.get(`/api/faculty/${reassignFacultyId}`);
            const newFaculty = facultyRes.data;

            // Create new duty assignment
            const newDuty = {
                facultyId: newFaculty.facultyId,
                facultyName: newFaculty.name,
                room: duty.room,
                date: duty.date,
                session: duty.session
            };

            // Delete the old duty
            await axios.delete(`/api/duties/${dutyId}`);
            
            // Clear the completed duty status for the old duty
            try {
                await axios.delete(`/api/duties/completed-duties/${dutyId}`);
            } catch (err) {
                // Ignore error if no completed duty record exists
            }
            
            // Save new duty assignment
            const response = await axios.post('/api/duties', [newDuty]);
            
            // Remove the old duty from the list
            setAllAssignedDuties(prevDuties => prevDuties.filter(d => d._id !== dutyId));
            
            // Add the new duty to the list
            setAllAssignedDuties(prevDuties => [...prevDuties, ...response.data]);
            
            // Remove the old duty from status map
            setStatusMap(prev => {
                const newMap = { ...prev };
                delete newMap[dutyId];
                return newMap;
            });
            
            // Reset reassignment state
            setReassigningDuty(null);
            setReassignFacultyId('');
            
            alert(`Duty successfully reassigned to ${newFaculty.name}!`);
        } catch (error) {
            console.error('Error reassigning duty:', error);
            setError('Failed to reassign duty.');
            alert('Failed to reassign duty.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return `${day}-${month}-${year}`;
    }

    return (
            <div className="max-w-6xl mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-white shadow-xl rounded-2xl p-6 mb-8 transition-all duration-500 hover:shadow-2xl"
                >
                    <h1 className="text-3xl font-bold mb-6">Duty Assignment</h1>

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="dateSession" className="block text-sm font-medium text-gray-700">Select Exam Date & Session</label>
                            <select
                                id="dateSession"
                                value={selectedDateSession}
                                onChange={e => setSelectedDateSession(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">-- Select Date & Session --</option>
                                {dateSessions.map(({ date, session }) => (
                                    <option key={`${date}-${session}`} value={JSON.stringify({ date, session })}>
                                        {formatDate(date)} ({session})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="room" className="block text-sm font-medium text-gray-700">Select Room</label>
                            <select
                                id="room"
                                value={selectedRoom}
                                onChange={e => handleRoomSelect(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                disabled={!selectedDateSession || rooms.length === 0}
                            >
                                <option value="">-- Select Room --</option>
                                {rooms.map(room => (
                                    <option key={room} value={room}>{room}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isLoading && <p>Loading...</p>}

                    {assignedFaculties.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                        >
                            <h2 className="text-xl font-semibold mb-2">Proposed Duty Assignments</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty Name</th>
                                            {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty ID</th>*/}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Room</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assignedFaculties.map((duty, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={manualFacultySelection[duty.room]?.facultyId || duty.facultyId}
                                                        onChange={e => {
                                                            const selectedId = e.target.value;
                                                            const selectedFaculty = eligibleFacultyByRoom[duty.room]?.find(f => f.facultyId === selectedId);
                                                            setManualFacultySelection(prev => ({
                                                                ...prev,
                                                                [duty.room]: {
                                                                    facultyId: selectedFaculty?.facultyId,
                                                                    facultyName: selectedFaculty?.name
                                                                }
                                                            }));
                                                            // Optionally update assignedFaculties here if you want to immediately reflect the change
                                                        }}
                                                    >
                                                        <option value="">Select Faculty</option>
                                                        {(eligibleFacultyByRoom[duty.room] || []).map(f => (
                                                            <option key={f.facultyId} value={f.facultyId}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/*<td className="px-6 py-4 whitespace-nowrap">{duty.facultyId}</td>*/}
                                                <td className="px-6 py-4 whitespace-nowrap">{duty.room}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{duty.studentCount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{formatDate(duty.date)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{duty.session}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleAssignSingleDuty({
                                                            ...duty,
                                                            facultyId: manualFacultySelection[duty.room]?.facultyId || duty.facultyId,
                                                            facultyName: manualFacultySelection[duty.room]?.facultyName || duty.facultyName
                                                        }, index)}
                                                        disabled={isLoading}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Assign Duty
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                        className="mt-8"
                    >
                        <h2 className="text-xl font-semibold mb-2">All Assigned Duties</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {allAssignedDuties.map((duty, index) => (
                                        <tr key={duty._id || index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{duty.facultyName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{duty.room}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(duty.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{duty.session}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {statusMap[duty._id] === 'completed' ? (
                                                    <span className="text-green-600 font-semibold">Completed</span>
                                                ) : statusMap[duty._id] === 'not completed' ? (
                                                    <div className="space-y-2">
                                                        <span className="text-red-600 font-semibold block">Not Completed</span>
                                                        {reassigningDuty === duty._id ? (
                                                            <div className="space-y-2">
                                                                <select
                                                                    value={reassignFacultyId}
                                                                    onChange={(e) => setReassignFacultyId(e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    disabled={isLoading}
                                                                >
                                                                    <option value="">Select Faculty</option>
                                                                    {allFaculty
                                                                        .filter(f => f.facultyId !== duty.facultyId)
                                                                        .map(faculty => (
                                                                            <option key={faculty.facultyId} value={faculty.facultyId}>
                                                                                {faculty.name}
                                                                            </option>
                                                                        ))
                                                                    }
                                                                </select>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleReassignDuty(duty._id)}
                                                                        disabled={isLoading || !reassignFacultyId}
                                                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setReassigningDuty(null);
                                                                            setReassignFacultyId('');
                                                                        }}
                                                                        disabled={isLoading}
                                                                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 disabled:opacity-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setReassigningDuty(duty._id)}
                                                                disabled={isLoading}
                                                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                                            >
                                                                Re-assign
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStatus(duty._id, 'completed')}
                                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                        >
                                                            Completed
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(duty._id, 'not completed')}
                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                        >
                                                            Not Completed
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

    );
};

export default DutyAssignment; 