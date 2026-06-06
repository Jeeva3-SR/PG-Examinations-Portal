import React from 'react';
import Sidebar from './PageLayout'; // Ensure this points to your upgraded fluid Sidebar file
import { Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/hod/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: 'consolidated-sessions', label: 'Consolidated Sessions', icon: '📊' },
  { path: 'assign-qpsetter', label: 'Assign Faculty for QP', icon: '👥' },
  { path: 'approve-qporders', label: 'Approve QP Letters', icon: '📋' }, // Included missing operational screen item
  { path: 'letters', label: 'View Letters', icon: '📈' },
  { path: 'reset-password', label: 'Reset Password', icon: '🔑' },
  { path: '/logout', label: 'Sign Out Portal', icon: '🚪' },
];

const HODLayout = () => (
  // FIXED: Passed down the high-end dark slate and glowing indigo active parameters
  <Sidebar 
    menuItems={menuItems} 
    theme="bg-slate-900 text-slate-300 border-r border-slate-800" 
    activeClass="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10 rounded-xl"
  >
    {/* Full width flexible viewport workspace canvas */}
    <div className="min-h-screen bg-slate-50/50 w-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  </Sidebar>
);

export default HODLayout;