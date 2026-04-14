export type CarbonRole =
  | 'SUPERADMIN'
  | 'PROJECT_DEVELOPER'
  | 'VERIFIER'
  | 'CERTIFIER'
  | 'BUYER';

export interface RouteManifest {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
}

export interface NavManifest {
  label: string;
  path: string;
  icon: string;
}

export interface PageManifest {
  path: string;
  component: string;
  title: string;
}

export interface SectionManifest {
  id: string;
  label: string;
}

export interface WidgetManifest {
  component: string;
  order: number;
  fullPage?: boolean;
}

export interface RoleFeatures {
  routes: RouteManifest[];
  nav: NavManifest[];
  pages: PageManifest[];
  sections: Record<string, SectionManifest[]>;
  dashboardWidgets: WidgetManifest[];
}

export interface PluginManifest {
  name: string;
  version: string;
  enabled: boolean;
  module: string;
  plugin?: string;
  roles: Partial<Record<CarbonRole, RoleFeatures>>;
  publicRoutes: RouteManifest[];
  listensTo: string[];
  emits: string[];
}
