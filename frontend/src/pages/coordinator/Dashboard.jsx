import React from 'react';
import { Link } from 'react-router-dom';
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
    {
      title: 'Student Input System',
      description: 'Manage student profile parameters, batches, and master course registrations.',
      icon: Users,
      path: '/student-input',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Examination Sessions',
      description: 'View, schedule, and structure active university examination calendar slots.',
      icon: Calendar,
      path: '/sessions',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Seating Arrangements',
      description: 'Algorithmic room layouts generation and structural hall roll number mappings.',
      icon: ClipboardList,
      path: '/dashboard/seating-arrangement',
      color: 'text-purple-600 bg-purple-50 border-purple-100'
    },
    {
      title: 'Invigilation Duties',
      description: 'Assign and balance faculty room observation shifts without schedule conflicts.',
      icon: FileText,
      path: '/duties',
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      title: 'Expense Claims Matrix',
      description: 'Process and clear faculty valuation profiles and paper setting monetary clearances.',
      icon: DollarSign,
      path: '/claims',
      color: 'text-rose-600 bg-rose-50 border-rose-100'
    },
    {
      title: 'Assign QP Setters',
      description: 'Delegate official question paper creation tasks directly to approved faculty tokens.',
      icon: UserPlus,
      path: '/assign-qpsetter',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100'
    },
    {
      title: 'Subject Assignments',
      description: 'Map faculty to subjects by course code, year, semester, and batch.',
      icon: BookOpen,
      path: '/subject-assignments',
      color: 'text-teal-600 bg-teal-50 border-teal-100'
    },
    {
      title: 'All Faculties',
      description: 'View complete list of faculty members across the institution.',
      icon: GraduationCap,
      path: '/dashboard/all-faculties',
      color: 'text-sky-600 bg-sky-50 border-sky-100'
    },
    {
      title: 'All Subjects',
      description: 'Browse master list of all courses and subjects offered.',
      icon: Library,
      path: '/dashboard/all-subjects',
      color: 'text-violet-600 bg-violet-50 border-violet-100'
    }
  ];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

const Dashboard = () => {
  return (
    // FIXED: Removed the local duplicate <Sidebar> wrapper completely so it doesn't double-render headers!
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Premium Coordinator Greeting Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="bg-white/10 text-indigo-200 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md">
            Administrative Station Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Welcome Back, Portal Coordinator</h2>
          <p className="text-slate-300 text-sm max-w-xl font-medium">
            Manage institutional examinations, layout workflows, and central faculty claims parameters from a single command deck.
          </p>
        </div>
      </div>

      {/* Grid Section: System Action Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Operational Modules Matrix
          </h3>
        </div>

        <m.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {modules.map((module) => (
            <m.div
              key={module.path}
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="h-full"
            >
              <Link to={module.path} className="block h-full">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group">
                  <div className="space-y-4">
                    {/* Modern icon framing mirroring your high-end dashboard components */}
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform ${module.color}`}>
                      <module.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {module.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {module.description}
                      </p>
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