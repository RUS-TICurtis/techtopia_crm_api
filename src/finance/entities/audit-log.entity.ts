import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('finance_audit_logs')
export class FinanceAuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  actor: string; // user id or email

  @Column()
  actionType: string; // INVOICE_CREATED, PAYMENT_REFUNDED, etc.

  @Column()
  entityType: string; // Invoice, Payment, Expense, Budget

  @Column()
  entityId: string;

  @Column({ type: 'text', nullable: true })
  oldValue: string | null;

  @Column({ type: 'text', nullable: true })
  newValue: string | null;

  @Column({ type: 'varchar', default: 'tenant_techtopia' })
  tenantId: string;

  @CreateDateColumn()
  timestamp: Date;
}
