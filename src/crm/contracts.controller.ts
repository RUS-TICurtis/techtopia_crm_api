import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CrmService } from './crm.service';

@UseGuards(JwtAuthGuard)
@Controller('finance/contracts')
export class ContractsController {
  constructor(private readonly crmService: CrmService) {}

  @Get()
  async getContracts(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.crmService.getContracts(tenantId);
  }

  @Post()
  async createContract(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.createContract(data, tenantId, actor);
  }

  @Patch(':id')
  async updateContract(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.updateContract(+id, data, tenantId, actor);
  }

  @Delete(':id')
  async deleteContract(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    await this.crmService.deleteContract(+id, tenantId, actor);
    return { success: true };
  }
}
