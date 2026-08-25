import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { AcceptInvitePage } from './pages/public/AcceptInvitePage';

// User Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { VaultPage } from './pages/user/VaultPage';
import { FoldersPage } from './pages/user/FoldersPage';
import { NomineesPage } from './pages/user/NomineesPage';
import { PoliciesPage } from './pages/user/PoliciesPage';
import { EmergencyPage } from './pages/user/EmergencyPage';
import { ReadinessPage } from './pages/user/ReadinessPage';
import { RiskPage } from './pages/user/RiskPage';
import { ActivityLogsPage } from './pages/user/ActivityLogsPage';
import { ReportsPage } from './pages/user/ReportsPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Nominee Pages
import { NomineeDashboardPage } from './pages/nominee/NomineeDashboardPage';
import { NomineeDocumentsPage } from './pages/nominee/NomineeDocumentsPage';
import { SubmitEmergencyPage } from './pages/nominee/SubmitEmergencyPage';
import { NomineeHistoryPage } from './pages/nominee/NomineeHistoryPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminEmergencyPage } from './pages/admin/AdminEmergencyPage';
import { SystemLogsPage } from './pages/admin/SystemLogsPage';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Layout Pages */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/invite/:token" element={<AcceptInvitePage />} />
            </Route>

            {/* User Vault Portal (ROLE_USER, ROLE_ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vault" element={<VaultPage />} />
                <Route path="/folders" element={<FoldersPage />} />
                <Route path="/nominees" element={<NomineesPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/emergency-requests" element={<EmergencyPage />} />
                <Route path="/readiness" element={<ReadinessPage />} />
                <Route path="/risk" element={<RiskPage />} />
                <Route path="/activity-logs" element={<ActivityLogsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Nominee Portal (ROLE_NOMINEE) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_NOMINEE']} />}>
              <Route element={<MainLayout />}>
                <Route path="/nominee/dashboard" element={<NomineeDashboardPage />} />
                <Route path="/nominee/documents" element={<NomineeDocumentsPage />} />
                <Route path="/nominee/submit" element={<SubmitEmergencyPage />} />
                <Route path="/nominee/history" element={<NomineeHistoryPage />} />
              </Route>
            </Route>

            {/* Admin Console (ROLE_ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/emergency" element={<AdminEmergencyPage />} />
                <Route path="/admin/logs" element={<SystemLogsPage />} />
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
