import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';


const dutyTypeOptions = [
  'Invigilation',
  'QP Setting',
  'Evaluation (Arrear)'
];

const statusColor = {
  'Signed Off': 'text-blue-600 font-semibold',
  'Approved': 'text-green-600 font-semibold',
  'Not Approved': 'text-red-600 font-semibold',
  'Pending': 'text-gray-500 font-semibold'
};

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/claims/all');
      setClaims(res.data.map((c, i) => ({ ...c, amount: c.amount ?? '', rowIndex: i + 1 })));
    } catch (err) {
      setError('Failed to fetch claims.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx, field, value) => {
    setClaims(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSignOff = async (idx) => {
    const claim = claims[idx];
    if (!claim.amount || isNaN(claim.amount) || Number(claim.amount) < 0) {
      setToast({ type: 'error', message: 'Amount must be a non-negative number.' });
      return;
    }
    try {
      await api.post('/api/claims', {
        claimId: claim.claimId,
        facultyId: claim.facultyId,
        facultyName: claim.facultyName,
        dutyType: claim.dutyType,
        amount: Number(claim.amount),
        status: 'Signed Off'
      });
      setClaims(prev => prev.map((c, i) => i === idx ? { ...c, status: 'Signed Off' } : c));
      setToast({ type: 'success', message: 'Claim processed successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to sign off claim.' });
    }
  };

  const filteredClaims = claims.filter(c =>
    c.facultyId.toLowerCase().includes(search.toLowerCase()) ||
    c.facultyName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setClaims((prev) => prev.map((c) => ({
      ...c,
      [name]: value,
    })));
  };

  const handleGenerateClaims = async () => {
    try {
      await api.post('/api/claims/generate');
      fetchClaims();
    } catch (error) {
      console.error('Error generating claims:', error);
    }
  };

  const generateClaimLetter = (claim) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text('Claim Letter', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Examination Cell', pageWidth / 2, 30, { align: 'center' });

    // Content
    doc.setFontSize(10);
    doc.text(`Faculty Name: ${claim.faculty.name}`, 20, 50);
    doc.text(`Department: ${claim.faculty.department}`, 20, 60);
    doc.text(`Employee ID: ${claim.faculty.employeeId}`, 20, 70);
    doc.text(`Claim Period: ${format(new Date(claim.startDate), 'MMMM d, yyyy')} to ${format(new Date(claim.endDate), 'MMMM d, yyyy')}`, 20, 80);
    doc.text(`Total Duties: ${claim.totalDuties}`, 20, 90);
    doc.text(`Total Amount: ₹${claim.totalAmount}`, 20, 100);
    doc.text(`Bank Account: ${claim.bankAccount}`, 20, 110);
    doc.text(`IFSC Code: ${claim.ifscCode}`, 20, 120);

    // Footer
    doc.setFontSize(10);
    doc.text('Authorized Signature', 20, 150);
    doc.text('Examination Cell', 20, 160);

    // Save the PDF
    doc.save(`Claim_${claim.faculty.employeeId}.pdf`);
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
            Faculty Exam Duty Claims
          </m.h1>
          <div className="mb-4 flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by Faculty ID or Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border px-3 py-2 rounded w-64"
            />
          </div>
          {toast && (
            <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{toast.message}</div>
          )}
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Faculty ID</th>
                    <th className="px-4 py-2">Faculty Name</th>
                    <th className="px-4 py-2">Duty Type</th>
                    <th className="px-4 py-2">Amount (₹)</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4 text-gray-500">No claims found.</td></tr>
                  ) : filteredClaims.map((claim, idx) => (
                    <tr key={claim.claimId} className="border-b">
                      <td className="px-4 py-2">{claim.rowIndex}</td>
                      <td className="px-4 py-2">{claim.facultyId}</td>
                      <td className="px-4 py-2">{claim.facultyName}</td>
                      <td className="px-4 py-2">
                        <select
                          value={claim.dutyType}
                          onChange={e => handleChange(idx, 'dutyType', e.target.value)}
                          className="border rounded px-2 py-1"
                          disabled={claim.status === 'Signed Off'}
                        >
                          {dutyTypeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={claim.amount}
                          onChange={e => handleChange(idx, 'amount', e.target.value)}
                          className="border rounded px-2 py-1 w-24"
                          disabled={claim.status === 'Signed Off'}
                        />
                      </td>
                      <td className={`px-4 py-2 ${statusColor[claim.status]}`}>{claim.status}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          disabled={claim.status === 'Signed Off' || !claim.amount || isNaN(claim.amount) || Number(claim.amount) < 0}
                          onClick={() => handleSignOff(idx)}
                        >
                          Sign Off
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Link 
              to="/settlement-all-pages" 
              target="_blank" 
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            >
              Generate Settlement PDF
            </Link>
          </div>
        </m.div>
      </div>
  );
};

export default Claims; 