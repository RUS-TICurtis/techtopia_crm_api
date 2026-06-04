import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard';
import { FinanceRolesGuard } from '../guards/finance-roles.guard';
import { Roles } from '../guards/roles.decorator';
import { InvoicesService } from '../services/invoices.service';

@UseGuards(JwtAuthGuard, FinanceRolesGuard)
@Controller('finance/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(@Req() req: any, @Query('status') status?: string) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.invoicesService.findAll(tenantId, status);
  }

  @Get(':id')
  async getInvoice(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    return this.invoicesService.findOne(+id, tenantId);
  }

  @Post()
  @Roles('finance', 'sales', 'operations')
  async createInvoice(@Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.invoicesService.create(data, tenantId, actor);
  }

  @Patch(':id')
  @Roles('finance', 'operations')
  async updateInvoice(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.invoicesService.update(+id, data, tenantId, actor);
  }

  @Delete(':id')
  @Roles('finance', 'operations')
  async deleteInvoice(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.invoicesService.remove(+id, tenantId, actor);
  }

  @Post(':id/send')
  @Roles('finance', 'operations')
  async sendInvoice(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.invoicesService.send(+id, tenantId, actor);
  }

  @Post(':id/approve')
  @Roles('finance')
  async approveInvoice(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.invoicesService.approve(+id, tenantId, actor);
  }

  @Post(':id/duplicate')
  @Roles('finance', 'operations')
  async duplicateInvoice(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const actor = req.user.email || 'system';
    return this.invoicesService.duplicate(+id, tenantId, actor);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const tenantId = req.user.tenantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const invoice = await this.invoicesService.findOne(+id, tenantId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(Buffer.from(`%PDF-1.4\n%Mock PDF for Invoice ${invoice.invoiceNumber}\n`));
  }
}
