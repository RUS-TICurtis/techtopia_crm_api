import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceItem } from '../entities/invoice.entity';
import { FinanceAuditService } from './finance-audit.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async findAll(tenantId: string, status?: string): Promise<Invoice[]> {
    const query = this.invoiceRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.tenantId = :tenantId', { tenantId });
    
    if (status && status !== 'All') {
      query.andWhere('invoice.status = :status', { status });
    }

    return query.orderBy('invoice.createdAt', 'DESC').getMany();
  }

  async findOne(id: number, tenantId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: { items: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async create(data: any, tenantId: string, actor: string): Promise<Invoice> {
    // Generate invoice number
    const count = await this.invoiceRepository.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

    const { items, ...invoiceData } = data;

    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      invoiceNumber,
      tenantId,
      status: 'Draft',
      createdBy: actor,
    }) as unknown as Invoice;

    if (items && items.length > 0) {
      invoice.items = items.map((item: any) =>
        this.invoiceItemRepository.create({
          description: item.description,
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
        }),
      );
    }

    const saved = await this.invoiceRepository.save(invoice);
    await this.auditService.log(actor, 'INVOICE_CREATED', 'Invoice', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async update(id: number, data: any, tenantId: string, actor: string): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(invoice));

    const { items, ...invoiceData } = data;

    // Update main fields
    Object.assign(invoice, invoiceData);
    invoice.updatedBy = actor;

    if (items) {
      // Remove existing items first
      if (invoice.items && invoice.items.length > 0) {
        await this.invoiceItemRepository.remove(invoice.items);
      }
      // Re-create items
      invoice.items = items.map((item: any) =>
        this.invoiceItemRepository.create({
          description: item.description,
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
        }),
      );
    }

    const saved = await this.invoiceRepository.save(invoice);
    await this.auditService.log(actor, 'INVOICE_UPDATED', 'Invoice', saved.id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async remove(id: number, tenantId: string, actor: string): Promise<void> {
    const invoice = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(invoice));

    await this.invoiceRepository.softRemove(invoice);
    await this.auditService.log(actor, 'INVOICE_DELETED', 'Invoice', id.toString(), oldSnapshot, null, tenantId);
  }

  async send(id: number, tenantId: string, actor: string): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(invoice));

    invoice.status = 'Sent';
    invoice.updatedBy = actor;

    const saved = await this.invoiceRepository.save(invoice);
    await this.auditService.log(actor, 'INVOICE_SENT', 'Invoice', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async approve(id: number, tenantId: string, actor: string): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(invoice));

    invoice.status = 'Approved';
    invoice.updatedBy = actor;

    const saved = await this.invoiceRepository.save(invoice);
    await this.auditService.log(actor, 'INVOICE_APPROVED', 'Invoice', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async duplicate(id: number, tenantId: string, actor: string): Promise<Invoice> {
    const invoice = await this.findOne(id, tenantId);
    const count = await this.invoiceRepository.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

    const newInvoice = this.invoiceRepository.create({
      client: invoice.client,
      project: invoice.project,
      email: invoice.email,
      phone: invoice.phone,
      address: invoice.address,
      amount: invoice.amount,
      paid: 0,
      currency: invoice.currency,
      status: 'Draft',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      taxRate: invoice.taxRate,
      discount: invoice.discount,
      tenantId,
      createdBy: actor,
    }) as unknown as Invoice;

    if (invoice.items) {
      newInvoice.items = invoice.items.map((item) =>
        this.invoiceItemRepository.create({
          description: item.description,
          qty: item.qty,
          unitPrice: item.unitPrice,
        }),
      );
    }

    const saved = await this.invoiceRepository.save(newInvoice);
    await this.auditService.log(actor, 'INVOICE_DUPLICATED', 'Invoice', saved.id.toString(), null, saved, tenantId);
    return saved;
  }
}
