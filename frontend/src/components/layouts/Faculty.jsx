import React from 'react';
import Sidebar from './PageLayout';
import { Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/faculty', label: 'Dashboard', icon: '🏠' },
  { path: 'assigned-courses', label: 'Assigned Courses', icon: '📚' },
  { path: 'qp-orders', label: 'Question Paper Orders', icon: '📄' },
  { path: 'invigilation-duty', label: 'Invigilation Duties', icon: '👥' },
  { path: 'evaluator-details', label: 'Evaluator Tasks', icon: '🎯' }, // Added functional missing view
  { path: 'release-claim', label: 'Financial Claims', icon: '💸' },      // Added functional missing view
  { path: 'update-profile', label: 'Maintain Profile', icon: '📝' },
  { path: '/logout', label: 'Sign Out Portal', icon: '🚪' },
];

const FacultyLayout = () => (
  /* Upgraded layout properties to modern canvas styling colors */
  <Sidebar 
    menuItems={menuItems} 
    theme="bg-slate-900 text-slate-300 border-r border-slate-800" 
    activeClass="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10 rounded-xl"
  >
    {/* Clean, edge-to-edge flexible desktop staging panel */}
    <div className="min-h-screen bg-slate-50/50 w-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  </Sidebar>
);

export default FacultyLayout;