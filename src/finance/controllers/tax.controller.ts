import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { ReportsService } from '../services/reports.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/tax')
export class TaxController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getTaxes(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.reportsService.getTaxes(tenantId);
  }

  @Post()
  @Roles('finance')
  async createTaxRecord(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.reportsService.createTax(data, tenantId);
  }
}
