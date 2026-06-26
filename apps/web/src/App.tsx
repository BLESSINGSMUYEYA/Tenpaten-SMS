import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PrivateRoute, PublicRoute } from './components/RouteGuards';
import { OnlineContextProvider } from './contexts/OnlineContext';
import { OfflineBar } from './components/OfflineBar';

// ─── Lazy-loaded pages (code splitting) ───────────────────────────────────────

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ChangePasswordPage = lazy(() => import('./pages/auth/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));

// Landing
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));

// Head Teacher
const HeadTeacherDashboard = lazy(() => import('./pages/HeadTeacherDashboard').then(m => ({ default: m.HeadTeacherDashboard })));
const HeadTeacherPeople = lazy(() => import('./pages/HeadTeacherPeople').then(m => ({ default: m.HeadTeacherPeople })));
const HeadTeacherAcademic = lazy(() => import('./pages/HeadTeacherAcademic').then(m => ({ default: m.HeadTeacherAcademic })));
const HeadTeacherTimetable = lazy(() => import('./pages/HeadTeacherTimetable').then(m => ({ default: m.HeadTeacherTimetable })));
const HeadTeacherAttendance = lazy(() => import('./pages/HeadTeacherAttendance').then(m => ({ default: m.HeadTeacherAttendance })));
const HeadTeacherSettings = lazy(() => import('./pages/HeadTeacherSettings').then(m => ({ default: m.HeadTeacherSettings })));

// Teacher
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const TeacherClasses = lazy(() => import('./pages/TeacherClasses').then(m => ({ default: m.TeacherClasses })));
const TeacherAssignments = lazy(() => import('./pages/TeacherAssignments').then(m => ({ default: m.TeacherAssignments })));
const TeacherGrades = lazy(() => import('./pages/TeacherGrades').then(m => ({ default: m.TeacherGrades })));
const TeacherSchedule = lazy(() => import('./pages/TeacherSchedule').then(m => ({ default: m.TeacherSchedule })));
const TeacherAttendance = lazy(() => import('./pages/TeacherAttendance').then(m => ({ default: m.TeacherAttendance })));

// Deputy Head
const DeputyHeadDashboard = lazy(() => import('./pages/DeputyHeadDashboard').then(m => ({ default: m.DeputyHeadDashboard })));
const DeputyHeadStaff = lazy(() => import('./pages/DeputyHeadStaff').then(m => ({ default: m.DeputyHeadStaff })));
const DeputyHeadAcademics = lazy(() => import('./pages/DeputyHeadAcademics').then(m => ({ default: m.DeputyHeadAcademics })));
const DeputyHeadDiscipline = lazy(() => import('./pages/DeputyHeadDiscipline').then(m => ({ default: m.DeputyHeadDiscipline })));
const DeputyHeadTimetable = lazy(() => import('./pages/DeputyHeadTimetable').then(m => ({ default: m.DeputyHeadTimetable })));
const DeputyHeadAttendance = lazy(() => import('./pages/DeputyHeadAttendance').then(m => ({ default: m.DeputyHeadAttendance })));
const DeputyHeadStudents = lazy(() => import('./pages/DeputyHeadStudents').then(m => ({ default: m.DeputyHeadStudents })));
const DeputyHeadSettings = lazy(() => import('./pages/DeputyHeadSettings').then(m => ({ default: m.DeputyHeadSettings })));

// Other roles
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })));

// Bursar
const BursarDashboard = lazy(() => import('./pages/BursarDashboard').then(m => ({ default: m.BursarDashboard })));
const BursarFees = lazy(() => import('./pages/BursarFees').then(m => ({ default: m.BursarFees })));
const BursarPayments = lazy(() => import('./pages/BursarPayments').then(m => ({ default: m.BursarPayments })));
const BursarStudents = lazy(() => import('./pages/BursarStudents').then(m => ({ default: m.BursarStudents })));
const BursarSettings = lazy(() => import('./pages/BursarSettings').then(m => ({ default: m.BursarSettings })));

