import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  planId: string; // e.g. 'free', 'pro', 'enterprise'

  @Column()
  name: string;

  @Column('float')
  price: number;

  @Column({ default: 'GHS' })
  currency: string;

  @Column({ default: 'monthly' })
  billingCycle: string;

  @Column({ type: 'text', nullable: true })
  features: string; // JSON serialized string array

  @Column({ type: 'varchar', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  planId: string;

  @Column()
  clientCompany: string;

  @Column({ default: 'active' })
  status: string; // active, suspended, cancelled

  @Column({ type: 'integer', default: 1 })
  seatCount: number;

  @Column({ type: 'integer', default: 0 })
  usageLimit: number;

  @Column({ type: 'integer', default: 0 })
  usageCurrent: number;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ type: 'varchar', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
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
