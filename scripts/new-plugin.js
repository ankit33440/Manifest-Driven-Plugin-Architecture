#!/usr/bin/env node
/**
 * Plugin Scaffolder CLI
 * Usage: node scripts/new-plugin.js <module-name> [--roles SUPERADMIN,BUYER]
 *
 * Example:
 *   node scripts/new-plugin.js reporting
 *   node scripts/new-plugin.js notifications --roles SUPERADMIN,VERIFIER
 */

const fs = require('fs');
const path = require('path');

// ─── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (!args.length || args[0].startsWith('--')) {
  console.error('❌  Usage: node scripts/new-plugin.js <module-name> [--roles ROLE1,ROLE2]');
  process.exit(1);
}

const moduleName = args[0].toLowerCase().replace(/[^a-z0-9_-]/g, '-');
const pascalName = moduleName
  .split(/[-_]/)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join('');

const rolesIdx = args.indexOf('--roles');
const roles = rolesIdx !== -1 && args[rolesIdx + 1]
  ? args[rolesIdx + 1].split(',').map((r) => r.trim().toUpperCase())
  : ['SUPERADMIN'];

const VALID_ROLES = ['SUPERADMIN', 'PROJECT_DEVELOPER', 'VERIFIER', 'CERTIFIER', 'BUYER'];
const invalidRoles = roles.filter((r) => !VALID_ROLES.includes(r));
if (invalidRoles.length) {
  console.error(`❌  Invalid roles: ${invalidRoles.join(', ')}`);
  console.error(`   Valid roles: ${VALID_ROLES.join(', ')}`);
  process.exit(1);
}

const rolesJson = JSON.stringify(roles, null, 8).replace(/\n/g, '\n    ');
const ROOT = path.join(__dirname, '..');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mkdirs(...segments) {
  const dir = path.join(ROOT, ...segments);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function write(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.warn(`⚠️   Skipped (already exists): ${path.relative(ROOT, filePath)}`);
    return;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅  Created: ${path.relative(ROOT, filePath)}`);
}

// ─── Templates ───────────────────────────────────────────────────────────────

const backendPluginJson = `{
  "name": "${moduleName}",
  "version": "1.0.0",
  "enabled": true,
  "module": "./${moduleName}.module",
  "plugin": "./${moduleName}.plugin",
  "allowedRoles": ${rolesJson},
  "routes": [
    { "path": "/${moduleName}", "method": "GET", "roles": ${rolesJson} }
  ],
  "nav": [],
  "pages": [],
  "sections": {},
  "dashboardWidgets": [],
  "listensTo": [],
  "emits": []
}
`;

const backendModule = `import { Module } from '@nestjs/common';
import { ${pascalName}Controller } from './${moduleName}.controller';
import { ${pascalName}Service } from './${moduleName}.service';

@Module({
  controllers: [${pascalName}Controller],
  providers: [${pascalName}Service],
})
export class ${pascalName}Module {}
`;

const backendController = `import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ${pascalName}Service } from './${moduleName}.service';

@Controller('${moduleName}')
export class ${pascalName}Controller {
  constructor(private readonly ${moduleName}Service: ${pascalName}Service) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.${moduleName}Service.findAll(user);
  }
}
`;

const backendService = `import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ${pascalName}Service {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  findAll(user?: any) {
    // TODO: Replace with real data logic
    return { module: '${moduleName}', data: [] };
  }
}
`;

const frontendPluginJson = `{
  "name": "${moduleName}",
  "version": "1.0.0",
  "enabled": true,
  "module": "./${moduleName}.module",
  "plugin": "./${moduleName}.plugin",
  "allowedRoles": ${rolesJson},
  "routes": [
    { "path": "/${moduleName}", "method": "GET", "roles": ${rolesJson} }
  ],
  "nav": [
    { "label": "${pascalName}", "path": "/${moduleName}", "icon": "LayoutGrid", "roles": ${rolesJson} }
  ],
  "pages": [
    { "path": "/${moduleName}", "component": "${pascalName}ListPage", "roles": ${rolesJson}, "title": "${pascalName}" }
  ],
  "sections": {},
  "dashboardWidgets": [],
  "listensTo": [],
  "emits": []
}
`;

const frontendListPage = `import React, { useEffect, useState } from 'react';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import PageLoader from '../../../components/PageLoader';

export default function ${pascalName}ListPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/${moduleName}')
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader title="${pascalName}" subtitle="Module overview" />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
`;

const frontendPlugin = `import ${pascalName}ListPage from './pages/${pascalName}ListPage';
import { componentRegistry } from '../../core/component-registry';

export default function register() {
  componentRegistry.register('${pascalName}ListPage', ${pascalName}ListPage);
}
`;

// ─── Generate Files ───────────────────────────────────────────────────────────

console.log(`\n🚀  Scaffolding plugin: "${moduleName}" (${pascalName})\n`);

// Backend
mkdirs('backend', 'src', 'modules', moduleName);
write(path.join(ROOT, 'backend', 'src', 'modules', moduleName, 'plugin.json'), backendPluginJson);
write(path.join(ROOT, 'backend', 'src', 'modules', moduleName, `${moduleName}.module.ts`), backendModule);
write(path.join(ROOT, 'backend', 'src', 'modules', moduleName, `${moduleName}.controller.ts`), backendController);
write(path.join(ROOT, 'backend', 'src', 'modules', moduleName, `${moduleName}.service.ts`), backendService);

// Frontend
mkdirs('frontend', 'src', 'modules', moduleName, 'pages');
mkdirs('frontend', 'src', 'modules', moduleName, 'components');
write(path.join(ROOT, 'frontend', 'src', 'modules', moduleName, 'plugin.json'), frontendPluginJson);
write(path.join(ROOT, 'frontend', 'src', 'modules', moduleName, `${moduleName}.plugin.tsx`), frontendPlugin);
write(path.join(ROOT, 'frontend', 'src', 'modules', moduleName, 'pages', `${pascalName}ListPage.tsx`), frontendListPage);

console.log(`
────────────────────────────────────────────────────
✨  DONE! Your plugin "${moduleName}" is ready.

Next steps:
  1. Edit backend/src/modules/${moduleName}/${moduleName}.service.ts  → add real data logic
  2. Edit frontend/src/modules/${moduleName}/pages/${pascalName}ListPage.tsx → build your UI
  3. Update plugin.json nav/pages/routes as needed
  4. Restart backend:  cd backend && npm run start:dev
  5. Frontend HMR picks up new plugin.json automatically
────────────────────────────────────────────────────
`);
