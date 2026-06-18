import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const summaryMetrics = [
  { label: "Assigned Courses", value: "02", color: "text-indigo-600 bg-indigo-50 border-indigo-100", icon: "📚", path: "/faculty/assigned-courses" },
  { label: "Active QP Orders", value: "01", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: "📄", path: "/faculty/qp-orders" },
  { label: "Invigilation Duties", value: "04", color: "text-amber-600 bg-amber-50 border-amber-100", icon: "👥", path: "/faculty/invigilation-duty" },
];

const quickActions = [
  { title: "Maintain Profile Parameters", desc: "Update your official academic bio, payment matrix tiers, and core expertise sectors.", icon: "📝", path: "/faculty/update-profile" },
  { title: "Evaluator Status Indicators", desc: "Access central answer script delivery requests and validation assignments.", icon: "🎯", path: "/faculty/evaluator-details" },
  { title: "All Faculties", desc: "View complete list of faculty members across the institution.", icon: "👨‍🏫", path: "/faculty/all-faculties" },
  { title: "All Subjects", desc: "Browse master list of all courses and subjects offered.", icon: "📖", path: "/faculty/all-subjects" },
  { title: "Release Financial Claims", desc: "Process outstanding monetary settlement profiles for completed examinations.", icon: "💸", path: "/faculty/release-claim" },
];

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  
  const [liveRoles, setLiveRoles] = useState([]);

  const facultyName = user?.name || 'Faculty Member';
  const facultyId = user?.facultyId || '';
  const dept = user?.department || 'CSE department';

  useEffect(() => {
    if (facultyId) {
      fetch(`/api/faculty/${facultyId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch updated roles');
          return res.json();
        })
        .then((data) => {
          const roles = data.roles || [];
          setLiveRoles(roles);
        })
        .catch((err) => console.error('Error verifying live roles:', err));
    }
  }, [facultyId]);
  
  const isCoordinator = liveRoles.includes('coordinator');
  const isHOD = liveRoles.includes('hod');

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Banner Component Greeting Panel - Height Explicitly Fixed to md:h-52 */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(99,102,241,0.2)] border border-indigo-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 min-h-[180px] md:h-52">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        {/* Left Side Content Container */}
        <div className="relative z-10 flex flex-col justify-center h-full space-y-2 pr-0 md:pr-[320px]"> 
          <div>
            <span className="bg-white/10 text-indigo-200 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md">
              Faculty Dashboard
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight line-clamp-1">Welcome Back, {facultyName}</h2>
          <p className="text-slate-300 text-sm font-medium line-clamp-1">
            {dept} {facultyId && `• ID: ${facultyId}`}
          </p>
        </div>

        {/* Action Panel Holder - Standardized dimensions to match other views */}
        <div className="md:absolute md:top-8 md:right-8 z-20 flex flex-col gap-3 w-full md:w-[290px]">
          {isCoordinator && (
            <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-xl p-4 rounded-xl flex flex-col justify-between h-[144px] shadow-[0_0_15px_rgba(0,0,0,0.4)]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Announcement</p>
                </div>
                <p className="text-xs text-slate-200 font-bold leading-tight">You are assigned as a Coordinator. Click below to acces coordinator workspace.</p>
              </div>
              <button 
                onClick={() => navigate('/faculty/coordinator/dashboard')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all active:scale-[0.98]"
              >
                Switch Workspace &rarr;
              </button>
            </div>
          )}

          {!isCoordinator && isHOD && (
            <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-xl p-4 rounded-xl flex flex-col justify-between h-[144px] shadow-[0_0_15px_rgba(0,0,0,0.4)]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Announcement</p>
                </div>
                <p className="text-xs text-slate-200 font-bold leading-tight">You are assigned as HOD.</p>
              </div>
              <button 
                onClick={() => navigate('/faculty/hod/dashboard')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-center py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all active:scale-[0.98]"
              >
                Switch to HOD Workspace &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {summaryMetrics.map((metric) => (
          <div 
            key={metric.label} 
            onClick={() => navigate(metric.path)}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{metric.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform ${metric.color}`}>
              {metric.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Action Grid Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">System Action Matrix</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <div 
              key={action.title}
              onClick={() => navigate(action.path)}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-lg shadow-inner group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {action.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {action.desc}
                </p>
              </div>
              <div className="pt-4 text-xs font-bold text-indigo-600 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Access Terminal</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;