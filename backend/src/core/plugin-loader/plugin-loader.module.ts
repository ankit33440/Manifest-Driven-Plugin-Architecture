import { DynamicModule, Module, Type } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PluginManifest } from '../plugin.types';
import { PLUGIN_MANIFESTS } from './plugin.tokens';

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

@Module({})
export class PluginLoaderModule {
  static async forRoot(): Promise<DynamicModule> {
    const modulesDir = path.join(__dirname, '..', '..', 'modules');
    const manifestFiles = findPluginJsonFiles(modulesDir);

    const manifests: PluginManifest[] = [];
    const loadedModules: Type<any>[] = [];

    for (const filePath of manifestFiles) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(raw);

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
      providers: [
        {
          provide: PLUGIN_MANIFESTS,
          useValue: manifests,
        },
      ],
      exports: [PLUGIN_MANIFESTS],
      global: true,
    };
  }
}
