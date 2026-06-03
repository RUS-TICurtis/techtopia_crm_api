import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { SupportService } from './support.service';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  async getTickets(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.supportService.findAll(tenantId);
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.supportService.findOne(+id, tenantId);
  }

  @Post('tickets')
  async createTicket(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.supportService.create(data, tenantId, actor);
  }

  @Patch('tickets/:id')
  async updateTicket(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.supportService.update(+id, data, tenantId, actor);
  }

  @Delete('tickets/:id')
  async deleteTicket(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    await this.supportService.remove(+id, tenantId, actor);
    return { success: true };
  }
}
