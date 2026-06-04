import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { VendorsService } from '../services/vendors.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/procurement')
export class ProcurementController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async getPurchaseOrders(@Req() req: any, @Query('status') status?: string) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.vendorsService.findAllPOs(tenantId, status);
  }

  @Post()
  @Roles('finance', 'operations')
  async createPurchaseOrder(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.vendorsService.createPO(data, tenantId, actor);
  }

  @Patch(':id')
  @Roles('finance', 'operations')
  async updatePurchaseOrder(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.vendorsService.updatePO(+id, data, tenantId, actor);
  }

  @Post(':id/approve')
  @Roles('finance')
  async approvePurchaseOrder(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.vendorsService.approvePO(+id, tenantId, actor);
  }

  @Post(':id/reject')
  @Roles('finance')
  async rejectPurchaseOrder(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.vendorsService.rejectPO(+id, tenantId, actor);
  }
}
