import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async findAll(tenantId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { tenantId },
      order: { timestamp: 'DESC' },
    });
  }

  async log(
    actor: string,
    module: string,
    action: string,
    previousValue: any,
    newValue: any,
    tenantId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  ): Promise<AuditLog> {
    const logEntry = this.auditRepository.create({
      actor,
      module,
      action,
      previousValue: previousValue ? JSON.stringify(previousValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      tenantId,
    }) as AuditLog;
    return this.auditRepository.save(logEntry);
  }
}
