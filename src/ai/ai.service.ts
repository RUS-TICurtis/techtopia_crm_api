import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAgent, AiConversation, AiAction, AiRecommendation } from './entities/ai.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiAgent)
    private readonly agentRepository: Repository<AiAgent>,
    @InjectRepository(AiConversation)
    private readonly conversationRepository: Repository<AiConversation>,
    @InjectRepository(AiAction)
    private readonly actionRepository: Repository<AiAction>,
    @InjectRepository(AiRecommendation)
    private readonly recommendationRepository: Repository<AiRecommendation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAgents(tenantId: string): Promise<AiAgent[]> {
    return this.agentRepository.find({ where: { tenantId } });
  }

  async getConversations(userId: number, tenantId: string): Promise<AiConversation[]> {
    return this.conversationRepository.find({
      where: { user: { id: userId }, tenantId },
      relations: { agent: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async createConversation(agentId: number, userId: number, title: string, tenantId: string): Promise<AiConversation> {
    const agent = await this.agentRepository.findOne({ where: { id: agentId, tenantId } });
    if (!agent) throw new NotFoundException(`AI Agent ${agentId} not found`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const convo = this.conversationRepository.create({
      agent,
      user,
      title,
      tenantId,
    }) as AiConversation;

    return this.conversationRepository.save(convo) as Promise<AiConversation>;
  }

  async logAction(conversationId: number, actionName: string, payload: any, result: any, status: string, tenantId: string): Promise<AiAction> {
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId, tenantId } });
    
    const action = this.actionRepository.create({
      conversation: conversation || null,
      actionName,
      payload: payload ? JSON.stringify(payload) : null,
      result: result ? JSON.stringify(result) : null,
      status,
      tenantId,
    }) as AiAction;

    return this.actionRepository.save(action) as Promise<AiAction>;
  }

  async getRecommendations(tenantId: string): Promise<AiRecommendation[]> {
    return this.recommendationRepository.find({
      where: { tenantId, status: 'Active' },
      order: { score: 'DESC' },
    });
  }

  async createRecommendation(data: any, tenantId: string): Promise<AiRecommendation> {
    const rec = this.recommendationRepository.create({ ...data, tenantId }) as unknown as AiRecommendation;
    return this.recommendationRepository.save(rec) as Promise<AiRecommendation>;
  }
}
