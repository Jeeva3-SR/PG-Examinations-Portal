import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import useAuthStore from './store/useAuthStore';

// Admin Imports
import AdminDashboard from './pages/admin/dashboard';
import UserAssignments from './pages/admin/UserAssignments'; 
 // New structural import for admin user management

// Coordinator Feature Imports
import Dashboard from './pages/coordinator/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentInput from './pages/coordinator/StudentInput';
import Claims from './pages/coordinator/Claims';
import SeatingArrangement from './pages/coordinator/SeatingArrangement';
import AssignQPSetterTopLevel from './pages/coordinator/AssignQPSetter';
import DutyAssignment from './pages/coordinator/DutyAssignment';
import SeatingPlan from './pages/coordinator/SeatingPlan';
import RoomManagement from './pages/coordinator/RoomManagement';
import SessionView from './pages/coordinator/SessionView';
import CoordinatorResetPassword from './pages/coordinator/CoordinatorResetPassword';
import AnswerSheetRequest from './pages/coordinator/AnswerSheetRequest';
import SubjectAssignment from './pages/coordinator/SubjectAssignment';

// HOD Feature Imports
import ConsolidatedSessions from './pages/hod/ConsolidatedSessions';
import Letters from './pages/hod/FinalReports';
import SignOff from './pages/hod/SignOff';
import HODDashboard from './pages/hod/HODDashboard';
import ApproveQPOrders from './pages/hod/ApproveQPOrders';
import ResetPassword from './pages/hod/ResetPassword';

// Core Faculty View Imports
import FacultyDashboard from './pages/faculty/Dashboard';
import AssignedCourses from './pages/faculty/AssignedCourses';
import QPOrders from './pages/faculty/QPOrders';
import FacultyInvigilationDuty from './pages/faculty/InvigilationDuty';
import EvaluatorDetails from './pages/faculty/EvaluatorDetails';
import ReleaseClaim from './pages/faculty/ReleaseClaim';
import FacultyRegister from './pages/faculty/FacultyRegister';
import UpdateProfile from './pages/faculty/UpdateProfile';

// Layout Templates
import FacultyLayout from './components/layouts/Faculty';
import AdminLayout from './components/layouts/admin'; 

// Shared Components
import SettlementAllPages from './pages/settlement/SettlementAllPages';
import AboutPage from './pages/AboutPage';
import UserManual from './components/UserManual';
import UnifiedLogin from './pages/Login'; 
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordForm from './pages/ResetPasswordForm';
import ProtectedRoute from './components/ProtectedRoute';
import AllFaculties from './pages/AllFaculties';
import AllSubjects from './pages/AllSubjects';

const publicRoutes = ['/', '/login', '/about', '/forgot-password'];

const AppContent = () => {
  const location = useLocation();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);
  
  const isFullWidthPage = 
    publicRoutes.includes(location.pathname) || 
    location.pathname === '/faculty/register' ||
    location.pathname.startsWith('/reset-password/');

  return (
    <>
      <div className={isFullWidthPage ? 'w-full min-h-screen' : 'w-full min-h-screen'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UnifiedLogin />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/faculty/register" element={<FacultyRegister />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          
          {/* Admin Paradigm */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="assignments" element={<UserAssignments />} />
            </Route>
          </Route>

          {/* UNIFIED FACULTY PARADIGM CONTAINER */}
          <Route element={<ProtectedRoute allowedRoles={['Faculty']} />}>
            <Route path="/faculty/*" element={<FacultyLayout />}>
              {/* Core Operations */}
              <Route index element={<FacultyDashboard />} />
              <Route path="assigned-courses" element={<AssignedCourses />} />
              <Route path="qp-orders" element={<QPOrders />} />
              <Route path="invigilation-duty" element={<FacultyInvigilationDuty />} />
              <Route path="evaluator-details" element={<EvaluatorDetails />} />
              <Route path="release-claim" element={<ReleaseClaim />} />
              <Route path="update-profile" element={<UpdateProfile />} />
              <Route path="all-faculties" element={<AllFaculties />} />
              <Route path="all-subjects" element={<AllSubjects />} />

              {/* Coordinator Operations Namespace */}
              <Route path="coordinator/dashboard" element={<Dashboard />} />
              <Route path="coordinator/student-input" element={<StudentInput />} />
              <Route path="coordinator/sessions" element={<SessionView />} />
              <Route path="coordinator/duties" element={<DutyAssignment />} />
              <Route path="coordinator/claims" element={<Claims />} />
              <Route path="coordinator/users" element={<UserManagement />} />
              <Route path="coordinator/seating-arrangement" element={<SeatingArrangement />} />
              <Route path="coordinator/seating-plan" element={<SeatingPlan />} />
              <Route path="coordinator/rooms" element={<RoomManagement />} />
              <Route path="coordinator/assign-qpsetter" element={<AssignQPSetterTopLevel />} />
              <Route path="coordinator/letters" element={<AnswerSheetRequest />} />
              <Route path="coordinator/settlement" element={<SettlementAllPages />} />
              <Route path="coordinator/subject-assignments" element={<SubjectAssignment />} />
              <Route path="coordinator/reset-password" element={<CoordinatorResetPassword />} />

              {/* HOD Operations Namespace */}
              <Route path="hod/dashboard" element={<HODDashboard />} />
              <Route path="hod/consolidated-sessions" element={<ConsolidatedSessions />} />
              <Route path="hod/approve-qporders" element={<ApproveQPOrders />} />
              <Route path="hod/letters" element={<Letters />} />
              <Route path="hod/signoff" element={<SignOff />} />
              <Route path="hod/reset-password" element={<ResetPassword />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <UserManual />
    </>
  );
};

const App = () => (
  <LazyMotion features={domAnimation}>
    <Router>
      <AppContent />
    </Router>
  </LazyMotion>
);

export default App;