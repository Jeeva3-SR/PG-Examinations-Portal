import React, { useState } from 'react';
import axios from 'axios';
import AdvanceClaimLetter from '../../components/AdvanceClaimLetter';
import ReleaseClaimLetterHOD from '../../components/ReleaseClaimLetterHOD';

const FinalReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [letterText, setLetterText] = useState('');
  const [toast, setToast] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentLetterId, setCurrentLetterId] = useState(null);

  const viewLetterAsText = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setToast('');
    setCurrentLetterId(null);
    try {
      const res = await axios.get('http://localhost:5000/api/evaluation-letter/forwarded');
      setLetterText(res.data.letterText);
      setCurrentLetterId(res.data._id); // Store the ID of the viewed letter
      // Open in new tab as plain text
      const newWindow = window.open();
      newWindow.document.write('<pre>' + res.data.letterText.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
      newWindow.document.title = 'Evaluation Letter';
      setToast('Letter loaded!');
      setTimeout(() => setToast(''), 2000);
    } catch (error) {
      setError('No forwarded evaluation letter found.');
      setLetterText('');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!currentLetterId) {
      setError('Please view a letter first.');
      return;
    }
    setActionLoading(true);
    setToast('');
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/evaluation-letter/${currentLetterId}/approve`);
      setToast('Evaluation letter approved successfully!');
      setLetterText(''); // Clear letter to force refetch
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
    if (!currentLetterId) {
      setError('Please view a letter first.');
      return;
    }
    setActionLoading(true);
    setToast('');
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/evaluation-letter/${currentLetterId}/reject`);
      setToast('Evaluation letter rejected.');
      setLetterText(''); // Clear letter to force refetch
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
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-1">
        {/* Evaluation Letter Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Evaluation Letter</h2>
            <div className="flex gap-4">
              <button
                onClick={viewLetterAsText}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'View'}
              </button>
              <button
                onClick={handleApprove}
                disabled={!letterText || actionLoading || !currentLetterId}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={handleReject}
                disabled={!letterText || actionLoading || !currentLetterId}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}
          </div>
        </div>
        {/* Advance Requisition Letter Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <AdvanceClaimLetter />
        </div>
        {/* Release Advance Claim Letter Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <ReleaseClaimLetterHOD />
        </div>
      </div>
      {toast && <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">{toast}</div>}
    </div>
  );
};

export default FinalReports; 