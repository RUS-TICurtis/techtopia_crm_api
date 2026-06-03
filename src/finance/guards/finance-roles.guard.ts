import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FinanceRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    // Admins always have full access
    if (['super_admin', 'platform_owner', 'tenant_admin'].includes(user.role)) {
      return true;
    }

    if (!requiredRoles) {
      // By default, finance, operations, or admins can access finance endpoints
      return ['finance', 'operations'].includes(user.role);
    }

    return requiredRoles.includes(user.role);
  }
}
