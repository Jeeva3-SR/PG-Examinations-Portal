import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ menuItems, theme = 'bg-slate-900 text-slate-300 border-r border-slate-800', activeClass = 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10 rounded-xl', children }) => {
  // Start sidebar open on larger displays for professional workflows
  const [open, setOpen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle auto-closing on route navigation (for mobile displays)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  }, [location]);

  // Handle real-time window resizing dynamics
  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 relative overflow-x-hidden font-sans">
      
      {/* Mobile Background Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION FRAME */}
      <aside className={`fixed z-50 top-0 left-0 h-full w-72 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-72'} ${theme}`}>
        
        <div className="flex flex-col flex-1">
          {/* Header Branding */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                <span className="font-black text-sm tracking-wider text-white">E</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">PG Examinations</span>
            </div>
            
            {/* Elegant Close Icon Trigger (Visible on mobile/tablet) */}
            <button 
              onClick={() => setOpen(false)} 
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links Loop */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              // FIXED: Flexible checks capturing variations of sign-out terms (Logout / Sign Out Portal)
              const isLogout = item.label.toLowerCase().includes('log') || item.label.toLowerCase().includes('sign out');

              if (isLogout) {
                return (
                  <a
                    key={item.path}
                    href="/"
                    onClick={handleLogout}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group mt-8"
                  >
                    {item.icon && <span className="mr-3 text-lg group-hover:scale-110 transition-transform">{item.icon}</span>}
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/faculty'} // Prevents active class collisions on index route dashboards
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all group tracking-wide ${
                      isActive 
                        ? activeClass 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`
                  }
                >
                  {item.icon && (
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Minimalist Footnote Signature */}
        <div className="px-6 py-4 border-t border-slate-800/40 text-[10px] text-slate-500 font-medium tracking-wide">
          v2.0.26 Infrastructure Station
        </div>
      </aside>

      {/* DYNAMIC MAIN WORKSPACE CANVAS */}
      {/* FIXED: Dynamic padding adjustment offsets based on live 'open' layout state to eliminate sizing alignment bugs */}
      <div className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out ${open ? 'lg:pl-72' : 'lg:pl-0'}`}>
        
        {/* Dynamic Context Control Bar Panel */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            {/* Upgraded Sidebar Hamburger Toggle Button */}
            <button
              onClick={() => setOpen(!open)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all active:scale-95 outline-none focus:ring-2 focus:ring-indigo-100"
              title={open ? "Collapse Navigation Workspace" : "Expand Navigation Workspace"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider"> PG Examinations Portal</span>
          
            </div>
          </div>
          
          
        </header>

        {/* Main Routed Children Views Staging Target */}
        <main className="flex-1 w-full animate-fadeIn">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Sidebar;