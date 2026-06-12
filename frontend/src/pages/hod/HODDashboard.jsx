import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const quickActions = [
    { title: "Approve QP Order Letters", desc: "Review, sign off on, and dispatch official question paper compilation requests to assigned faculty panels.", icon: "📋", path: "/hod/approve-qporders" },
    { title: "Department Sign-Off Terminal", desc: "Digitally sign off, validate, and close out exam registration lists and session packets.", icon: "✅", path: "/hod/signoff" },
    { title: "All Faculties", desc: "View complete list of faculty members across the institution.", icon: "👨‍🏫", path: "/hod/all-faculties" },
    { title: "All Subjects", desc: "Browse master list of all courses and subjects offered.", icon: "📖", path: "/hod/all-subjects" },
    { title: "Reset Portal Password", desc: "Maintain and update your department's local secure authentication credentials.", icon: "🔑", path: "/hod/reset-password" },
  ];

const analyticsMetrics = [
    { label: "Consolidated Sessions", value: "14", color: "text-indigo-600 bg-indigo-50 border-indigo-100", icon: "📊", path: "/hod/consolidated-sessions" },
    { label: "QP Setting Matrix", value: "08", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: "👥", path: "/hod/assign-qpsetter" },
    { label: "Pending Letters", value: "03", color: "text-amber-600 bg-amber-50 border-amber-100", icon: "📈", path: "/hod/letters" },
    { label: "All Faculties", value: "-", color: "text-sky-600 bg-sky-50 border-sky-100", icon: "👨‍🏫", path: "/hod/all-faculties" },
    { label: "All Subjects", value: "-", color: "text-violet-600 bg-violet-50 border-violet-100", icon: "📖", path: "/hod/all-subjects" },
  ];

const HODDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hodName = user?.name || 'Department Head';
  const deptName = user?.department || 'Academic Division';

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Premium HOD Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="bg-white/10 text-indigo-200 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md">
            Department Chair Station
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Welcome Back, {hodName}</h2>
          <p className="text-slate-300 text-sm max-w-xl font-medium">
            {deptName} • Management & Oversight Deck
          </p>
        </div>
      </div>

      {/* Grid Section 1: Strategic Analytic Summary Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {analyticsMetrics.map((metric, i) => (
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

      {/* Grid Section 2: Core HOD Action Workspace Modules */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Administrative Action Matrix
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
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