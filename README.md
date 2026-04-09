# Nature's Registry

A manifest-driven, dynamic plugin-based architecture for a Carbon Credit Registry Platform, built with NestJS and Vite + React.

## Overview
This greenfield prototype demonstrates an advanced, strict architectural constraint: **Manifest-Driven Development via Plugins**.
1. **Modules specify behavior via `plugin.json`**: Each backend and frontend module has a manifest defining its routes, UI navigation, pages, widgets, allowed roles, and event interactions.
2. **Dynamic loading**: No central router or module file needs altering when adding new modules.
3. **Event-driven interactions**: Strict module boundary enforcement. The `credits` module knows nothing about the `marketplace` module's implementation. They only talk via `EventEmitter2`.
4. **Dynamic RBAC**: All roles and route access are defined in manifests. A single generic `ManifestRbacGuard` intercepts and evaluates rules.

## Getting Started

### Backend
```bash
cd backend
npm install
npm run start:dev
```
Runs the NestJS server on `http://localhost:3000`. Watch the CLI logs; you will see the `PluginLoaderModule` reading `plugin.json` from each module and hooking it into the container dynamically.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs the Vite dev server on `http://localhost:5173`. Uses Vite glob imports to iterate over all `**/plugin.json` files and boot the necessary React components into the `componentRegistry`.

## Built With
- NestJS
- React (Vite)
- Tailwind CSS
- Lucide React
