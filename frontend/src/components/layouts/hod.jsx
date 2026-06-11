import AppLayout from './AppLayout';
import { Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/hod/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/hod/consolidated-sessions', label: 'Consolidated Sessions', icon: '📚' },
  { path: '/hod/approve-qporders', label: 'Approve QP Orders', icon: '📋' },
  { path: '/hod/all-faculties', label: 'All Faculties', icon: '👨‍🏫' },
  { path: '/hod/all-subjects', label: 'All Subjects', icon: '📖' },
  { path: '/hod/letters', label: 'Final Reports', icon: '✉️' },
  { path: '/hod/signoff', label: 'Sign Off', icon: '✅' },
  { path: '/hod/reset-password', label: 'Reset Password', icon: '🔑' },
  { path: '/login', label: 'Sign Out Portal', icon: '🚪' },
];

const HODLayout = () => (
  <AppLayout menuItems={menuItems}>
    <Outlet />
  </AppLayout>
);

export default HODLayout;
