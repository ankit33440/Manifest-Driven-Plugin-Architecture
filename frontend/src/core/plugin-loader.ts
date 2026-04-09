import { CarbonRole, NavManifest, PageManifest, PluginManifest, SectionManifest, WidgetManifest } from './plugin.types';

// Vite glob imports — must use literal strings
const manifestGlobs = import.meta.glob('../modules/**/plugin.json', { eager: true });
const pluginImporters = import.meta.glob('../modules/**/*.plugin.tsx');

interface PluginRegistry {
  manifests: PluginManifest[];
  nav: NavManifest[];
  pages: PageManifest[];
  widgets: WidgetManifest[];
  sections: Record<string, SectionManifest[]>;
}

const registry: PluginRegistry = {
  manifests: [],
  nav: [],
  pages: [],
  widgets: [],
  sections: {},
};

export async function autoLoadPlugins(): Promise<void> {
  for (const [manifestKey, mod] of Object.entries(manifestGlobs)) {
    const manifest = (mod as { default: PluginManifest }).default;

    if (!manifest.enabled) {
      console.log(`[Plugin] ${manifest.name} skipped (disabled)`);
      continue;
    }

    // Load the .plugin.tsx file to trigger component registrations
    // manifestKey example: '../modules/auth/plugin.json'
    // pluginKey example:   '../modules/auth/auth.plugin.tsx'
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

    // Register manifest data into the runtime registry
    registry.manifests.push(manifest);
    registry.nav.push(...manifest.nav);
    registry.pages.push(...manifest.pages);
    registry.widgets.push(...manifest.dashboardWidgets);

    for (const [pageName, sections] of Object.entries(manifest.sections)) {
      if (!registry.sections[pageName]) {
        registry.sections[pageName] = [];
      }
      registry.sections[pageName].push(...sections);
    }

    console.log(`[Plugin] ${manifest.name} v${manifest.version} loaded`);
  }
}

export function getNavFor(role: CarbonRole): NavManifest[] {
  return registry.nav.filter((item) => item.roles.includes(role));
}

export function getPagesFor(role: CarbonRole): PageManifest[] {
  return registry.pages.filter((page) => page.roles.includes(role));
}

export function getWidgetsFor(role: CarbonRole): WidgetManifest[] {
  return registry.widgets
    .filter((w) => w.roles.includes(role))
    .sort((a, b) => a.order - b.order);
}

export function getSectionsFor(pageName: string, role: CarbonRole): SectionManifest[] {
  const sections = registry.sections[pageName] || [];
  return sections.filter((s) => s.roles.includes(role));
}

export function getAllManifests(): PluginManifest[] {
  return registry.manifests;
}
