import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  Users,
  Calendar,
  ClipboardList,
  FileText,
  DollarSign,
  UserPlus,
  BookOpen,
  GraduationCap,
  Library
} from 'lucide-react';

const modules = [
  { title: 'Student Input System', description: 'Manage student profile parameters, batches, and master course registrations.', icon: Users, path: '/faculty/coordinator/student-input', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  { title: 'Examination Sessions', description: 'View, schedule, and structure active university examination calendar slots.', icon: Calendar, path: '/faculty/coordinator/sessions', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { title: 'Seating Arrangements', description: 'Algorithmic room layouts generation and structural hall roll number mappings.', icon: ClipboardList, path: '/faculty/coordinator/seating-arrangement', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { title: 'Invigilation Duties', description: 'Assign and balance faculty room observation shifts without schedule conflicts.', icon: FileText, path: '/faculty/coordinator/duties', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { title: 'Expense Claims Matrix', description: 'Process and clear faculty valuation profiles and paper setting monetary clearances.', icon: DollarSign, path: '/faculty/coordinator/claims', color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { title: 'Assign QP Setters', description: 'Delegate official question paper creation tasks directly to approved faculty tokens.', icon: UserPlus, path: '/faculty/coordinator/assign-qpsetter', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
  { title: 'Subject Assignments', description: 'Map faculty to subjects by course code, year, semester, and batch.', icon: BookOpen, path: '/faculty/coordinator/subject-assignments', color: 'text-teal-600 bg-teal-50 border-teal-100' },
  { title: 'All Faculties', description: 'View complete list of faculty members across the institution.', icon: GraduationCap, path: '/faculty/all-faculties', color: 'text-sky-600 bg-sky-50 border-sky-100' },
  { title: 'All Subjects', description: 'Browse master list of all courses and subjects offered.', icon: Library, path: '/faculty/all-subjects', color: 'text-violet-600 bg-violet-50 border-violet-100' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Premium Coordinator Greeting Banner - Height Explicitly Fixed to md:h-52 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.25)] border border-blue-900/30 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:h-52">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
        
        {/* Left Side Content Container */}
        <div className="relative z-10 flex flex-col justify-center h-full space-y-2 pr-0 md:pr-[320px]">
          <div>
            <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md">
              Coordinator Dashboard 
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight line-clamp-1">Welcome Back, Portal Coordinator</h2>
          <p className="text-slate-300 text-sm font-medium line-clamp-1">
            Manage institutional examinations, layout workflows, and central faculty claims parameters from a single command deck.
          </p>
        </div>

        {/* Right Side Switcher Box - Sized identically to other views */}
        <div className="md:absolute md:top-8 md:right-8 z-20 w-full md:w-[290px]">
          <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-xl p-4 rounded-xl flex flex-col justify-between h-[144px] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Switcher</p>
              </div>
              <p className="text-xs text-slate-200 font-bold leading-tight">Need to manage individual classes or view courses?</p>
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

      {/* Operational Modules Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Operational Modules Matrix</h3>
        </div>

        <m.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
          {modules.map((module) => (
            <m.div key={module.path} variants={itemVariants} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }} className="h-full">
              <Link to={module.path} className="block h-full">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform ${module.color}`}>
                      <module.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{module.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{module.description}</p>
                    </div>
                  </div>
                  <div className="pt-5 text-xs font-bold text-indigo-600 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0">
                    <span>Open Terminal</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </m.div>
      </div>
    </div>
  );
};

export default Dashboard;