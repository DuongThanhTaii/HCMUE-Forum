import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole } from './guards';
import { AdminGuard } from './guards/AdminGuard';
import { AuthLayout } from '@shared/components/layouts/AuthLayout';
import { MainLayout } from '@shared/components/layouts/MainLayout';
import { ModLayout } from '@shared/components/layouts/ModLayout';
import { AdminLayout } from '@shared/components/layouts/AdminLayout';
import { ForumListPage } from '@features/forum/components/ForumListPage';
import { ForumDetailPage } from '@features/forum/components/ForumDetailPage';
import { Placeholder } from './components/Placeholder';
import { LearningDocumentsPage } from '@features/learning/components/LearningDocumentsPage';
import { CareerJobsPage } from '@features/career/components/CareerJobsPage';
import { LoginPage } from '@features/auth/components/LoginPage';
import { RegisterPage } from '@features/auth/components/RegisterPage';
import { AdminRolesPage } from '@features/admin/components/AdminRolesPage';
import { AdminUsersPage } from '@features/admin/components/AdminUsersPage';
import { AdminOverridesPage } from '@features/admin/components/AdminOverridesPage';
import { AdminTogglesPage } from '@features/admin/components/AdminTogglesPage';
import { AdminActionLogsPage } from '@features/admin/components/AdminActionLogsPage';
import { AdminAuditLogsPage } from '@features/admin/components/AdminAuditLogsPage';

export const appRoutes = [
  { path: '/', element: <Navigate to="/forum" replace /> },
  { path: '/home', element: <Navigate to="/forum" replace /> },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: 'forum', element: <ForumListPage /> },
          { path: 'forum/:id', element: <ForumDetailPage /> },
          { path: 'learning/documents', element: <LearningDocumentsPage /> },
          { path: 'career/jobs', element: <CareerJobsPage /> },
          { path: 'chat', element: <Placeholder titleKey="placeholders.main.chat" /> },
          { path: 'chat/ai', element: <Placeholder titleKey="placeholders.main.aiAssistant" /> },
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

