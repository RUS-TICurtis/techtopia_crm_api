import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gateway: string; // Hubtel, Paystack

  @Column('float')
  amount: number;

  @Column()
  settlementDate: string;

  @Column({ default: 'Settled' })
  status: string; // Settled, Pending, Failed

  @Column({ type: 'integer', default: 1 })
  settlementCycleDays: number;

  @Column({ type: 'varchar', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
