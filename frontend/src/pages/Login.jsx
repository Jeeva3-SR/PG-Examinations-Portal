import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

const UnifiedLogin = () => {
  const navigate = useNavigate();

  // State Management - Strictly restricted to 'faculty' or 'admin'
  const [role, setRole] = useState('faculty'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  // Clear inputs when switching roles
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password) {
      setError('Please enter both Email and Password.');
      setLoading(false);
      return;
    }

    try {
      // Send login payload to your production route
      const res = await api.post('/api/login', { 
        email: email.trim(), 
        password: password 
      });

      const backendUser = res.data?.user;
      const token = res.data?.token;

      if (!token) {
        setError('Authentication failed. No token received.');
        setLoading(false);
        return;
      }

      const userRole = backendUser?.role;

      // Faculty Workflow
      if (role === 'faculty' && userRole === 'faculty') {
        login(backendUser, token, 'Faculty');
        navigate('/faculty');
        return;
      } 
      
      // Admin Workflow
      if (role === 'admin' && userRole === 'admin') {
        login(backendUser, token, 'Admin');
        navigate('/admin/dashboard');
        return;
      }

      setError(`Authorized profile found, but it does not match the selected tier: ${role.toUpperCase()}.`);

    } catch (apiError) {
      console.error('API Authentication failure:', apiError);
      setError(apiError.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* LEFT SIDE: Professional Portal Presentation Hero Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        {/* Institutional Branding */}
        <div className="flex items-center space-x-3 z-10">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <span className="font-black text-xl tracking-wider text-indigo-200">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Exam Management Portal
          </span>
        </div>

        {/* Narrative / Focus Text */}
        <div className="max-w-md space-y-4 z-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            A unified workflow platform for academia.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Access your courses, seating schedules, question paper evaluation streams, and academic settlements securely in one centralized station.
          </p>
        </div>

        {/* Dynamic Helpful Footer Link */}
        <div className="z-10 text-sm text-slate-400">
          <Link to="/about" className="hover:text-white transition-colors duration-200 underline underline-offset-4">
            About Us &rarr;
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: Elegant Login System */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-xl rounded-2xl p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Sign-in</h2>
            <p className="text-sm text-slate-500 mt-1">Please select your operational role to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dropdown Field - Only Faculty & Admin */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Operational Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-slate-800 font-medium shadow-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            {/* UNIFIED INPUT FIELDS FOR ALL ROLES */}
            <div className="space-y-5 animate-fadeIn duration-200">
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
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Notifications */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-2 text-red-700 text-sm font-medium">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3.5 shadow-md hover:shadow-indigo-200 hover:shadow-lg transition-all duration-200 transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                `Sign In as ${role === 'faculty' ? 'Faculty' : 'Admin'}`
              )}
            </button>
          </form>

          {/* Contextual Footer Layout */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs space-y-2 sm:space-y-0">
            {role === 'faculty' ? (
              <Link to="/faculty/register" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">
                New Faculty? Register account &rarr;
              </Link>
            ) : (
              <span className="text-slate-400"></span>
            )}
            <Link to="/about" className="lg:hidden text-slate-500 hover:text-slate-800 underline transition-colors duration-200">
              About Us
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;