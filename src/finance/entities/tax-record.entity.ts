import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tax_records')
export class TaxRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  period: string; // e.g. "2026 Q1", "2026 Q2"

  @Column('float')
  taxableAmount: number;

  @Column('float', { default: 15.0 })
  taxRate: number; // e.g. VAT rate 15%

  @Column('float')
  taxPaid: number;

  @Column({ default: 'Paid' })
  status: string; // Paid, Accrued

  @Column({ type: 'varchar', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
