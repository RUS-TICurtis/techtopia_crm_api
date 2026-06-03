import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('ai_agents')
export class AiAgent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ type: 'text' })
  systemPrompt: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ai_conversations')
export class AiConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => AiAgent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agent_id' })
  agent: AiAgent | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ai_actions')
export class AiAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @ManyToOne(() => AiConversation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: AiConversation | null;

  @Column()
  actionName: string;

  @Column({ type: 'text', nullable: true })
  payload: string | null;

  @Column({ type: 'text', nullable: true })
  result: string | null;

  @Column({ type: 'varchar', default: 'success' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('ai_recommendations')
export class AiRecommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', default: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  tenantId: string;

  @Column()
  entityType: string; // lead, contact, opportunity, invoice

  @Column()
  entityId: string;

  @Column({ type: 'text' })
  recommendationText: string;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @Column({ type: 'varchar', default: 'Active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
