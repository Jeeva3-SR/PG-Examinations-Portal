import React from 'react';
import Sidebar from './PageLayout'; // Ensure this matches your sidebar filename case exactly
import { Outlet } from 'react-router-dom';

// 🛡️ FULLY FIXED ABSOLUTE PATH CONFIGURATIONS
const menuItems = [
  { path: '/hod/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/hod/assign-qpsetter', label: 'Assign QP Setter', icon: '📝' }, // ⚡ FIXES THE DASHBOARD STACK LOOP
  { path: '/hod/consolidated-sessions', label: 'Consolidated Sessions', icon: '📚' },
  { path: '/hod/approve-qporders', label: 'Approve QP Orders', icon: '📋' },
  { path: '/hod/letters', label: 'Final Reports', icon: '✉️' },
  { path: '/hod/signoff', label: 'Sign Off', icon: '✅' },
  { path: '/hod/reset-password', label: 'Reset Password', icon: '🔑' },
  { path: '/login', label: 'Sign Out Portal', icon: '🚪' },
];

const HODLayout = () => {
  return (
    <Sidebar 
      menuItems={menuItems} 
      theme="bg-slate-900 text-slate-300 border-r border-slate-800" 
      activeClass="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10 rounded-xl"
    >
      {/* Edge-to-edge flexible desktop container canvas */}
      <div className="min-h-screen bg-slate-50/50 w-full p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet /> {/* This correctly passes down your inner HOD dashboard and pages */}
        </div>
      </div>
    </Sidebar>
  );
};

export default HODLayout;