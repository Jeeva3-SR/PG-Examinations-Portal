import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { 
  GraduationCap, 
  Zap, 
  ShieldAlert, 
  ArrowRight, 
  ShieldCheck, 
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [counts, setCounts] = useState({ total: 0, coordinators: 0, hods: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty') 
      .then((res) => res.json())
      .then((data) => {
        const facultyArray = Array.isArray(data) ? data : (data.faculties || data.data || []);
        setCounts({
          total: facultyArray.length,
          coordinators: facultyArray.filter((f) => f.roles?.includes('coordinator')).length,
          hods: facultyArray.filter((f) => f.roles?.includes('hod')).length
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard summaries:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm font-bold uppercase tracking-wider text-slate-400 animate-pulse">
          Loading Control Metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Premium Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 lg:p-10 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-indigo-200 border border-white/5">
            Admin Workspace Console
          </span>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Welcome Back, {user?.name || 'System Admin'}
          </h1>
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider opacity-80">
            Root Authority Domain • ID: {user?.facultyId || 'ADMIN-001'}
          </p>
        </div>
      </div>

      {/* Analytics Counter Metric Cards Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Registered Faculty</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">{String(counts.total).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Active Coordinators</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">{String(counts.coordinators).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Heads of Department (HOD)</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">{String(counts.hods).padStart(2, '0')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Structured System Action Matrix Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">System Action Matrix</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management Hub Card Option */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between items-start group hover:border-slate-200 transition-all">
            <div className="space-y-4 w-full">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">User Management Hub</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Provision new workspace credential profiles, register academic staff, and configure core structural access.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/users')}
              className="mt-6 inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Launch Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* User Assignments Control Panel Options Card */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between items-start group hover:border-slate-200 transition-all">
            <div className="space-y-4 w-full">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Privilege Rule Assignments</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Designate or revoke higher-level roles such as Coordinator and HOD with integrated permission change safeguards.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/assignments')}
              className="mt-6 inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>Manage Permissions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;