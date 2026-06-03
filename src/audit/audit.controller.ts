import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard)
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.auditService.findAll(tenantId);
  }
}
