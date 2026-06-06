import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate} from 'react-router-dom';

import Dashboard from './pages/coordinator/Dashboard';
import UserManagement from './pages/coordinator/UserManagement';

import FacultyDashboard from './pages/faculty/Dashboard';
import AssignedCourses from './pages/faculty/AssignedCourses';
import QPOrders from './pages/faculty/QPOrders';
import FacultyInvigilationDuty from './pages/faculty/InvigilationDuty';
import EvaluatorDetails from './pages/faculty/EvaluatorDetails';
import ReleaseClaim from './pages/faculty/ReleaseClaim';
import FacultyRegister from './pages/faculty/FacultyRegister';
import UpdateProfile from './pages/faculty/UpdateProfile';

import StudentInput from './pages/coordinator/StudentInput';
import Claims from './pages/coordinator/Claims';
import SeatingArrangement from './pages/coordinator/SeatingArrangement';
import AssignQPSetterTopLevel from './pages/coordinator/assign-qpsetter';
import DutyAssignment from './pages/coordinator/DutyAssignment';
import SessionView from './pages/coordinator/SessionView';
import CoordinatorResetPassword from './pages/coordinator/CoordinatorResetPassword';
import AnswerSheetRequest from './pages/coordinator/AnswerSheetRequest';

import ConsolidatedSessions from './pages/hod/ConsolidatedSessions';
import AssignQpSetter from './pages/hod/AssignQpSetter';
import Letters from './pages/hod/FinalReports';
import SignOff from './pages/hod/SignOff';
import FacultyLayout from './components/layouts/Faculty';
import HODLayout from './components/layouts/hod';
import HODDashboard from './pages/hod/HODDashboard';

import SettlementAllPages from './pages/settlement/SettlementAllPages';
import AboutPage from './pages/AboutPage';
import ResetPassword from './pages/hod/ResetPassword';
import UserManual from './components/UserManual';
import UnifiedLogin from './pages/Login'; 

// IMPORTED: Professional custom 404 handler page 
import NotFound from './pages/NotFound'; 

// IMPORTED: Professional custom Coordinator layout page 
import CoordinatorLayout from './components/layouts/Coordinator';
import ApproveQPOrders from './pages/hod/ApproveQPOrders';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  // List of all base routes managed by the Coordinator Workspace layout
  const coordinatorSubPaths = [
    '/dashboard', '/student-input', '/sessions', '/duties', '/claims', 
    '/users', '/dashboard/seating-arrangement', '/assign-qpsetter', 
    '/letters', '/settlement-all-pages', '/coordinator/reset-password'
  ];

  // List of universal public routes
  const publicRoutes = ['/', '/login', '/hod/login', '/faculty/login', '/faculty/register', '/about'];

  const isFacultySubRoute = location.pathname.startsWith('/faculty');
  const isHodSubRoute = location.pathname.startsWith('/hod');
  const isCoordinatorSubRoute = coordinatorSubPaths.includes(location.pathname);
  
  // FIXED: Cleaner, bulletproof verification catching sub-route parameters accurately
  const isKnownRoute = publicRoutes.includes(location.pathname) || isFacultySubRoute || isHodSubRoute || isCoordinatorSubRoute;

  useEffect(() => {
    // If the user types a completely undefined/broken URL route link, skip the auth checks so 404 handles it
    if (!isKnownRoute) return;

    // Secure operational area access parameter rules
    if (
      !userRole && 
      location.pathname !== '/login' && 
      location.pathname !== '/' && 
      location.pathname !== '/about' && 
      location.pathname !== '/faculty/register' &&
      !location.pathname.startsWith('/faculty/login') && 
      !location.pathname.startsWith('/hod/login')
    ) {
      navigate('/login');
    }
    else if (userRole === 'Faculty' && (location.pathname === '/dashboard' || location.pathname === '/login' || location.pathname === '/')) {
      navigate('/faculty');
    }
    else if (userRole === 'HOD' && (location.pathname === '/dashboard' || location.pathname === '/login' || location.pathname === '/')) {
      navigate('/hod/dashboard');
    }
    else if (userRole === 'Coordinator' && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/dashboard');
    }
  }, [userRole, location.pathname, navigate, isKnownRoute]);

  // FIXED: Added isHodSubRoute support explicitly to dynamic style evaluation handlers
  const isFullWidthPage = 
    publicRoutes.includes(location.pathname) ||
    isFacultySubRoute ||
    isHodSubRoute ||
    isCoordinatorSubRoute ||
    !isKnownRoute; 

  return (
    <>
      {/* Dynamic Main Workspace Wrapper Grid Canvas Box */}
      <div className={isFullWidthPage ? 'w-full min-h-screen' : 'container mx-auto px-4 py-8'}>
        <Routes>
          {/* Universal Entry Gate Routes */}
          <Route path="/" element={<UnifiedLogin />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/hod/login" element={<UnifiedLogin />} />
          <Route path="/faculty/login" element={<UnifiedLogin />} />
          
          <Route path="/faculty/register" element={<FacultyRegister />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* ========================================================= */}
          {/* COORDINATOR WORKSPACE: Nested under the premium design layout */}
          {/* ========================================================= */}
          <Route element={<CoordinatorLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student-input" element={<StudentInput />} />
            <Route path="/sessions" element={<SessionView />} />
            <Route path="/duties" element={<DutyAssignment />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/dashboard/seating-arrangement" element={<SeatingArrangement />} />
            <Route path="/assign-qpsetter" element={<AssignQPSetterTopLevel />} />
            <Route path="/letters" element={<AnswerSheetRequest />} />
            <Route path="/settlement-all-pages" element={<SettlementAllPages />} />
            <Route path="/coordinator/reset-password" element={<CoordinatorResetPassword />} />
          </Route>

          {/* Head Of Department (HOD) Nest Workspace Layout */}
          <Route path="/hod" element={<HODLayout />}>
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="consolidated-sessions" element={<ConsolidatedSessions />} />
            <Route path="assign-qpsetter" element={<AssignQpSetter />} />
            <Route path="approve-qporders" element={<ApproveQPOrders />} />
            <Route path="letters" element={<Letters />} />
            <Route path="signoff" element={<SignOff />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Premium Faculty Workspace Layout */}
          <Route path="/faculty" element={<FacultyLayout />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="assigned-courses" element={<AssignedCourses />} />
            <Route path="qp-orders" element={<QPOrders />} />
            <Route path="invigilation-duty" element={<FacultyInvigilationDuty />} />
            <Route path="evaluator-details" element={<EvaluatorDetails />} />
            <Route path="release-claim" element={<ReleaseClaim />} />
            <Route path="update-profile" element={<UpdateProfile />} />
          </Route>

          {/* GLOBAL WILDCARD CATCH-ALL: Renders the professional 404 system page on any undefined route paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      <UserManual />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;