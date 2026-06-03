import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  subject: string;

  @Column()
  client: string;

  @Column({ type: 'varchar', default: 'Medium' })
  priority: string; // Low, Medium, High

  @Column({ type: 'varchar', default: 'Open' })
  status: string; // Open, In Progress, Resolved, Closed

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
