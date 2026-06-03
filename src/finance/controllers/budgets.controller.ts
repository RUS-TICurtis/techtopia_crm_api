import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { BudgetsService } from '../services/budgets.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  async getBudgets(@Req() req: any, @Query('period') period?: string) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.budgetsService.findAll(tenantId, period);
  }

  @Get(':id')
  async getBudget(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.budgetsService.findOne(+id, tenantId);
  }

  @Post()
  @Roles('finance', 'operations')
  async createBudget(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.budgetsService.create(data, tenantId, actor);
  }

  @Patch(':id')
  @Roles('finance', 'operations')
  async updateBudget(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.budgetsService.update(+id, data, tenantId, actor);
  }

  @Delete(':id')
  @Roles('finance')
  async deleteBudget(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    await this.budgetsService.remove(+id, tenantId, actor);
    return { success: true };
  }
}
