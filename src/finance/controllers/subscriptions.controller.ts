import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { SubscriptionsService } from '../services/subscriptions.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans(@Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.subscriptionsService.getPlans(tenantId);
  }

  @Get()
  async getSubscriptions(@Req() req: any, @Query('status') status?: string) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.subscriptionsService.findAll(tenantId, status);
  }

  @Post()
  @Roles('finance', 'operations')
  async createSubscription(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.subscriptionsService.create(data, tenantId, actor);
  }

  @Patch(':id')
  @Roles('finance', 'operations')
  async updateSubscription(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.subscriptionsService.update(+id, data, tenantId, actor);
  }

  @Post(':id/cancel')
  @Roles('finance')
  async cancelSubscription(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.subscriptionsService.cancel(+id, tenantId, actor);
  }

  @Post(':id/suspend')
  @Roles('finance')
  async suspendSubscription(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.subscriptionsService.suspend(+id, tenantId, actor);
  }

  @Post(':id/resume')
  @Roles('finance')
  async resumeSubscription(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.subscriptionsService.resume(+id, tenantId, actor);
  }

  @Post(':id/upgrade')
  @Roles('finance', 'operations')
  async upgradeSubscription(@Param('id') id: string, @Body('planId') planId: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.subscriptionsService.upgrade(+id, planId, tenantId, actor);
  }
}
