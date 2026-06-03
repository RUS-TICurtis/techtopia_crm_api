import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../entities/budget.entity';
import { FinanceAuditService } from './finance-audit.service';

@Injectable()
export class BudgetsService implements OnModuleInit {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async onModuleInit() {
    await this.seedBudgets();
  }

  private async seedBudgets() {
    const count = await this.budgetRepository.count();
    if (count > 0) return;

    const defaultBudgets = [
      { name: 'Operations', allocated: 250000, spent: 80000, period: 'FY 2026', category: 'Operating' },
      { name: 'Marketing', allocated: 120000, spent: 45000, period: 'FY 2026', category: 'Marketing' },
      { name: 'Payroll', allocated: 800000, spent: 320000, period: 'FY 2026', category: 'Staffing' },
      { name: 'Infrastructure', allocated: 150000, spent: 65000, period: 'FY 2026', category: 'Technology' },
      { name: 'Travel', allocated: 40000, spent: 12000, period: 'FY 2026', category: 'Travel' },
    ];

    for (const b of defaultBudgets) {
      await this.budgetRepository.save(this.budgetRepository.create(b));
    }
  }

  async findAll(tenantId: string, period?: string): Promise<Budget[]> {
    const where: any = { tenantId };
    if (period) {
      where.period = period;
    }
    return this.budgetRepository.find({
      where,
      order: { allocated: 'DESC' },
    });
  }

  async findOne(id: number, tenantId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({ where: { id, tenantId } });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  async create(data: any, tenantId: string, actor: string): Promise<Budget> {
    const budget = this.budgetRepository.create({
      name: data.name,
      allocated: data.allocated,
      spent: data.spent || 0,
      period: data.period || 'FY 2026',
      category: data.category,
      tenantId,
    });
    const saved = await this.budgetRepository.save(budget);
    await this.auditService.log(actor, 'BUDGET_CREATED', 'Budget', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async update(id: number, data: any, tenantId: string, actor: string): Promise<Budget> {
    const budget = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(budget));

    Object.assign(budget, data);

    const saved = await this.budgetRepository.save(budget);
    await this.auditService.log(actor, 'BUDGET_UPDATED', 'Budget', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async remove(id: number, tenantId: string, actor: string): Promise<void> {
    const budget = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(budget));

    await this.budgetRepository.remove(budget);
    await this.auditService.log(actor, 'BUDGET_DELETED', 'Budget', id.toString(), oldSnapshot, null, tenantId);
  }
}
