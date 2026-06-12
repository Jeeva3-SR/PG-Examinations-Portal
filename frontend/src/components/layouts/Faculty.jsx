import AppLayout from './AppLayout';
import { Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/faculty', label: 'Dashboard', icon: '🏠' },
  { path: '/faculty/assigned-courses', label: 'Assigned Courses', icon: '📚' },
  { path: '/faculty/qp-orders', label: 'Question Paper Orders', icon: '📄' },
  { path: '/faculty/invigilation-duty', label: 'Invigilation Duties', icon: '👥' },
  { path: '/faculty/evaluator-details', label: 'Evaluator Tasks', icon: '🎯' },
  { path: '/faculty/release-claim', label: 'Financial Claims', icon: '💸' },
  { path: '/faculty/update-profile', label: 'Maintain Profile', icon: '📝' },
  { path: '/faculty/all-faculties', label: 'All Faculties', icon: '👨‍🏫' },
  { path: '/faculty/all-subjects', label: 'All Subjects', icon: '📖' },
  { path: '/login', label: 'Sign Out Portal', icon: '🚪' },
];

const Faculty = () => (
  <AppLayout menuItems={menuItems}>
    <Outlet />
  </AppLayout>
);

export default Faculty;
