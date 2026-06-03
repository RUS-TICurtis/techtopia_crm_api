import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  client: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column('float', { default: 0 })
  amount: number;

  @Column('float', { default: 0 })
  paid: number;

  @Column({ type: 'varchar', default: 'GHS' })
  currency: string;

  @Column({ type: 'varchar', default: 'Draft' })
  status: string; // Draft, Pending Approval, Approved, Sent, Viewed, Partially Paid, Paid, Overdue, Cancelled

  @Column({ nullable: true })
  issueDate: string;

  @Column({ nullable: true })
  dueDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('float', { default: 0 })
  taxRate: number;

  @Column('float', { default: 0 })
  discount: number;

  @Column({ type: 'varchar', default: 'tenant_techtopia' })
  tenantId: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true, eager: true })
  items: InvoiceItem[];

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

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column('float')
  qty: number;

  @Column('float')
  unitPrice: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;
}