// Super Admin
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const SuperAdminSchools = lazy(() => import('./pages/SuperAdminSchools').then(m => ({ default: m.SuperAdminSchools })));
const SuperAdminSchoolDetail = lazy(() => import('./pages/SuperAdminSchoolDetail').then(m => ({ default: m.SuperAdminSchoolDetail })));
const SuperAdminUsers = lazy(() => import('./pages/SuperAdminUsers').then(m => ({ default: m.SuperAdminUsers })));
const SuperAdminSettings = lazy(() => import('./pages/SuperAdminSettings').then(m => ({ default: m.SuperAdminSettings })));
const SuperAdminAnalytics = lazy(() => import('./pages/SuperAdminAnalytics').then(m => ({ default: m.SuperAdminAnalytics })));
const SuperAdminBilling = lazy(() => import('./pages/SuperAdminBilling').then(m => ({ default: m.SuperAdminBilling })));
const SuperAdminSupport = lazy(() => import('./pages/SuperAdminSupport').then(m => ({ default: m.SuperAdminSupport })));
const SuperAdminBroadcast = lazy(() => import('./pages/SuperAdminBroadcast').then(m => ({ default: m.SuperAdminBroadcast })));
const SuperAdminAuditLog = lazy(() => import('./pages/SuperAdminAuditLog').then(m => ({ default: m.SuperAdminAuditLog })));
const SuperAdminPlatform = lazy(() => import('./pages/SuperAdminPlatform').then(m => ({ default: m.SuperAdminPlatform })));

// IT Coordinator
const ITCoordinatorDashboard = lazy(() => import('./pages/ITCoordinatorDashboard').then(m => ({ default: m.ITCoordinatorDashboard })));
const ITCoordinatorInfrastructure = lazy(() => import('./pages/ITCoordinatorInfrastructure').then(m => ({ default: m.ITCoordinatorInfrastructure })));
const ITCoordinatorUsers = lazy(() => import('./pages/ITCoordinatorUsers').then(m => ({ default: m.ITCoordinatorUsers })));
const ITCoordinatorSettings = lazy(() => import('./pages/ITCoordinatorSettings').then(m => ({ default: m.ITCoordinatorSettings })));

// School Director
const SchoolDirectorDashboard = lazy(() => import('./pages/SchoolDirectorDashboard').then(m => ({ default: m.SchoolDirectorDashboard })));
const SchoolDirectorReports = lazy(() => import('./pages/SchoolDirectorReports').then(m => ({ default: m.SchoolDirectorReports })));
const SchoolDirectorSettings = lazy(() => import('./pages/SchoolDirectorSettings').then(m => ({ default: m.SchoolDirectorSettings })));

// Unified Setup
const SchoolSetupWizard = lazy(() => import('./pages/SchoolSetupWizard').then(m => ({ default: m.SchoolSetupWizard })));

// ─── Page loading fallback ────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-on-surface-variant text-sm font-medium">Loading...</p>
    </div>
  </div>
);

