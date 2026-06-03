import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g. "Operations", "Marketing", "Payroll"

  @Column('float')
  allocated: number;

  @Column('float', { default: 0 })
  spent: number;

  @Column({ default: 'FY 2026' })
  period: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'varchar', default: 'tenant_techtopia' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
