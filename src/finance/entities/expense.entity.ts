import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'tenant_techtopia' })
  tenantId: string;
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column('float')
  amount: number;

  @Column()
  submitter: string;

  @Column({ default: 'Pending' })
  status: string; // Pending, Approved, Rejected

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  receiptUrl: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'varchar', default: 'tenant_techtopia' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
