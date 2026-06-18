import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  ShieldCheck,
  LogOut, 
  User
} from 'lucide-react';

// Admin Sidebar Navigation Links
const adminLinks = [
  { label: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "User Management", path: "/admin/users", icon: Users },
  { label: "User Assignments", path: "/admin/assignments", icon: ShieldCheck },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* SIDEBAR STATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-30 w-64 
        bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 
        text-white flex flex-col justify-between shadow-xl 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
      `}>
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="p-6 border-b border-white/10 bg-black/10 flex items-center justify-between">
              <div>
                <h1 className="text-sm font-black tracking-widest text-white uppercase">PG Examinations</h1>
                <p className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase mt-0.5">Admin Control Panel</p>
              </div>
              <button className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
              {adminLinks.map((item) => {
                const matchesActive = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all ${
                      matchesActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-white/10 bg-black/10">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out Portal</span>
            </button>
          </div>
        </div>
      </aside>

      {/* BODY CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 pl-3 pr-4 py-1.5 rounded-xl shadow-sm max-w-[240px]">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-indigo-600/10">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-black text-slate-800 truncate leading-tight">{user?.name || 'System Admin'}</p>
              <p className="text-[10px] text-slate-400 font-bold truncate tracking-wide">ID: {user?.facultyId || 'ADMIN'}</p>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;