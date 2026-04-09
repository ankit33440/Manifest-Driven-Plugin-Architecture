export type CarbonRole =
  | 'SUPERADMIN'
  | 'PROJECT_DEVELOPER'
  | 'VERIFIER'
  | 'CERTIFIER'
  | 'BUYER';

export interface RouteManifest {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  roles: CarbonRole[];
}

export interface NavManifest {
  label: string;
  path: string;
  icon: string;
  roles: CarbonRole[];
}

export interface PageManifest {
  path: string;
  component: string;
  roles: CarbonRole[];
  title: string;
}

export interface SectionManifest {
  id: string;
  label: string;
  roles: CarbonRole[];
}

export interface WidgetManifest {
  component: string;
  roles: CarbonRole[];
  order: number;
}

export interface PluginManifest {
  name: string;
  version: string;
  enabled: boolean;
  module: string;
  plugin?: string;
  allowedRoles: CarbonRole[];
  routes: RouteManifest[];
  nav: NavManifest[];
  pages: PageManifest[];
  sections: Record<string, SectionManifest[]>;
  dashboardWidgets: WidgetManifest[];
  listensTo: string[];
  emits: string[];
}
