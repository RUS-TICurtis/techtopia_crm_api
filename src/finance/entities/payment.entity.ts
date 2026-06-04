import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: string; // gateway reference

  @Column()
  client: string;

  @Column('float')
  amount: number;

  @Column({ type: 'varchar', default: 'payment' })
  type: string; // payment, refund, invoice, expense

  @Column({ type: 'varchar', default: 'Manual' })
  gateway: string; // Hubtel, Paystack, Manual

  @Column({ type: 'varchar', default: 'pending' })
  status: string; // completed, pending, failed, refunded

  @Column({ nullable: true })
  time: string;

  @Column({ type: 'varchar', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column({ nullable: true })
  invoiceId: string; // associated invoice if any

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
