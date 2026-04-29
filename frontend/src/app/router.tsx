import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole } from './guards';
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

export const appRouter = createBrowserRouter([
  { path: '/', element: <Navigate to="/forum" replace /> },
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
    element: <RequireRole roles={['Admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { path: 'users', element: <Placeholder titleKey="placeholders.admin.users" /> },
          { path: 'roles', element: <Placeholder titleKey="placeholders.admin.roles" /> },
          { path: 'permissions', element: <Placeholder titleKey="placeholders.admin.permissions" /> },
        ],
      },
    ],
  },
]);

