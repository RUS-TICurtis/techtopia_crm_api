import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  company: Company;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'varchar', default: 'New' })
  status: string; // New, Contacted, Qualified, Unqualified

  @Column({ type: 'int', nullable: true })
  assignedToUserId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Pipeline, { onDelete: 'CASCADE' })
  pipeline: Pipeline;

  @Column()
  name: string;

  @Column({ default: 0 })
  position: number;

  @Column({ type: 'float', nullable: true })
  probability: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  name: string;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  company: Company;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  contact: Contact;

  @ManyToOne(() => PipelineStage, { nullable: true, onDelete: 'SET NULL' })
  pipelineStage: PipelineStage;

  @Column({ type: 'float', default: 0.0 })
  amount: number;

  @Column({ type: 'varchar', nullable: true })
  closeDate: string;

  @Column({ type: 'varchar', default: 'Qualification' })
  stage: string; // Qualification, Proposal, Negotiation, Closed Won, Closed Lost

  @Column({ type: 'int', nullable: true })
  assignedToUserId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE' })
  opportunity: Opportunity;

  @Column({ unique: true })
  quoteNumber: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ default: 'Draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => Quote, { nullable: true, onDelete: 'SET NULL' })
  quote: Quote;

  @Column({ unique: true })
  contractNumber: string;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'varchar', nullable: true })
  startDate: string;

  @Column({ type: 'varchar', nullable: true })
  endDate: string;

  @Column({ default: 'Draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
