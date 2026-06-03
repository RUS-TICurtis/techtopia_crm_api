import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { ReportsService } from '../services/reports.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/settlements')
export class SettlementsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getSettlements(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.reportsService.getSettlements(tenantId);
  }
}
