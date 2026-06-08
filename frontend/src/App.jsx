  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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
  import NotFound from './pages/NotFound'; 
  import CoordinatorLayout from './components/layouts/Coordinator';
  import ApproveQPOrders from './pages/hod/ApproveQPOrders';

  import ProtectedRoute from './components/ProtectedRoute';

  const AppContent = () => {
    const location = useLocation();
    const publicRoutes = ['/', '/login', '/hod/login', '/about'];
    const isFullWidthPage = publicRoutes.includes(location.pathname) || location.pathname === '/faculty/register';

    return (
      <>
        <div className={isFullWidthPage ? 'w-full min-h-screen' : 'container mx-auto px-4 py-8'}>
          <Routes>
            {/* Public Base Entry Routes */}
            <Route path="/" element={<UnifiedLogin />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/hod/login" element={<UnifiedLogin />} />
            <Route path="/faculty/register" element={<FacultyRegister />} />
            <Route path="/about" element={<AboutPage />} />
            
            {/* ========================================================= */}
            {/* 🛡️ SECURITY LAYER: COORDINATOR REGION */}
            {/* ========================================================= */}
            <Route element={<ProtectedRoute allowedRoles={['Coordinator']} />}>
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
            </Route>

            {/* ========================================================= */}
            {/* 🛡️ SECURITY LAYER: HEAD OF DEPARTMENT (HOD) REGION */}
            {/* ========================================================= */}
            <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
              {/* ⚡ FIX: Added structural wildcard layer context to ensure accurate root layout resolution checks */}
              <Route path="/hod/*" element={<HODLayout />}>
                <Route index element={<HODDashboard />} />
                <Route path="dashboard" element={<HODDashboard />} />
                <Route path="consolidated-sessions" element={<ConsolidatedSessions />} />
                {/* ⚡ FIX: Resolves the 'hod/dashboard/assign-qpsetter' stack loop explicitly */}
                <Route path="approve-qporders" element={<ApproveQPOrders />} />
                <Route path="letters" element={<Letters />} />
                <Route path="signoff" element={<SignOff />} />
                <Route path="reset-password" element={<ResetPassword />} />
              </Route>
            </Route>

            {/* ========================================================= */}
            {/* 🛡️ SECURITY LAYER: FACULTY PORTAL TERMINALS */}
            {/* ========================================================= */}
            <Route element={<ProtectedRoute allowedRoles={['Faculty']} />}>
              <Route path="/faculty/*" element={<FacultyLayout />}>
                <Route index element={<FacultyDashboard />} />
                <Route path="assigned-courses" element={<AssignedCourses />} />
                <Route path="qp-orders" element={<QPOrders />} />
                <Route path="invigilation-duty" element={<FacultyInvigilationDuty />} />
                <Route path="evaluator-details" element={<EvaluatorDetails />} />
                <Route path="release-claim" element={<ReleaseClaim />} />
                <Route path="update-profile" element={<UpdateProfile />} />
              </Route>
            </Route>

            {/* Universal Catch-All 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <UserManual />
      </>
    );
  };

  const App = () => (
    <Router>
      <AppContent />
    </Router>
  );

  export default App;