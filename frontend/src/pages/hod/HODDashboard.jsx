import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const quickActions = [
  { title: "Approve QP Order Letters", desc: "Review, sign off on, and dispatch official question paper compilation requests to assigned faculty panels.", icon: "📋", path: "/faculty/hod/approve-qporders" },
  { title: "Department Sign-Off Terminal", desc: "Digitally sign off, validate, and close out exam registration lists and session packets.", icon: "✅", path: "/faculty/hod/signoff" },
  { title: "All Faculties", desc: "View complete list of faculty members across the institution.", icon: "👨‍🏫", path: "/faculty/all-faculties" },
  { title: "All Subjects", desc: "Browse master list of all courses and subjects offered.", icon: "📖", path: "/faculty/all-subjects" },
  { title: "Reset Portal Password", desc: "Maintain and update your department's local secure authentication credentials.", icon: "🔑", path: "/faculty/hod/reset-password" },
];

const analyticsMetrics = [
  { label: "Consolidated Sessions", value: "14", color: "text-indigo-600 bg-indigo-50 border-indigo-100", icon: "📊", path: "/faculty/hod/consolidated-sessions" },
  { label: "QP Setting Matrix", value: "08", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: "👥", path: "/faculty/coordinator/assign-qpsetter" },
  { label: "Pending Letters", value: "03", color: "text-amber-600 bg-amber-50 border-amber-100", icon: "📈", path: "/faculty/hod/letters" },
  { label: "All Faculties", value: "-", color: "text-sky-600 bg-sky-50 border-sky-100", icon: "👨‍🏫", path: "/faculty/all-faculties" },
  { label: "All Subjects", value: "-", color: "text-violet-600 bg-violet-50 border-violet-100", icon: "📖", path: "/faculty/all-subjects" },
];

const HODDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hodName = user?.name || 'Department Head';
  const deptName = user?.department || 'CSE Department';

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Premium HOD Welcome Banner - Height Explicitly Fixed to md:h-52 */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-blue-950 text-white rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.22)] border border-purple-900/30 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:h-52">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,rgba(168,85,247,0.15),transparent)] pointer-events-none" />
        
        {/* Left Side Content Container */}
        <div className="relative z-10 flex flex-col justify-center h-full space-y-2 pr-0 md:pr-[320px]">
          <div>
            <span className="bg-white/10 text-purple-200 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md">
              HOD Dashboard
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight line-clamp-1">Welcome Back, {hodName}</h2>
          <p className="text-slate-300 text-sm font-medium line-clamp-1">
            {deptName} 
          </p>
        </div>

        {/* Right Side Switcher Box - Sized identically to other views */}
        <div className="md:absolute md:top-8 md:right-8 z-20 w-full md:w-[290px]">
          <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-xl p-4 rounded-xl flex flex-col justify-between h-[144px] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Switcher</p>
              </div>
              <p className="text-xs text-slate-200 font-bold leading-tight">Need to return faculty view?</p>
            </div>
            <button 
              onClick={() => navigate('/faculty')} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-2 rounded-lg text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)] active:scale-95"
            >
              Switch to Faculty View &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {analyticsMetrics.map((metric) => (
          <div key={metric.label} onClick={() => navigate(metric.path)} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{metric.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform ${metric.color}`}>
              {metric.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Core Actions Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Administrative Action Matrix</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <div key={action.title} onClick={() => navigate(action.path)} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-lg shadow-inner group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {action.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{action.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{action.desc}</p>
              </div>
              <div className="pt-4 text-xs font-bold text-indigo-600 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open Component Module</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;