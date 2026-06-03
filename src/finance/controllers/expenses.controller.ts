import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { ExpensesService } from '../services/expenses.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('categories')
  async getCategories(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.expensesService.getCategories(tenantId);
  }

  @Get()
  async getExpenses(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.expensesService.findAll(tenantId, category, status);
  }

  @Post()
  @Roles('sales', 'support', 'developer', 'hr', 'finance', 'project_manager', 'operations')
  async submitExpense(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.expensesService.submit(data, tenantId, actor);
  }

  @Patch(':id')
  @Roles('finance', 'operations')
  async updateExpense(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.expensesService.update(+id, data, tenantId, actor);
  }

  @Post(':id/approve')
  @Roles('finance')
  async approveExpense(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.expensesService.approve(+id, tenantId, actor);
  }

  @Post(':id/reject')
  @Roles('finance')
  async rejectExpense(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.expensesService.reject(+id, reason, tenantId, actor);
  }

  @Delete(':id')
  @Roles('finance', 'operations')
  async deleteExpense(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    await this.expensesService.remove(+id, tenantId, actor);
    return { success: true };
  }
}
