import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { FinanceAuditService } from '../finance/services/finance-audit.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async findAll(tenantId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id, tenantId } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async create(data: any, tenantId: string, actor: string): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...data,
      tenantId,
    }) as unknown as Ticket;
    const saved = await this.ticketRepository.save(ticket) as Ticket;
    await this.auditService.log(actor, 'TICKET_CREATED', 'Ticket', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async update(id: number, data: any, tenantId: string, actor: string): Promise<Ticket> {
    const ticket = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(ticket));
    Object.assign(ticket, data);
    const saved = await this.ticketRepository.save(ticket) as Ticket;
    await this.auditService.log(actor, 'TICKET_UPDATED', 'Ticket', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async remove(id: number, tenantId: string, actor: string): Promise<void> {
    const ticket = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(ticket));
    await this.ticketRepository.remove(ticket);
    await this.auditService.log(actor, 'TICKET_DELETED', 'Ticket', id.toString(), oldSnapshot, null, tenantId);
  }
}
