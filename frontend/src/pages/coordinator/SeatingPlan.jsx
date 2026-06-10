import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  'CEG Regular': { bg: '#e0f2fe', border: '#0284c7', text: '#0369a1' },
  'CEG Arrear': { bg: '#fef3c7', border: '#d97706', text: '#92400e' },
  'MIT Regular': { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
  'MIT Arrear': { bg: '#fce7f3', border: '#db2777', text: '#9d174d' },
};

const SeatCard = ({ student, number }) => {
  const colors = CATEGORY_COLORS[student.category] || { bg: '#f8fafc', border: '#cbd5e1', text: '#334155' };
  return (
    <div
      style={{
        width: 130, height: 56, border: `2px solid ${colors.border}`,
        borderRadius: 6, backgroundColor: colors.bg, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2px 4px', fontSize: 11, position: 'relative',
      }}
    >
      <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 9, color: '#94a3b8' }}>
        #{number}
      </span>
      <span style={{ fontWeight: 600, fontSize: 12, color: colors.text, lineHeight: 1.2 }}>
        {student.regNo}
      </span>
      {student.name && (
        <span style={{ fontSize: 9, color: '#64748b', lineHeight: 1.1, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {student.name}
        </span>
      )}
    </div>
  );
};

const SEATS_PER_ROW = 6;

const RoomPlan = ({ room }) => {
  const rows = [];
  for (let i = 0; i < room.students.length; i += SEATS_PER_ROW) {
    rows.push(room.students.slice(i, i + SEATS_PER_ROW));
  }
  return (
    <div style={{ marginBottom: 32, pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Room: {room.roomName}
        </h2>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {room.students.length} students
        </span>
      </div>
      <div style={{
        border: '2px dashed #cbd5e1', borderRadius: 12, padding: 16,
        backgroundColor: '#f8fafc',
      }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            {row.map((student, si) => {
              const seatNo = ri * SEATS_PER_ROW + si + 1;
              return <SeatCard key={student.regNo} student={student} number={seatNo} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const SeatingPlan = () => {
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');
  const printRef = useRef();

  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [arrangements, setArrangements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('loading');

  useEffect(() => {
    if (!entryId) { setStep('configure'); return; }
    const token = localStorage.getItem('token');
    axios.get(`/api/seating-arrangement/by-entry/${entryId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data.length) {
          const arr = res.data.map(r => ({ roomName: r.roomNumber, students: r.students.map(s => ({ regNo: s.regNo, name: s.studentName, category: s.category || '', seatNo: s.seatNo })) }));
          setArrangements(arr);
          setSummary({ totalStudents: arr.reduce((sum, r) => sum + r.students.length, 0), roomsUsed: arr.length });
          setStep('result');
        } else {
          setStep('configure');
        }
      })
      .catch(() => setStep('configure'));
  }, [entryId]);

  const addRoom = () => {
    const name = roomName.trim();
    const cap = parseInt(roomCapacity);
    if (!name || !cap || cap < 1) return;
    setRooms([...rooms, { name, capacity: cap }]);
    setRoomName('');
    setRoomCapacity('');
  };

  const removeRoom = (idx) => {
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  const generatePlan = async () => {
    if (!entryId) { setError('No entry selected'); return; }
    if (!rooms.length) { setError('Add at least one room'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/seating-arrangement/generate-from-excel',
        { entryId, rooms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setArrangements(res.data.arrangements);
      setSummary({ totalStudents: res.data.totalStudents, roomsUsed: res.data.roomsUsed });
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to generate');
    }
    setLoading(false);
  };

  const loadSavedRooms = async () => {
    setLoadingRooms(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/rooms', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.data.length) {
        setError('No saved rooms found. Add rooms in Room Management first.');
      } else {
        setRooms(res.data.map(r => ({ name: r.roomNumber, capacity: r.capacity })));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load rooms');
    }
    setLoadingRooms(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!entryId) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-600 text-lg">No entry selected. Please go back and try again.</p>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-500 text-lg">Checking for saved arrangement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Seating Plan</h1>
        <p className="text-gray-500 mb-6">Configure rooms and generate a visual seating plan from uploaded student lists</p>

        {step === 'configure' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Room Configuration</h2>

            <div className="flex gap-3 mb-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Room Name</label>
                <input
                  type="text" value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="e.g. Hall 1, Room 101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyDown={e => e.key === 'Enter' && addRoom()}
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-600 mb-1">Capacity</label>
                <input
                  type="number" value={roomCapacity} min="1"
                  onChange={e => setRoomCapacity(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyDown={e => e.key === 'Enter' && addRoom()}
                />
              </div>
              <button onClick={addRoom} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 h-[42px]">
                Add
              </button>
            </div>

            {rooms.length === 0 && (
              <p className="text-sm text-gray-400 italic mb-4">No rooms added yet. Add at least one room.</p>
            )}

            {rooms.length > 0 && (
              <div className="mb-4 space-y-2">
                {rooms.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="font-medium">{r.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Capacity: {r.capacity}</span>
                      <button onClick={() => removeRoom(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={generatePlan}
                disabled={loading || !rooms.length}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Seating Plan'}
              </button>

              <button
                onClick={() => setRooms([])}
                className="px-4 py-3 text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>

              <button
                onClick={loadSavedRooms}
                disabled={loadingRooms}
                className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                {loadingRooms ? 'Loading...' : 'Load from Saved Rooms'}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <>
            <div className="flex items-center justify-between mb-4 print:hidden">
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="font-semibold">Total Students: {summary?.totalStudents}</span>
                <span className="font-semibold">Rooms Used: {summary?.roomsUsed}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('configure')} className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">
                  Regenerate
                </button>
                <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-6 text-xs flex-wrap print:hidden">
              {Object.entries(CATEGORY_COLORS).map(([label, c]) => (
                <span key={label} className="flex items-center gap-1">
                  <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: 2 }} />
                  {label}
                </span>
              ))}
            </div>

            <div ref={printRef}>
              {arrangements.map((room, i) => (
                <RoomPlan key={i} room={room} />
              ))}
            </div>
          </>
        )}

        <style>{`
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .max-w-5xl { max-width: 100% !important; padding: 0 !important; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default SeatingPlan;