import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { RolesPage } from './features/roles/pages/RolesPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { ProjectWizardPage } from './features/projects/pages/ProjectWizardPage';
import { ProjectDetailPage } from './features/projects/pages/ProjectDetailPage';
import { PlaceholderPage } from './features/shared/pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/roles" element={<RolesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<ProjectWizardPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="verifications" element={<PlaceholderPage title="Verifications" />} />
          <Route path="certifications" element={<PlaceholderPage title="Certifications" />} />
          <Route path="marketplace" element={<PlaceholderPage title="Marketplace" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
