import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, Contact, Company, Opportunity, Pipeline } from './entities/crm.entity';
import { FinanceAuditService } from '../finance/services/finance-audit.service';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    private readonly auditService: FinanceAuditService,
  ) {}

  // ── Leads ──────────────────────────────────────────────────────────────────
  async getLeads(tenantId: string): Promise<Lead[]> {
    return this.leadRepository.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async createLead(data: any, tenantId: string, actor: string): Promise<Lead> {
    const lead = this.leadRepository.create({ ...data, tenantId }) as unknown as Lead;
    const saved = await this.leadRepository.save(lead) as unknown as Lead;
    await this.auditService.log(actor, 'LEAD_CREATED', 'Lead', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updateLead(id: number, data: any, tenantId: string, actor: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    const old = JSON.parse(JSON.stringify(lead));
    Object.assign(lead, data);
    const saved = await this.leadRepository.save(lead) as unknown as Lead;
    await this.auditService.log(actor, 'LEAD_UPDATED', 'Lead', id.toString(), old, saved, tenantId);
    return saved;
  }

  async convertLead(id: number, tenantId: string, actor: string): Promise<Opportunity> {
    const lead = await this.leadRepository.findOne({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);

    // 1. Create Company
    const company = this.companyRepository.create({
      tenantId,
      name: lead.companyName || `${lead.lastName} Ltd`,
    }) as unknown as Company;
    const savedCompany = await this.companyRepository.save(company) as unknown as Company;

    // 2. Create Contact
    const contact = this.contactRepository.create({
      tenantId,
      company: savedCompany,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
    }) as unknown as Contact;
    await this.contactRepository.save(contact);

    // 3. Create Opportunity
    const opportunity = this.opportunityRepository.create({
      tenantId,
      name: `Opp: ${lead.companyName || lead.lastName}`,
      company: savedCompany,
      contact,
      amount: 0.0,
      stage: 'Qualification',
      assignedToUserId: lead.assignedToUserId || null,
    }) as unknown as Opportunity;
    const savedOpportunity = await this.opportunityRepository.save(opportunity) as unknown as Opportunity;

    // 4. Update Lead Status
    lead.status = 'Qualified';
    await this.leadRepository.save(lead);

    await this.auditService.log(actor, 'LEAD_CONVERTED', 'Lead', id.toString(), { leadId: id }, savedOpportunity, tenantId);
    return savedOpportunity;
  }

  // ── Contacts ────────────────────────────────────────────────────────────────
  async getContacts(tenantId: string): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { tenantId },
      relations: { company: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createContact(data: any, tenantId: string, actor: string): Promise<Contact> {
    const contact = this.contactRepository.create({ ...data, tenantId }) as unknown as Contact;
    const saved = await this.contactRepository.save(contact) as unknown as Contact;
    await this.auditService.log(actor, 'CONTACT_CREATED', 'Contact', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  // ── Companies ───────────────────────────────────────────────────────────────
  async getCompanies(tenantId: string): Promise<Company[]> {
    return this.companyRepository.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async createCompany(data: any, tenantId: string, actor: string): Promise<Company> {
    const company = this.companyRepository.create({ ...data, tenantId }) as unknown as Company;
    const saved = await this.companyRepository.save(company) as unknown as Company;
    await this.auditService.log(actor, 'COMPANY_CREATED', 'Company', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  // ── Opportunities ───────────────────────────────────────────────────────────
  async getOpportunities(tenantId: string): Promise<Opportunity[]> {
    return this.opportunityRepository.find({
      where: { tenantId },
      relations: {
        company: true,
        contact: true,
        pipelineStage: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createOpportunity(data: any, tenantId: string, actor: string): Promise<Opportunity> {
    const opp = this.opportunityRepository.create({ ...data, tenantId }) as unknown as Opportunity;
    const saved = await this.opportunityRepository.save(opp) as unknown as Opportunity;
    await this.auditService.log(actor, 'OPPORTUNITY_CREATED', 'Opportunity', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async updateOpportunity(id: number, data: any, tenantId: string, actor: string): Promise<Opportunity> {
    const opp = await this.opportunityRepository.findOne({ where: { id, tenantId } });
    if (!opp) throw new NotFoundException(`Opportunity ${id} not found`);
    const old = JSON.parse(JSON.stringify(opp));
    Object.assign(opp, data);
    const saved = await this.opportunityRepository.save(opp) as unknown as Opportunity;
    await this.auditService.log(actor, 'OPPORTUNITY_UPDATED', 'Opportunity', id.toString(), old, saved, tenantId);
    return saved;
  }
}
