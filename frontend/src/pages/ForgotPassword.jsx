import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/api/forgot-password', { email: email.trim() });
      setMessage(res.data?.message || 'If that email exists, a password reset link has been generated.');
    } catch (apiError) {
      console.error('Forgot password submission failed:', apiError);
      setError(apiError.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-xl rounded-2xl p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
        
        {/* Institutional Header/Branding */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-inner">
            <span className="font-black text-sm tracking-wider text-white">E</span>
          </div>
          <span className="text-md font-bold tracking-tight text-slate-800">
            Exam Management Portal
          </span>
        </div>

        {/* Form Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your official email address and we will send/log a password reset link.
          </p>
        </div>

        {message ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-2 text-emerald-800 text-sm font-medium">
              <svg className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
            
            {/* Show a helpful developer note about console mode */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-800 font-medium">
              <span className="block font-bold mb-1">🛠️ Developer / Tester Note:</span>
              Since real emails are only sent if SMTP is configured, please check the **backend server terminal console** to view the printed reset link.
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl py-3 transition-all duration-200"
            >
              Back to Sign-in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Official Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                placeholder="name@institution.edu"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-2 text-red-700 text-sm font-medium">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3.5 shadow-md hover:shadow-indigo-200 hover:shadow-lg transition-all duration-200 transform active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending Request...</span>
                </span>
              ) : (
                'Request Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors duration-200">
                &larr; Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
