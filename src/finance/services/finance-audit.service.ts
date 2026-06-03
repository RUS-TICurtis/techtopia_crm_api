import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceAuditLog } from '../entities/audit-log.entity';

@Injectable()
export class FinanceAuditService {
  constructor(
    @InjectRepository(FinanceAuditLog)
    private readonly auditRepository: Repository<FinanceAuditLog>,
  ) {}

  async log(
    actor: string,
    actionType: string,
    entityType: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    tenantId: string = 'tenant_techtopia',
  ): Promise<FinanceAuditLog> {
    const logEntry = this.auditRepository.create({
      actor,
      actionType,
      entityType,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      tenantId,
    }) as unknown as FinanceAuditLog;
    return this.auditRepository.save(logEntry);
  }
}
