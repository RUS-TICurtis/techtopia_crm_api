import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { ReportsService } from '../services/reports.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue-summary')
  async getRevenueSummary(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.reportsService.getReport('revenue', tenantId);
  }

  @Get(':type')
  async getReport(
    @Param('type') type: string,
    @Req() req: any,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.reportsService.getReport(type, tenantId, start, end);
  }

  @Get(':type/export')
  async exportReport(
    @Param('type') type: string,
    @Req() req: any,
    @Query('format') format: string,
    @Res() res: any,
  ) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const data = await this.reportsService.getReport(type, tenantId);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      res.send(`Date,Amount,Info\n${new Date().toISOString().slice(0, 10)},0,Mock CSV data`);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
      res.send(Buffer.from('Mock Excel Binary'));
    }
  }
}
