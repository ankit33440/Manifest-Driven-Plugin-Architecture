import React from 'react';

type ComponentType = React.ComponentType<any>;

class ComponentRegistry {
  private readonly registry = new Map<string, ComponentType>();

  register(name: string, component: ComponentType): void {
    if (this.registry.has(name)) {
      console.warn(`[ComponentRegistry] Overwriting component: ${name}`);
    }
    this.registry.set(name, component);
  }

  get(name: string): ComponentType {
    const component = this.registry.get(name);
    if (!component) {
      throw new Error(`[ComponentRegistry] Component not found: "${name}". Was it registered in a .plugin.tsx file?`);
    }
    return component;
  }

  has(name: string): boolean {
    return this.registry.has(name);
  }
}

export const componentRegistry = new ComponentRegistry();
