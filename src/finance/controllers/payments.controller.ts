import { Controller, Get, Post, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { PaymentsService } from '../services/payments.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getPayments(
    @Req() req: any,
    @Query('gateway') gateway?: string,
    @Query('status') status?: string,
  ) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.paymentsService.findAll(tenantId, gateway, status);
  }

  @Post('manual')
  @Roles('finance', 'operations')
  async createManualPayment(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.paymentsService.createManual(data, tenantId, actor);
  }

  @Post(':id/refund')
  @Roles('finance')
  async refundPayment(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.paymentsService.refund(+id, data, tenantId, actor);
  }

  @Post(':id/reconcile')
  @Roles('finance')
  async reconcilePayment(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.paymentsService.reconcile(+id, tenantId, actor);
  }
}
