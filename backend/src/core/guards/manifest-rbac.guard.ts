import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PluginManifest } from '../plugin.types';
import { PLUGIN_MANIFESTS } from '../plugin-loader/plugin.tokens';

const JWT_SECRET = process.env.JWT_SECRET || 'natures-registry-secret';

function matchesPath(pattern: string, actual: string): boolean {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:[^/]+/g, '[^/]+');
  const regex = new RegExp(`^${escaped}$`);
  return regex.test(actual);
}

@Injectable()
export class ManifestRbacGuard implements CanActivate {
  constructor(
    @Inject(PLUGIN_MANIFESTS) private readonly manifests: PluginManifest[],
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestPath = request.path;
    const requestMethod = request.method.toUpperCase();

    // Find matching route across all manifests
    let matchedRoles: string[] | null = null;

    for (const manifest of this.manifests) {
      for (const route of manifest.routes) {
        if (
          route.method.toUpperCase() === requestMethod &&
          matchesPath(route.path, requestPath)
        ) {
          matchedRoles = route.roles;
          break;
        }
      }
      if (matchedRoles !== null) break;
    }

    // Route not declared in any manifest — pass through (unprotected)
    if (matchedRoles === null) {
      return true;
    }

    // Public route — no roles required
    if (matchedRoles.length === 0) {
      return true;
    }

    // Protected route — validate JWT
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    let payload: any;

    try {
      payload = this.jwtService.verify(token, { secret: JWT_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request
    (request as any).user = payload;

    // Check role
    if (!matchedRoles.includes(payload.role)) {
      throw new ForbiddenException(
        `Role '${payload.role}' is not permitted for ${requestMethod} ${requestPath}`,
      );
    }

    return true;
  }
}
