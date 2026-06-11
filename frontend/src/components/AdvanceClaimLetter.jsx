import React, { useState } from 'react';
import api from '../lib/api';

const AdvanceClaimLetter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [letterData, setLetterData] = useState(null);
  const [letterViewed, setLetterViewed] = useState(false);
  const [toast, setToast] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentLetterId, setCurrentLetterId] = useState(null);

  const fetchAndViewLetter = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setLetterData(null);
    setToast('');
    setCurrentLetterId(null);
    try {
      const res = await api.get('/api/letters/advance-requisition/forwarded');
      setLetterData(res.data);
      setCurrentLetterId(res.data._id); // Store the ID
      setSuccess('');
      setLetterViewed(true);
      // Open in new tab as plain text
      const newWindow = window.open();
      newWindow.document.write('<pre>' + res.data.letterText.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
      newWindow.document.title = 'Advance Requisition Letter';
      setToast('Letter loaded!');
      setTimeout(() => setToast(''), 2000);
    } catch (err) {
      setError('No forwarded advance requisition letter found.');
      setLetterData(null);
      setLetterViewed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!currentLetterId) return;
    setActionLoading(true);
    setToast('');
    setError('');
    try {
      await api.put(`/api/letters/advance-requisition/${currentLetterId}/approve`);
      setToast('Letter approved successfully!');
      setLetterViewed(false);
      setLetterData(null);
      setCurrentLetterId(null);
    } catch (err) {
      setError('Failed to approve letter.');
      console.error(err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleReject = async () => {
    if (!currentLetterId) return;
    setActionLoading(true);
    setToast('');
    setError('');
    try {
      await api.put(`/api/letters/advance-requisition/${currentLetterId}/reject`);
      setToast('Letter rejected.');
      setLetterViewed(false);
      setLetterData(null);
      setCurrentLetterId(null);
    } catch (err) {
      setError('Failed to reject letter.');
      console.error(err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-2">Advance Requisition Letter for PG Claims</h2>
      <p className="text-gray-600 mb-4">
        
      </p>
      <div className="flex gap-4">
        <button
          onClick={fetchAndViewLetter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View'}
        </button>
        <button
          onClick={handleApprove}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={!letterViewed || actionLoading || !currentLetterId}
        >
          {actionLoading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          disabled={!letterViewed || actionLoading || !currentLetterId}
        >
          {actionLoading ? 'Processing...' : 'Reject'}
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-600 mt-4">{success}</p>}
      {toast && <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">{toast}</div>}
    </div>
  );
};

export default AdvanceClaimLetter; 