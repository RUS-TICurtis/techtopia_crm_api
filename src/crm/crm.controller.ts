import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CrmService } from './crm.service';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // Leads
  @Get('leads')
  async getLeads(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.crmService.getLeads(tenantId);
  }

  @Post('leads')
  async createLead(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.createLead(data, tenantId, actor);
  }

  @Patch('leads/:id')
  async updateLead(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.updateLead(+id, data, tenantId, actor);
  }

  @Post('leads/:id/convert')
  async convertLead(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.convertLead(+id, tenantId, actor);
  }

  // Contacts
  @Get('contacts')
  async getContacts(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.crmService.getContacts(tenantId);
  }

  @Post('contacts')
  async createContact(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.createContact(data, tenantId, actor);
  }

  // Companies
  @Get('companies')
  async getCompanies(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.crmService.getCompanies(tenantId);
  }

  @Post('companies')
  async createCompany(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.createCompany(data, tenantId, actor);
  }

  // Opportunities
  @Get('opportunities')
  async getOpportunities(@Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.crmService.getOpportunities(tenantId);
  }

  @Post('opportunities')
  async createOpportunity(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.createOpportunity(data, tenantId, actor);
  }

  @Patch('opportunities/:id')
  async updateOpportunity(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.crmService.updateOpportunity(+id, data, tenantId, actor);
  }
}
