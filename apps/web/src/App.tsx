import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PrivateRoute, PublicRoute } from './components/RouteGuards';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { LandingPage } from './pages/LandingPage';
import { HeadTeacherDashboard } from './pages/HeadTeacherDashboard';
import { HeadTeacherPeople } from './pages/HeadTeacherPeople';
import { HeadTeacherAcademic } from './pages/HeadTeacherAcademic';
import { HeadTeacherAttendance } from './pages/HeadTeacherAttendance';
import { HeadTeacherFinance } from './pages/HeadTeacherFinance';
import { HeadTeacherCommunication } from './pages/HeadTeacherCommunication';
import { HeadTeacherSettings } from './pages/HeadTeacherSettings';
import { HeadTeacherNewAnnouncement } from './pages/HeadTeacherNewAnnouncement';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherClasses } from './pages/TeacherClasses'; // Teacher subpage
import { TeacherAssignments } from './pages/TeacherAssignments'; // Teacher subpage
import { TeacherGrades } from './pages/TeacherGrades'; // Teacher subpage
import { TeacherSchedule } from './pages/TeacherSchedule'; // Teacher subpage
import { TeacherAttendance } from './pages/TeacherAttendance'; // Teacher subpage
import { TeacherParentCommunications } from './pages/TeacherParentCommunications'; // Teacher subpage
import { TeacherMessages } from './pages/TeacherMessages'; // Teacher subpage
import { TeacherAnnouncements } from './pages/TeacherAnnouncements'; // Teacher subpage
import { DeputyHeadStaff } from './pages/DeputyHeadStaff';
import { DeputyHeadAcademics } from './pages/DeputyHeadAcademics';
import { DeputyHeadDiscipline } from './pages/DeputyHeadDiscipline';
import { DeputyHeadTimetable } from './pages/DeputyHeadTimetable';
import { DeputyHeadAttendance } from './pages/DeputyHeadAttendance';
import { DeputyHeadFinancials } from './pages/DeputyHeadFinancials';
import { DeputyHeadStudents } from './pages/DeputyHeadStudents';
import { DeputyHeadSettings } from './pages/DeputyHeadSettings';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { DeputyHeadDashboard } from './pages/DeputyHeadDashboard';
import { BursarDashboard } from './pages/BursarDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SuperAdminSchools } from './pages/SuperAdminSchools';
import { SuperAdminUsers } from './pages/SuperAdminUsers';
import { SuperAdminSettings } from './pages/SuperAdminSettings';

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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
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

            {/* Role-Scoped Dashboard Stubs */}
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
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['head_teacher']}>
                  <HeadTeacherDashboard />
                </PrivateRoute>
              }
            />
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
            <Route
              path="/teacher/parents"
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherParentCommunications />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/messages"
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherMessages />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/announcements"
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherAnnouncements />
                </PrivateRoute>
              }
            />
            <Route
              path="/bursar/dashboard"
              element={
                <PrivateRoute allowedRoles={['bursar']}>
                  <BursarDashboard />
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
              path="/deputy-head/financials"
              element={
                <PrivateRoute allowedRoles={['deputy_head']}>
                  <DeputyHeadFinancials />
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
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherPeople />
                 </PrivateRoute>
               }
             />
             <Route
               path="/head-teacher/academic"
               element={
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherAcademic />
                 </PrivateRoute>
               }
             />
             <Route
               path="/head-teacher/attendance"
               element={
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherAttendance />
                 </PrivateRoute>
               }
             />
             <Route
               path="/head-teacher/finance"
               element={
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherFinance />
                 </PrivateRoute>
               }
             />
             <Route
               path="/head-teacher/communication"
               element={
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherCommunication />
                 </PrivateRoute>
               }
             />
             <Route
               path="/head-teacher/settings"
               element={
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherSettings />
                 </PrivateRoute>
               }
             />
             <Route
               path="/head-teacher/announcements/new"
               element={
                 <PrivateRoute allowedRoles={['head_teacher']}>
                   <HeadTeacherNewAnnouncement />
                 </PrivateRoute>
               }
             />
              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
