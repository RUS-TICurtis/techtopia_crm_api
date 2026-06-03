import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { VendorsService } from '../services/vendors.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async getVendors(@Req() req: any, @Query('search') search?: string) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.vendorsService.findAllVendors(tenantId, search);
  }

  @Get(':id')
  async getVendor(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    return this.vendorsService.findVendorById(+id, tenantId);
  }

  @Post()
  @Roles('finance', 'operations')
  async createVendor(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.vendorsService.createVendor(data, tenantId, actor);
  }

  @Patch(':id')
  @Roles('finance', 'operations')
  async updateVendor(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    return this.vendorsService.updateVendor(+id, data, tenantId, actor);
  }

  @Delete(':id')
  @Roles('finance', 'operations')
  async deleteVendor(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'tenant_techtopia';
    const actor = req.user.email || 'system';
    await this.vendorsService.removeVendor(+id, tenantId, actor);
    return { success: true };
  }
}
