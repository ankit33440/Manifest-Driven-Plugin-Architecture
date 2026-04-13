import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AccessControlService } from '../../modules/auth/access-control.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessControlService: AccessControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication is required.');
    }

    const access = await this.accessControlService.getUserAccess(user.sub);
    request.user = {
      ...user,
      roles: access.roles,
      permissions: access.permissions,
    };

    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      access.permissions.includes(permission),
    );

    if (!hasRequiredPermissions) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    return true;
  }
}
