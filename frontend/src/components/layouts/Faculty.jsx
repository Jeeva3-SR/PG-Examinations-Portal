import React from 'react';
import Sidebar from '../layouts/PageLayout';
import { Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/faculty', label: 'Dashboard', icon: '🏠' },
  { path: '/faculty/assigned-courses', label: 'Assigned Courses', icon: '📚' },
  { path: '/faculty/qp-orders', label: 'Question Paper Orders', icon: '📄' },
  { path: '/faculty/invigilation-duty', label: 'Invigilation Duties', icon: '👥' },
  { path: '/faculty/evaluator-details', label: 'Evaluator Tasks', icon: '🎯' }, 
  { path: '/faculty/release-claim', label: 'Financial Claims', icon: '💸' },      
  { path: '/faculty/update-profile', label: 'Maintain Profile', icon: '📝' },
  { path: '/login', label: 'Sign Out Portal', icon: '🚪' },
];

const Faculty = () => (
  <Sidebar 
    menuItems={menuItems} 
    theme="bg-slate-900 text-slate-300 border-r border-slate-800" 
    activeClass="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10 rounded-xl"
  >
    <div className="min-h-screen bg-slate-50/50 w-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  </Sidebar>
);

export default Faculty;