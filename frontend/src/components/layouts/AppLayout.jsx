import Sidebar from './PageLayout';
import { Outlet } from 'react-router-dom';

const AppLayout = ({ menuItems }) => (
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

export default AppLayout;
