import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!passwordsMatch) {
      setError('Both the new passwords should be the same.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/users/hod/reset-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block font-medium">New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block font-medium">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" required />
          {confirmPassword && !passwordsMatch && (
            <div className="text-red-500 font-medium mt-1">Both the passwords should be same.</div>
          )}
        </div>
        {error && <div className="text-red-500 font-medium">{error}</div>}
        {success && <div className="text-green-600 font-medium">{success}</div>}
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword; 