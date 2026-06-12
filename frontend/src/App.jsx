  import React, { useEffect } from 'react';
  import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
  import { LazyMotion, domAnimation } from 'framer-motion';
  import useAuthStore from './store/useAuthStore';

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
  import AssignQPSetterTopLevel from './pages/coordinator/AssignQPSetter';
  import DutyAssignment from './pages/coordinator/DutyAssignment';
  import SeatingPlan from './pages/coordinator/SeatingPlan';
  import RoomManagement from './pages/coordinator/RoomManagement';
  import SessionView from './pages/coordinator/SessionView';
  import CoordinatorResetPassword from './pages/coordinator/CoordinatorResetPassword';
  import AnswerSheetRequest from './pages/coordinator/AnswerSheetRequest';
  import SubjectAssignment from './pages/coordinator/SubjectAssignment';

  import ConsolidatedSessions from './pages/hod/ConsolidatedSessions';
 
  import Letters from './pages/hod/FinalReports';
  import SignOff from './pages/hod/SignOff';
  import FacultyLayout from './components/layouts/Faculty';
  import HODLayout from './components/layouts/HOD';
  import HODDashboard from './pages/hod/HODDashboard';

  import SettlementAllPages from './pages/settlement/SettlementAllPages';
  import AboutPage from './pages/AboutPage';
  import ResetPassword from './pages/hod/ResetPassword';
  import UserManual from './components/UserManual';
  import UnifiedLogin from './pages/Login'; 
  import NotFound from './pages/NotFound'; 
  import CoordinatorLayout from './components/layouts/Coordinator';
  import ApproveQPOrders from './pages/hod/ApproveQPOrders';
  import ForgotPassword from './pages/ForgotPassword';
  import ResetPasswordForm from './pages/ResetPasswordForm';

  import ProtectedRoute from './components/ProtectedRoute';
  import AllFaculties from './pages/AllFaculties';
  import AllSubjects from './pages/AllSubjects';

  const AppContent = () => {
    const location = useLocation();
    const hydrate = useAuthStore((s) => s.hydrate);

    useEffect(() => { hydrate(); }, [hydrate]);

    const publicRoutes = ['/', '/login', '/hod/login', '/about', '/forgot-password'];
    const isFullWidthPage = 
      publicRoutes.includes(location.pathname) || 
      location.pathname === '/faculty/register' ||
      location.pathname.startsWith('/reset-password/');

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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
            
            <Route element={<ProtectedRoute allowedRoles={['Coordinator']} />}>
              <Route element={<CoordinatorLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student-input" element={<StudentInput />} />
                <Route path="/sessions" element={<SessionView />} />
                <Route path="/duties" element={<DutyAssignment />} />
                <Route path="/claims" element={<Claims />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/dashboard/seating-arrangement" element={<SeatingArrangement />} />
                <Route path="/dashboard/seating-plan" element={<SeatingPlan />} />
                <Route path="/dashboard/rooms" element={<RoomManagement />} />
                <Route path="/assign-qpsetter" element={<AssignQPSetterTopLevel />} />
                <Route path="/letters" element={<AnswerSheetRequest />} />
                <Route path="/settlement-all-pages" element={<SettlementAllPages />} />
                <Route path="/subject-assignments" element={<SubjectAssignment />} />
                <Route path="/dashboard/all-faculties" element={<AllFaculties />} />
                <Route path="/dashboard/all-subjects" element={<AllSubjects />} />
                <Route path="/coordinator/reset-password" element={<CoordinatorResetPassword />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
              <Route path="/hod/*" element={<HODLayout />}>
                <Route index element={<HODDashboard />} />
                <Route path="dashboard" element={<HODDashboard />} />
                <Route path="consolidated-sessions" element={<ConsolidatedSessions />} />
                <Route path="approve-qporders" element={<ApproveQPOrders />} />
                <Route path="letters" element={<Letters />} />
                <Route path="signoff" element={<SignOff />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="all-faculties" element={<AllFaculties />} />
                <Route path="all-subjects" element={<AllSubjects />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Faculty']} />}>
              <Route path="/faculty/*" element={<FacultyLayout />}>
                <Route index element={<FacultyDashboard />} />
                <Route path="assigned-courses" element={<AssignedCourses />} />
                <Route path="qp-orders" element={<QPOrders />} />
                <Route path="invigilation-duty" element={<FacultyInvigilationDuty />} />
                <Route path="evaluator-details" element={<EvaluatorDetails />} />
                <Route path="release-claim" element={<ReleaseClaim />} />
                <Route path="update-profile" element={<UpdateProfile />} />
                <Route path="all-faculties" element={<AllFaculties />} />
                <Route path="all-subjects" element={<AllSubjects />} />
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