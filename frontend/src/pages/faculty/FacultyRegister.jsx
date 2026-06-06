import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const FacultyRegister = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    role: 'faculty'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.userId || !form.name || !form.email || !form.password || !form.role) {
      setError('All fields are required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Invalid email format.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    
    try {
      const res = await axios.post('/api/register', form);
      setSuccess(res.data.message || 'Registration successful! Redirecting to login...');
      
      // Reset form fields
      setForm({ userId: '', name: '', email: '', password: '', role: 'faculty' });
      
      // Smooth auto-redirect to login after a 2-second success showcase
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
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

        {/* Narrative / Onboarding Text */}
        <div className="max-w-md space-y-4 z-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Join the academic framework.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Create your account to track assignments, update evaluation metrics, and seamlessly interact with coordinators and department heads.
          </p>
        </div>

        <div className="z-10 text-sm text-slate-400">
          <Link to="/about" className="hover:text-white transition-colors duration-200 underline underline-offset-4">
            About Portal Infrastructure &rarr;
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: Register Box matching the style of image_1bb22e.png */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-xl rounded-2xl p-8 md:p-10 transform transition-all duration-300 hover:shadow-2xl">
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-500 mt-1">Fill out the credentials to register your portal file.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid for compact fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  ID
                </label>
                <input
                  type="text"
                  name="userId"
                  required
                  value={form.userId}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                  placeholder="FAC-2026-99"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                  placeholder="Prof. Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                placeholder="name@institution.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-slate-800 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Assigned System Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  required
                  value={form.role}
                  onChange={handleChange}
                  className="w-full appearance-none bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-4 text-slate-800 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="faculty">Faculty</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="hod">HOD</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notification Elements */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-2 text-red-700 text-xs font-medium animate-shake">
                <svg className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start space-x-2 text-emerald-800 text-xs font-medium">
                <svg className="w-4 h-4 flex-shrink-0 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 shadow-md hover:shadow-indigo-200 hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing Registration...</span>
                </span>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          {/* Action Context Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">Already have an active account? </span>
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">
              Sign In here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacultyRegister;