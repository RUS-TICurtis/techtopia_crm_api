import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionPlan } from '../entities/subscription.entity';
import { FinanceAuditService } from './finance-audit.service';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async onModuleInit() {
    await this.seedPlans();
  }

  private async seedPlans() {
    const count = await this.planRepository.count();
    if (count > 0) return;

    const defaultPlans = [
      { planId: 'free', name: 'Free Tier', price: 0, currency: 'GHS', billingCycle: 'monthly', features: JSON.stringify(['1 User', 'Basic Leads', '5 Invoices/mo']) },
      { planId: 'pro', name: 'Pro Operations', price: 150, currency: 'GHS', billingCycle: 'monthly', features: JSON.stringify(['10 Users', 'Advanced CRM', 'Unlimited Invoices', 'AI Assist']) },
      { planId: 'enterprise', name: 'Enterprise Premium', price: 500, currency: 'GHS', billingCycle: 'monthly', features: JSON.stringify(['Unlimited Users', 'Dedicated DB', 'Full Analytics', '24/7 Support', 'AI Agent Customization']) },
    ];

    for (const plan of defaultPlans) {
      await this.planRepository.save(this.planRepository.create(plan));
    }
  }

  async getPlans(tenantId: string): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ where: { tenantId } });
  }

  async findAll(tenantId: string, status?: string): Promise<Subscription[]> {
    const where: any = { tenantId };
    if (status && status !== 'All') {
      where.status = status;
    }
    return this.subscriptionRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findOne({ where: { id, tenantId } });
    if (!sub) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return sub;
  }

  async create(data: any, tenantId: string, actor: string): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      planId: data.planId,
      clientCompany: data.clientCompany,
      seatCount: data.seatCount || 1,
      usageLimit: data.usageLimit || 100,
      usageCurrent: 0,
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'active',
      tenantId,
      createdBy: actor,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    await this.auditService.log(actor, 'SUBSCRIPTION_CREATED', 'Subscription', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async update(id: number, data: any, tenantId: string, actor: string): Promise<Subscription> {
    const sub = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(sub));

    Object.assign(sub, data);
    sub.updatedBy = actor;

    const saved = await this.subscriptionRepository.save(sub);
    await this.auditService.log(actor, 'SUBSCRIPTION_UPDATED', 'Subscription', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async cancel(id: number, tenantId: string, actor: string): Promise<Subscription> {
    const sub = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(sub));

    sub.status = 'cancelled';
    sub.updatedBy = actor;

    const saved = await this.subscriptionRepository.save(sub);
    await this.auditService.log(actor, 'SUBSCRIPTION_CANCELLED', 'Subscription', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async suspend(id: number, tenantId: string, actor: string): Promise<Subscription> {
    const sub = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(sub));

    sub.status = 'suspended';
    sub.updatedBy = actor;

    const saved = await this.subscriptionRepository.save(sub);
    await this.auditService.log(actor, 'SUBSCRIPTION_SUSPENDED', 'Subscription', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async resume(id: number, tenantId: string, actor: string): Promise<Subscription> {
    const sub = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(sub));

    sub.status = 'active';
    sub.updatedBy = actor;

    const saved = await this.subscriptionRepository.save(sub);
    await this.auditService.log(actor, 'SUBSCRIPTION_RESUMED', 'Subscription', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async upgrade(id: number, planId: string, tenantId: string, actor: string): Promise<Subscription> {
    const sub = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(sub));

    sub.planId = planId;
    sub.updatedBy = actor;

    const saved = await this.subscriptionRepository.save(sub);
    await this.auditService.log(actor, 'SUBSCRIPTION_UPGRADED', 'Subscription', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }
}
