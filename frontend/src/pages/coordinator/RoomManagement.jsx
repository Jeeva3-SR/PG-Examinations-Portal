import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ roomNumber: '', capacity: '', floor: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchRooms(); }, []);

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) { setError('No auth token found. Please log in again.'); return null; }
    return token;
  };

  const fetchRooms = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get('/api/rooms', { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load rooms');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.roomNumber || !form.capacity || !form.floor) {
      setError('All fields are required');
      return;
    }
    const token = getToken();
    if (!token) return;
    try {
      if (editingId) {
        await axios.put(`/api/rooms/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/rooms', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setForm({ roomNumber: '', capacity: '', floor: '' });
      setEditingId(null);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setForm({ roomNumber: room.roomNumber, capacity: room.capacity, floor: room.floor });
    setEditingId(room._id);
  };

  const handleDelete = async (id) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(`/api/rooms/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleCancel = () => {
    setForm({ roomNumber: '', capacity: '', floor: '' });
    setEditingId(null);
    setError('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Room Management</h1>
      <p className="text-gray-500 mb-6">Add, edit, and remove examination rooms</p>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Room' : 'Add New Room'}</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">Room Number</label>
            <input type="text" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Hall 1" />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-600 mb-1">Capacity</label>
            <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="30" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-600 mb-1">Floor</label>
            <select value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select</option>
              <option value="Ground">Ground</option>
              <option value="First">First</option>
              <option value="Second">Second</option>
              <option value="Third">Third</option>
              <option value="Fourth">Fourth</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Saved Rooms ({rooms.length})</h2>
        {rooms.length === 0 ? (
          <p className="text-gray-400 italic">No rooms added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Room Number</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Floor</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Capacity</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{room.roomNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{room.floor}</td>
                    <td className="px-4 py-3 text-center">{room.capacity}</td>
                    <td className="px-4 py-3 text-center space-x-3">
                      <button onClick={() => handleEdit(room)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(room._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RoomManagement;