// ─── Unauthorized page ────────────────────────────────────────────────────────
const UnauthorizedPage: React.FC = () => (
  <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-md bg-grid-pattern relative overflow-hidden">
    {/* Ambient orbs */}
    <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed opacity-20 blur-[100px] pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary-container opacity-20 blur-[100px] pointer-events-none" />
    <div className="max-w-md w-full glassmorphism rounded-3xl p-xl border border-outline-variant text-center animate-slide-in-bottom relative z-10">
      <div className="text-error text-4xl mb-md font-bold">403</div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-sm">Access Denied</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg leading-relaxed">
        Your user role does not possess permissions to view this resource. If you believe this is an error, please contact your school administrator.
      </p>
      <Link to="/" className="w-full inline-block bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-[10px] rounded-xl transition-colors">
        Return Home
      </Link>
    </div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <OnlineContextProvider>
        <AuthProvider>
          <BrowserRouter>
            <OfflineBar />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />

              {/* Forced Password Reset */}
              <Route
                path="/change-password"
                element={
                  <PrivateRoute>
                    <ChangePasswordPage />
                  </PrivateRoute>
                }
              />

              {/* Super Admin */}
              <Route
                path="/super-admin"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/schools"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminSchools />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/users"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/settings"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/schools/:id"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminSchoolDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/analytics"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminAnalytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/billing"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminBilling />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/support"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminSupport />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/broadcast"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminBroadcast />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/audit"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminAuditLog />
                  </PrivateRoute>
                }
              />
              <Route
                path="/super-admin/platform"
                element={
                  <PrivateRoute allowedRoles={['super_admin']}>
                    <SuperAdminPlatform />
                  </PrivateRoute>
                }
              />

              {/* School Administration (Unified for Director & Head Teacher) */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <HeadTeacherDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher"
                element={
                  <PrivateRoute allowedRoles={['head_teacher']}>
                    <HeadTeacherDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher/people"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <HeadTeacherPeople />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher/academic"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <HeadTeacherAcademic />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher/timetable"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <HeadTeacherTimetable />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher/attendance"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <HeadTeacherAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher/settings"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <HeadTeacherSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/head-teacher/setup"
                element={
                  <PrivateRoute allowedRoles={['director', 'head_teacher']}>
                    <SchoolSetupWizard />
                  </PrivateRoute>
                }
              />


              {/* Teacher */}
              <Route
                path="/teacher/dashboard"
                element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherClasses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherAssignments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/grades"
                element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherGrades />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/schedule"
                element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherSchedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherAttendance />
                  </PrivateRoute>
                }
              />


              {/* Deputy Head */}
              <Route
                path="/deputy-head"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/deputy-head/staff"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadStaff />
                  </PrivateRoute>
                }
              />
              <Route
                path="/deputy-head/academics"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadAcademics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/deputy-head/discipline"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadDiscipline />
                  </PrivateRoute>
                }
              />
              <Route
                path="/deputy-head/timetable"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadTimetable />
                  </PrivateRoute>
                }
              />
              <Route
                path="/deputy-head/attendance"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadAttendance />
                  </PrivateRoute>
                }
              />

              <Route
                path="/deputy-head/students"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadStudents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/deputy-head/settings"
                element={
                  <PrivateRoute allowedRoles={['deputy_head']}>
                    <DeputyHeadSettings />
                  </PrivateRoute>
                }
              />


              <Route
                path="/student/dashboard"
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/parent/dashboard"
                element={
                  <PrivateRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </PrivateRoute>
                }
              />

              {/* Bursar */}
              <Route
                path="/bursar/dashboard"
                element={
                  <PrivateRoute allowedRoles={['bursar']}>
                    <BursarDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bursar/fees"
                element={
                  <PrivateRoute allowedRoles={['bursar']}>
                    <BursarFees />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bursar/payments"
                element={
                  <PrivateRoute allowedRoles={['bursar']}>
                    <BursarPayments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bursar/students"
                element={
                  <PrivateRoute allowedRoles={['bursar']}>
                    <BursarStudents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bursar/settings"
                element={
                  <PrivateRoute allowedRoles={['bursar']}>
                    <BursarSettings />
                  </PrivateRoute>
                }
              />

              {/* IT Coordinator */}
              <Route
                path="/it-coordinator"
                element={
                  <PrivateRoute allowedRoles={['it_coordinator']}>
                    <ITCoordinatorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/it-coordinator/infrastructure"
                element={
                  <PrivateRoute allowedRoles={['it_coordinator']}>
                    <ITCoordinatorInfrastructure />
                  </PrivateRoute>
                }
              />
              <Route
                path="/it-coordinator/users"
                element={
                  <PrivateRoute allowedRoles={['it_coordinator']}>
                    <ITCoordinatorUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/it-coordinator/settings"
                element={
                  <PrivateRoute allowedRoles={['it_coordinator']}>
                    <ITCoordinatorSettings />
                  </PrivateRoute>
                }
              />

              {/* School Director */}
              <Route
                path="/school-director"
                element={
                  <PrivateRoute allowedRoles={['school_director']}>
                    <SchoolDirectorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/school-director/reports"
                element={
                  <PrivateRoute allowedRoles={['school_director']}>
                    <SchoolDirectorReports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/school-director/settings"
                element={
                  <PrivateRoute allowedRoles={['school_director']}>
                    <SchoolDirectorSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/school-director/setup"
                element={
                  <PrivateRoute allowedRoles={['school_director']}>
                    <SchoolSetupWizard />
                  </PrivateRoute>
                }
              />

              {/* Navigation Fallbacks */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </OnlineContextProvider>
    </ErrorBoundary>
  );
};

export default App;
