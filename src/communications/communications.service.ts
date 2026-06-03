import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message, Notification } from './entities/communication.entity';
import { User } from '../users/user.entity';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Conversations
  async getConversations(tenantId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { tenantId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getConversationMessages(conversationId: number, tenantId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId }, tenantId },
      relations: { sender: true },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(conversationId: number, senderId: number, content: string, tenantId: string): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId, tenantId } });
    if (!conversation) throw new NotFoundException(`Conversation ${conversationId} not found`);

    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    if (!sender) throw new NotFoundException(`Sender ${senderId} not found`);

    const message = this.messageRepository.create({
      conversation,
      sender,
      content,
      tenantId,
    }) as Message;

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    return this.messageRepository.save(message) as Promise<Message>;
  }

  // Notifications
  async getNotifications(userId: number, tenantId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId }, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async createNotification(userId: number, title: string, content: string, type: string, tenantId: string): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const notif = this.notificationRepository.create({
      user,
      title,
      content,
      type,
      tenantId,
    }) as Notification;

    return this.notificationRepository.save(notif) as Promise<Notification>;
  }

  async markNotificationRead(notificationId: number, tenantId: string): Promise<Notification> {
    const notif = await this.notificationRepository.findOne({ where: { id: notificationId, tenantId } });
    if (!notif) throw new NotFoundException(`Notification ${notificationId} not found`);

    notif.isRead = true;
    return this.notificationRepository.save(notif) as Promise<Notification>;
  }
}
