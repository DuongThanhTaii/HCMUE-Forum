import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole } from './guards';
import { AdminGuard } from './guards/AdminGuard';
import { AuthLayout } from '@shared/components/layouts/AuthLayout';
import { MainLayout } from '@shared/components/layouts/MainLayout';
import { ModLayout } from '@shared/components/layouts/ModLayout';
import { AdminLayout } from '@shared/components/layouts/AdminLayout';
import { ForumListPage } from '@features/forum/components/ForumListPage';
import { ForumDetailPage } from '@features/forum/components/ForumDetailPage';
import { HomePage } from '@features/forum/components/HomePage';
import { Placeholder } from './components/Placeholder';
import { LearningDocumentsPage } from '@features/learning/components/LearningDocumentsPage';
import { LearningDocumentDetailPage } from '@features/learning/components/LearningDocumentDetailPage';
import { LearningFacultiesPage } from '@features/learning/components/LearningFacultiesPage';
import { LearningCoursesPage } from '@features/learning/components/LearningCoursesPage';
import { CareerJobsPage } from '@features/career/components/CareerJobsPage';
import { LoginPage } from '@features/auth/components/LoginPage';
import { RegisterPage } from '@features/auth/components/RegisterPage';
import { AdminRolesPage } from '@features/admin/roles/components/AdminRolesPage';
import { AdminUsersPage } from '@features/admin/users/components/AdminUsersPage';
import { AdminOverridesPage } from '@features/admin/overrides/components/AdminOverridesPage';
import { AdminTogglesPage } from '@features/admin/observability/components/AdminTogglesPage';
import { AdminActionLogsPage } from '@features/admin/observability/components/AdminActionLogsPage';
import { AdminAuditLogsPage } from '@features/admin/observability/components/AdminAuditLogsPage';

/**
 * Single root `path: '/'` tree so `/home`, `/login`, and `navigate('/home')` resolve reliably.
 * Multiple sibling `{ path: '/' }` route objects confused matching for nested paths in RR 6/7.
 */
export const appRoutes = [
  {
    path: '/',
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      {
        path: 'login',
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
      },
      {
        path: 'register',
        element: <AuthLayout />,
        children: [{ index: true, element: <RegisterPage /> }],
      },
      {
        element: <MainLayout />,
        children: [
          {
            path: 'learning/documents/:id',
            element: <LearningDocumentDetailPage />,
          },
          { path: 'learning/documents', element: <LearningDocumentsPage /> },
          { path: 'learning/faculties', element: <LearningFacultiesPage /> },
          { path: 'learning/courses', element: <LearningCoursesPage /> },
          { path: 'home', element: <HomePage /> },
          {
            element: <RequireAuth />,
            children: [
              { path: 'forum', element: <ForumListPage /> },
              { path: 'forum/:id', element: <ForumDetailPage /> },
              { path: 'career/jobs', element: <CareerJobsPage /> },
              { path: 'chat', element: <Placeholder titleKey="placeholders.main.chat" /> },
              { path: 'chat/ai', element: <Placeholder titleKey="placeholders.main.aiAssistant" /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/mod',
    element: <RequireRole roles={['Moderator', 'Admin']} />,
    children: [
      {
        path: '/mod',
        element: <ModLayout />,
        children: [
          { path: 'reports', element: <Placeholder titleKey="placeholders.mod.reports" /> },
          { path: 'posts', element: <Placeholder titleKey="placeholders.mod.posts" /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/users" replace /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'roles', element: <AdminRolesPage /> },
          { path: 'permissions', element: <Placeholder titleKey="placeholders.admin.permissions" /> },
          { path: 'overrides/users', element: <AdminOverridesPage /> },
          { path: 'overrides/groups', element: <AdminOverridesPage /> },
          { path: 'toggles', element: <AdminTogglesPage /> },
          { path: 'logs/actions', element: <AdminActionLogsPage /> },
          { path: 'logs/audit', element: <AdminAuditLogsPage /> },
        ],
      },
    ],
  },
];

export const appRouter = createBrowserRouter(appRoutes);
