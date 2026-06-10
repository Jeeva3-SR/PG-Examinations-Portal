import React from 'react';
import Sidebar from './PageLayout'; // Points directly to your premium Sidebar component
import { Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/student-input', label: 'Student Input', icon: '👨‍🎓' },
  { path: '/sessions', label: 'Session Views', icon: '📅' },
  { path: '/assign-qpsetter', label: 'Assign QP Setter', icon: '📝' },
  { path: '/subject-assignments', label: 'Subject Assignments', icon: '📚' },
  { path: '/dashboard/all-faculties', label: 'All Faculties', icon: '👨‍🏫' },
  { path: '/dashboard/all-subjects', label: 'All Subjects', icon: '📖' },
  { path: '/dashboard/rooms', label: 'Room Management', icon: '🏛️' },
  { path: '/dashboard/seating-arrangement', label: 'Seating Arrangement', icon: '🪑' },
  { path: '/duties', label: 'Duty Assignments', icon: '👥' },
  { path: '/claims', label: 'Expense Claims', icon: '💸' },
  { path: '/letters', label: 'Answer Sheets', icon: '📄' },
  { path: '/users', label: 'User Management', icon: '⚙️' },
  { path: '/coordinator/reset-password', label: 'Reset Password', icon: '🔑' },
  { path: '/logout', label: 'Sign Out Portal', icon: '🚪' },
];

const Coordinator = () => (
  <Sidebar 
    menuItems={menuItems} 
    theme="bg-slate-900 text-slate-300 border-r border-slate-800" 
    activeClass="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10 rounded-xl"
  >
    {/* Full width flexible viewport area */}
    <div className="min-h-screen bg-slate-50/50 w-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  </Sidebar>
);

export default Coordinator;