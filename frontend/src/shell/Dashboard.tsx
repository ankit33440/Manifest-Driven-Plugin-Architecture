import React, { Suspense } from 'react';
import { useAuth } from '../core/auth/AuthContext';
import { getWidgetsFor } from '../core/plugin-loader';
import { componentRegistry } from '../core/component-registry';
import PageLoader from '../components/PageLoader';

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'bg-red-100 text-red-700',
  PROJECT_DEVELOPER: 'bg-blue-100 text-blue-700',
  VERIFIER: 'bg-purple-100 text-purple-700',
  CERTIFIER: 'bg-amber-100 text-amber-700',
  BUYER: 'bg-green-100 text-green-700',
};

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const widgets = getWidgetsFor(user.role);
  const fullPageWidget = widgets.find((w) => w.fullPage);

  // If a full-page widget is registered for this role, render it exclusively
  if (fullPageWidget) {
    let FullComponent: React.ComponentType<any> | null = null;
    try {
      FullComponent = componentRegistry.get(fullPageWidget.component);
    } catch {
      return (
        <div className="p-6 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl m-6">
          Dashboard widget "{fullPageWidget.component}" not registered
        </div>
      );
    }
    return (
      <Suspense fallback={<PageLoader />}>
        <FullComponent />
      </Suspense>
    );
  }

  const roleLabel = user.role.replace(/_/g, ' ');
  const roleColor = ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name}</h1>
            <p className="text-green-100 text-sm">
              Manage carbon credits and sustainability projects on Nature's Registry
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Widgets grid */}
      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg font-medium">No widgets for your role</p>
          <p className="text-sm mt-1">Dashboard widgets will appear here when available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {widgets.map((widget) => {
            let WidgetComponent: React.ComponentType<any> | null = null;
            try {
              WidgetComponent = componentRegistry.get(widget.component);
            } catch {
              return (
                <div key={widget.component} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
                  Widget "{widget.component}" not registered
                </div>
              );
            }
            return (
              <Suspense key={widget.component} fallback={<PageLoader />}>
                <WidgetComponent />
              </Suspense>
            );
          })}
        </div>
      )}
    </div>
  );
}
