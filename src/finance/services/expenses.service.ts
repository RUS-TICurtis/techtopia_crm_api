import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseCategory } from '../entities/expense.entity';
import { FinanceAuditService } from './finance-audit.service';

@Injectable()
export class ExpensesService implements OnModuleInit {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const count = await this.categoryRepository.count();
    if (count > 0) return;

    const defaultCategories = [
      { name: 'Operations' },
      { name: 'Payroll' },
      { name: 'Marketing' },
      { name: 'Infrastructure' },
      { name: 'Travel' },
      { name: 'Other' },
    ];

    for (const cat of defaultCategories) {
      await this.categoryRepository.save(this.categoryRepository.create(cat));
    }
  }

  async getCategories(tenantId: string): Promise<ExpenseCategory[]> {
    return this.categoryRepository.find({ where: { tenantId } });
  }

  async findAll(tenantId: string, category?: string, status?: string): Promise<Expense[]> {
    const query = this.expenseRepository.createQueryBuilder('expense')
      .where('expense.tenantId = :tenantId', { tenantId });

    if (category && category !== 'All') {
      query.andWhere('expense.category = :category', { category });
    }

    if (status && status !== 'All') {
      query.andWhere('expense.status = :status', { status });
    }

    return query.orderBy('expense.createdAt', 'DESC').getMany();
  }

  async findOne(id: number, tenantId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id, tenantId } });
    if (!expense) {
      throw new NotFoundException(`Expense claim ${id} not found`);
    }
    return expense;
  }

  async submit(data: any, tenantId: string, actor: string): Promise<Expense> {
    const expense = this.expenseRepository.create({
      category: data.category,
      amount: data.amount,
      submitter: actor,
      notes: data.notes,
      date: data.date || new Date().toISOString().slice(0, 10),
      receiptUrl: data.receiptUrl,
      status: 'Pending',
      tenantId,
      createdBy: actor,
    });

    const saved = await this.expenseRepository.save(expense);
    await this.auditService.log(actor, 'EXPENSE_SUBMITTED', 'Expense', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async update(id: number, data: any, tenantId: string, actor: string): Promise<Expense> {
    const expense = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(expense));

    Object.assign(expense, data);
    expense.updatedBy = actor;

    const saved = await this.expenseRepository.save(expense);
    await this.auditService.log(actor, 'EXPENSE_UPDATED', 'Expense', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async approve(id: number, tenantId: string, actor: string): Promise<Expense> {
    const expense = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(expense));

    expense.status = 'Approved';
    expense.updatedBy = actor;

    const saved = await this.expenseRepository.save(expense);
    await this.auditService.log(actor, 'EXPENSE_APPROVED', 'Expense', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async reject(id: number, reason: string, tenantId: string, actor: string): Promise<Expense> {
    const expense = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(expense));

    expense.status = 'Rejected';
    expense.rejectionReason = reason;
    expense.updatedBy = actor;

    const saved = await this.expenseRepository.save(expense);
    await this.auditService.log(actor, 'EXPENSE_REJECTED', 'Expense', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async remove(id: number, tenantId: string, actor: string): Promise<void> {
    const expense = await this.findOne(id, tenantId);
    const oldSnapshot = JSON.parse(JSON.stringify(expense));

    await this.expenseRepository.softRemove(expense);
    await this.auditService.log(actor, 'EXPENSE_DELETED', 'Expense', id.toString(), oldSnapshot, null, tenantId);
  }
}
