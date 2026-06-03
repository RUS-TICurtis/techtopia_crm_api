import { Controller, Get, Post, Body, Req, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { AIFinanceService } from '../services/ai-finance.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/ai')
export class AIController {
  constructor(private readonly aiService: AIFinanceService) {}

  @Get('insights')
  async getInsights(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.aiService.getInsights(tenantId);
  }

  @Get('overdue-alerts')
  async getOverdueAlerts(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.aiService.getOverdueAlerts(tenantId);
  }

  @Post('chat')
  async askAgent(@Body('query') query: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.aiService.chat(query, tenantId);
  }

  @Get('executive-summary')
  async getExecutiveSummary(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.aiService.getExecutiveSummary(tenantId);
  }

  @Get('revenue-forecast')
  async getRevenueForecast(@Query('months') months: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const numMonths = parseInt(months) || 3;
    return this.aiService.getForecast(numMonths, tenantId);
  }

  @Get('churn-predictions')
  async getChurnPredictions(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.aiService.getChurn(tenantId);
  }
}
