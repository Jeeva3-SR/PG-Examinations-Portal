import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';

const EvaluatorDetails = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get('/api/bank-accounts');
      setAccounts(res.data);
    } catch {
      // silently fail
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/bank-accounts', formData);
      alert('Evaluator details submitted successfully!');
      setFormData({
        fullName: '',
        panNumber: '',
        bankAccountNumber: '',
        ifscCode: '',
      });
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit evaluator details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Submit Evaluator Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Number
          </label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            title="Please enter a valid PAN number (e.g., ABCDE1234F)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Account Number
          </label>
          <input
            type="text"
            name="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            pattern="[0-9]{9,18}"
            title="Please enter a valid bank account number (9-18 digits)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code
          </label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
            title="Please enter a valid IFSC code (e.g., SBIN0001234)"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Details'}
        </button>
      </form>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Saved Bank Accounts</h3>
      {loadingAccounts ? (
        <p className="text-gray-500">Loading...</p>
      ) : accounts.length === 0 ? (
        <p className="text-gray-500">No bank accounts saved yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-medium">Full Name</th>
                <th className="p-3 font-medium">PAN Number</th>
                <th className="p-3 font-medium">Account Number</th>
                <th className="p-3 font-medium">IFSC Code</th>
                <th className="p-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{acc.fullName}</td>
                  <td className="p-3">{acc.panNumber}</td>
                  <td className="p-3">{acc.bankAccountNumber}</td>
                  <td className="p-3">{acc.ifscCode}</td>
                  <td className="p-3">{new Date(acc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
};

export default EvaluatorDetails;
