import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { getPagesFor } from '../core/plugin-loader';
import { componentRegistry } from '../core/component-registry';
import Dashboard from './Dashboard';
import PageLoader from '../components/PageLoader';

function DynamicPage({ componentName }: { componentName: string }) {
  let Component: React.ComponentType<any>;
  try {
    Component = componentRegistry.get(componentName);
  } catch {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="text-lg font-medium">Component not found</p>
        <p className="text-sm text-gray-500 mt-1">"{componentName}" was not registered</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export default function AppRouter() {
  const { user } = useAuth();

  if (!user) return null;

  const pages = getPagesFor(user.role);

  return (
    <Routes>
      {/* Core route: dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Plugin-driven routes */}
      {pages.map((page) => (
        <Route
          key={`${page.path}-${page.component}`}
          path={page.path}
          element={<DynamicPage componentName={page.component} />}
        />
      ))}

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-500">The page you're looking for doesn't exist or you don't have access.</p>
          </div>
        }
      />
    </Routes>
  );
}
