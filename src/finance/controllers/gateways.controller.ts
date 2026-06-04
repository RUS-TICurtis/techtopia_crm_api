import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { PaymentsService } from '../services/payments.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/gateways')
export class GatewaysController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('hubtel/initiate')
  async initHubtelPayment(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.paymentsService.initiateHubtel(data, tenantId);
  }

  @Get('hubtel/verify/:reference')
  async verifyHubtelPayment(@Param('reference') reference: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.paymentsService.verifyHubtel(reference, tenantId);
  }

  @Post('paystack/initiate')
  async initPaystackPayment(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.paymentsService.initiatePaystack(data, tenantId);
  }

  @Get('paystack/verify/:reference')
  async verifyPaystackPayment(@Param('reference') reference: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.paymentsService.verifyPaystack(reference, tenantId);
  }
}
