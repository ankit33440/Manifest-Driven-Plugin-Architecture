import { DynamicModule, Module, Type } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { PluginManifest } from '../plugin.types';
import { PLUGIN_MANIFESTS } from './plugin.tokens';

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const CarbonRoleSchema = z.enum([
  'SUPERADMIN',
  'PROJECT_DEVELOPER',
  'VERIFIER',
  'CERTIFIER',
  'BUYER',
]);

const RouteManifestSchema = z.object({
  path: z.string().startsWith('/'),
  method: z.enum(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']),
});

const NavManifestSchema = z.object({
  label: z.string().min(1),
  path: z.string().startsWith('/'),
  icon: z.string().min(1),
});

const PageManifestSchema = z.object({
  path: z.string().startsWith('/'),
  component: z.string().min(1),
  title: z.string().min(1),
});

const SectionManifestSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const WidgetManifestSchema = z.object({
  component: z.string().min(1),
  order: z.number().int().nonnegative(),
});

const RoleFeaturesSchema = z.object({
  routes: z.array(RouteManifestSchema).default([]),
  nav: z.array(NavManifestSchema).default([]),
  pages: z.array(PageManifestSchema).default([]),
  sections: z.record(z.string(), z.array(SectionManifestSchema)).default({}),
  dashboardWidgets: z.array(WidgetManifestSchema).default([]),
});

const PluginManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver e.g. 1.0.0'),
  enabled: z.boolean(),
  module: z.string().startsWith('./'),
  plugin: z.string().startsWith('./').optional(),
  roles: z.record(z.string(), RoleFeaturesSchema).default({}),
  publicRoutes: z.array(RouteManifestSchema).default([]),
  listensTo: z.array(z.string()).default([]),
  emits: z.array(z.string()).default([]),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findPluginJsonFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPluginJsonFiles(fullPath));
    } else if (entry.name === 'plugin.json') {
      results.push(fullPath);
    }
  }
  return results;
}

function validateManifest(raw: unknown, filePath: string): PluginManifest {
  const result = PluginManifestSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  • [${e.path.join('.')}] ${e.message}`)
      .join('\n');
    throw new Error(
      `[PluginLoader] Invalid plugin.json at ${filePath}:\n${errors}`,
    );
  }
  return result.data as PluginManifest;
}

// ─── Module ──────────────────────────────────────────────────────────────────

@Module({})
export class PluginLoaderModule {
  static async forRoot(): Promise<DynamicModule> {
    const modulesDir = path.join(__dirname, '..', '..', 'modules');
    const manifestFiles = findPluginJsonFiles(modulesDir);

    const manifests: PluginManifest[] = [];
    const loadedModules: Type<any>[] = [];

    for (const filePath of manifestFiles) {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // ── Zod validation: throws with a clear message if schema is violated
      const manifest = validateManifest(raw, filePath);

      if (!manifest.enabled) {
        console.log(`[PluginLoader] Skipped (disabled): ${manifest.name}`);
        continue;
      }

      const moduleDir = path.dirname(filePath);
      const modulePath = path.resolve(moduleDir, manifest.module);

      const imported = require(modulePath);
      const ModuleClass = Object.values(imported)[0] as Type<any>;

      loadedModules.push(ModuleClass);
      manifests.push(manifest);

      console.log(`[PluginLoader] Loaded: ${manifest.name} v${manifest.version}`);
    }

    return {
      module: PluginLoaderModule,
      imports: loadedModules,
      providers: [{ provide: PLUGIN_MANIFESTS, useValue: manifests }],
      exports: [PLUGIN_MANIFESTS],
      global: true,
    };
  }
}

