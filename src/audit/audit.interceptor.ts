import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;

    // Intercept write operations (POST, PATCH, DELETE)
    if (['POST', 'PATCH', 'DELETE'].includes(method)) {
      const actor = user?.email || 'system';
      const tenantId = user?.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      const urlParts = url.split('/');
      // e.g., /api/leads or /api/projects
      const moduleName = urlParts[2] || 'System';
      const actionName = `${method}_${moduleName.toUpperCase()}`;

      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.auditService.log(
              actor,
              moduleName,
              actionName,
              body ? body : null,
              response ? response : null,
              tenantId,
            );
          } catch (err) {
            // Log error silently so we don't disrupt the request flow
            console.error('Audit logging failed:', err);
          }
        }),
      );
    }

    return next.handle();
  }
}
