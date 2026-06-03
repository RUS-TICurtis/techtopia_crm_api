import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, PurchaseOrder } from '../entities/vendor.entity';
import { FinanceAuditService } from './finance-audit.service';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    private readonly auditService: FinanceAuditService,
  ) {}

  // ── Vendor Methods ────────────────────────────────────────────────────────
  async findAllVendors(tenantId: string, search?: string): Promise<Vendor[]> {
    const query = this.vendorRepository.createQueryBuilder('vendor')
      .where('vendor.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere(
        '(vendor.name LIKE :search OR vendor.contactName LIKE :search OR vendor.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query.orderBy('vendor.name', 'ASC').getMany();
  }

  async findVendorById(id: number, tenantId: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id, tenantId } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async createVendor(data: any, tenantId: string, actor: string): Promise<Vendor> {
    const vendor = this.vendorRepository.create({
      ...data,
      tenantId,
    }) as unknown as Vendor;
    const saved = await this.vendorRepository.save(vendor);
    await this.auditService.log(actor, 'VENDOR_CREATED', 'Vendor', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updateVendor(id: number, data: any, tenantId: string, actor: string): Promise<Vendor> {
    const vendor = await this.findVendorById(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(vendor));

    Object.assign(vendor, data);

    const saved = await this.vendorRepository.save(vendor);
    await this.auditService.log(actor, 'VENDOR_UPDATED', 'Vendor', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async removeVendor(id: number, tenantId: string, actor: string): Promise<void> {
    const vendor = await this.findVendorById(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(vendor));

    await this.vendorRepository.softRemove(vendor);
    await this.auditService.log(actor, 'VENDOR_DELETED', 'Vendor', id.toString(), oldSnapshot, null, tenantId);
  }

  // ── Purchase Order (Procurement) Methods ──────────────────────────────────
  async findAllPOs(tenantId: string, status?: string): Promise<PurchaseOrder[]> {
    const where: any = { tenantId };
    if (status && status !== 'All') {
      where.status = status;
    }
    return this.poRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findPOById(id: number, tenantId: string): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({ where: { id, tenantId } });
    if (!po) {
      throw new NotFoundException(`Purchase Order ${id} not found`);
    }
    return po;
  }

  async createPO(data: any, tenantId: string, actor: string): Promise<PurchaseOrder> {
    // Generate PO Number
    const count = await this.poRepository.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const poNumber = `PO-${year}-${String(count + 1).padStart(3, '0')}`;

    const vendor = await this.findVendorById(data.vendorId, tenantId);

    const po = this.poRepository.create({
      poNumber,
      vendorId: data.vendorId,
      vendorName: vendor.name,
      amount: data.amount,
      status: 'Draft',
      items: data.items ? JSON.stringify(data.items) : null,
      issueDate: data.issueDate || new Date().toISOString().slice(0, 10),
      deliveryDate: data.deliveryDate,
      tenantId,
      createdBy: actor,
    }) as unknown as PurchaseOrder;

    const saved = await this.poRepository.save(po);
    await this.auditService.log(actor, 'PURCHASE_ORDER_CREATED', 'PurchaseOrder', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updatePO(id: number, data: any, tenantId: string, actor: string): Promise<PurchaseOrder> {
    const po = await this.findPOById(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(po));

    if (data.vendorId && data.vendorId !== po.vendorId) {
      const vendor = await this.findVendorById(data.vendorId, tenantId);
      po.vendorId = data.vendorId;
      po.vendorName = vendor.name;
    }

    if (data.items) {
      po.items = JSON.stringify(data.items);
    }

    Object.assign(po, {
      amount: data.amount !== undefined ? data.amount : po.amount,
      status: data.status !== undefined ? data.status : po.status,
      deliveryDate: data.deliveryDate !== undefined ? data.deliveryDate : po.deliveryDate,
      updatedBy: actor,
    });

    const saved = await this.poRepository.save(po);
    await this.auditService.log(actor, 'PURCHASE_ORDER_UPDATED', 'PurchaseOrder', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async approvePO(id: number, tenantId: string, actor: string): Promise<PurchaseOrder> {
    const po = await this.findPOById(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(po));

    po.status = 'Approved';
    po.updatedBy = actor;

    const saved = await this.poRepository.save(po);
    await this.auditService.log(actor, 'PURCHASE_ORDER_APPROVED', 'PurchaseOrder', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async rejectPO(id: number, tenantId: string, actor: string): Promise<PurchaseOrder> {
    const po = await this.findPOById(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(po));

    po.status = 'Rejected';
    po.updatedBy = actor;

    const saved = await this.poRepository.save(po);
    await this.auditService.log(actor, 'PURCHASE_ORDER_REJECTED', 'PurchaseOrder', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }
}
