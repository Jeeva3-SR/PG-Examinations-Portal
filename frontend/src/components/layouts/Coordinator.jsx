import AppLayout from './AppLayout';
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
  <AppLayout menuItems={menuItems}>
    <Outlet />
  </AppLayout>
);

export default Coordinator;
