import { CarbonRole, NavManifest, PageManifest, PluginManifest, SectionManifest, WidgetManifest } from './plugin.types';

// Vite glob imports — must use literal strings
const manifestGlobs = import.meta.glob('../modules/**/plugin.json', { eager: true });
const pluginImporters = import.meta.glob('../modules/**/*.plugin.tsx');

const loadedManifests: PluginManifest[] = [];

export async function autoLoadPlugins(): Promise<void> {
  for (const [manifestKey, mod] of Object.entries(manifestGlobs)) {
    const manifest = (mod as { default: PluginManifest }).default;

    if (!manifest.enabled) {
      console.log(`[Plugin] ${manifest.name} skipped (disabled)`);
      continue;
    }

    // Load the .plugin.tsx file to trigger component registrations
    const dir = manifestKey.replace('/plugin.json', '');
    const pluginKey = Object.keys(pluginImporters).find(
      (k) => k.startsWith(dir) && k.endsWith('.plugin.tsx'),
    );

    if (pluginKey) {
      const pluginModule = await pluginImporters[pluginKey]() as any;
      if (typeof pluginModule.default === 'function') {
        pluginModule.default();
      } else if (typeof pluginModule === 'function') {
        pluginModule();
      }
    }

    loadedManifests.push(manifest);
    console.log(`[Plugin] ${manifest.name} v${manifest.version} loaded`);
  }
}

export function getNavFor(role: CarbonRole): NavManifest[] {
  const items: NavManifest[] = [];
  for (const manifest of loadedManifests) {
    const features = manifest.roles?.[role];
    if (features?.nav) {
      items.push(...features.nav);
    }
  }
  return items;
}

export function getPagesFor(role: CarbonRole): PageManifest[] {
  const items: PageManifest[] = [];
  for (const manifest of loadedManifests) {
    const features = manifest.roles?.[role];
    if (features?.pages) {
      items.push(...features.pages);
    }
  }
  return items;
}

export function getWidgetsFor(role: CarbonRole): WidgetManifest[] {
  const items: WidgetManifest[] = [];
  for (const manifest of loadedManifests) {
    const features = manifest.roles?.[role];
    if (features?.dashboardWidgets) {
      items.push(...features.dashboardWidgets);
    }
  }
  return items.sort((a, b) => a.order - b.order);
}

export function getSectionsFor(pageName: string, role: CarbonRole): SectionManifest[] {
  const items: SectionManifest[] = [];
  for (const manifest of loadedManifests) {
    const features = manifest.roles?.[role];
    const sections = features?.sections?.[pageName];
    if (sections) {
      items.push(...sections);
    }
  }
  return items;
}

export function getAllManifests(): PluginManifest[] {
  return loadedManifests;
}

