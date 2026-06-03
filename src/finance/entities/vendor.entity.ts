import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

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

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  poNumber: string;

  @Column()
  vendorId: number;

  @Column()
  vendorName: string;

  @Column('float')
  amount: number;

  @Column({ default: 'Draft' })
  status: string; // Draft, Submitted, Approved, Completed, Rejected

  @Column({ type: 'text', nullable: true })
  items: string | null; // JSON string of items

  @Column({ type: 'varchar', nullable: true })
  issueDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  deliveryDate: string | null;

  @Column({ type: 'varchar', default: 'tenant_techtopia' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string | null;

  @DeleteDateColumn()
  deletedAt: Date;
}
