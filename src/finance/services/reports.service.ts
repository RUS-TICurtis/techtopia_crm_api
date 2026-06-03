import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement } from '../entities/settlement.entity';
import { TaxRecord } from '../entities/tax-record.entity';
import { Invoice } from '../entities/invoice.entity';
import { Expense } from '../entities/expense.entity';
import { PaymentTransaction } from '../entities/payment.entity';

@Injectable()
export class ReportsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    @InjectRepository(TaxRecord)
    private readonly taxRepository: Repository<TaxRecord>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    // Seed Settlements
    const setlCount = await this.settlementRepository.count();
    if (setlCount === 0) {
      const defaultSettlements = [
        { gateway: 'Hubtel', amount: 45000, settlementDate: '2026-05-15', status: 'Settled', settlementCycleDays: 1 },
        { gateway: 'Paystack', amount: 28500, settlementDate: '2026-05-16', status: 'Settled', settlementCycleDays: 2 },
        { gateway: 'Hubtel', amount: 62000, settlementDate: '2026-05-20', status: 'Settled', settlementCycleDays: 1 },
        { gateway: 'Paystack', amount: 12000, settlementDate: '2026-05-22', status: 'Pending', settlementCycleDays: 2 },
      ];
      for (const s of defaultSettlements) {
        await this.settlementRepository.save(this.settlementRepository.create(s));
      }
    }

    // Seed Tax Records
    const taxCount = await this.taxRepository.count();
    if (taxCount === 0) {
      const defaultTaxes = [
        { period: '2026 Q1', taxableAmount: 435000, taxRate: 15.0, taxPaid: 65250, status: 'Paid' },
        { period: '2026 Q2', taxableAmount: 512000, taxRate: 15.0, taxPaid: 76800, status: 'Paid' },
        { period: '2026 Q3', taxableAmount: 489000, taxRate: 15.0, taxPaid: 0, status: 'Accrued' },
      ];
      for (const t of defaultTaxes) {
        await this.taxRepository.save(this.taxRepository.create(t));
      }
    }
  }

  // ── Overview ──────────────────────────────────────────────────────────────
  async getOverview(tenantId: string): Promise<any> {
    const invoices = await this.invoiceRepository.find({ where: { tenantId } });
    const expenses = await this.expenseRepository.find({ where: { tenantId } });
    const payments = await this.paymentRepository.find({ where: { tenantId, status: 'completed' } });

    // Calculate YTD totals
    const totalRevenueYtd = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpensesYtd = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
    
    // Outstanding invoices sum
    const outstandingInvoices = invoices
      .filter(i => !['Paid', 'Cancelled', 'Draft'].includes(i.status))
      .reduce((sum, i) => sum + (i.amount - i.paid), 0);

    // Collected this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const collectedThisMonth = payments
      .filter(p => {
        const d = new Date(p.time || p.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      metrics: {
        totalRevenueYtd,
        outstandingInvoices,
        collectedThisMonth,
        totalExpensesYtd,
      },
      recentTransactions: payments.slice(0, 5),
    };
  }

  // ── Settlements ───────────────────────────────────────────────────────────
  async getSettlements(tenantId: string): Promise<Settlement[]> {
    return this.settlementRepository.find({ where: { tenantId }, order: { settlementDate: 'DESC' } });
  }

  // ── Tax Records ───────────────────────────────────────────────────────────
  async getTaxes(tenantId: string): Promise<TaxRecord[]> {
    return this.taxRepository.find({ where: { tenantId }, order: { period: 'DESC' } });
  }

  async createTax(data: any, tenantId: string): Promise<TaxRecord> {
    const record = this.taxRepository.create({
      ...data,
      tenantId,
    }) as unknown as TaxRecord;
    return this.taxRepository.save(record);
  }

  // ── Reports ───────────────────────────────────────────────────────────────
  async getReport(type: string, tenantId: string, start?: string, end?: string): Promise<any> {
    if (type === 'revenue') {
      const payments = await this.paymentRepository.find({ where: { tenantId, status: 'completed' } });
      return payments.map(p => ({
        date: p.time ? p.time.slice(0, 10) : p.createdAt.toISOString().slice(0, 10),
        amount: p.amount,
        client: p.client,
        gateway: p.gateway,
      }));
    } else if (type === 'expense') {
      const expenses = await this.expenseRepository.find({ where: { tenantId } });
      return expenses.map(e => ({
        date: e.date || e.createdAt.toISOString().slice(0, 10),
        amount: e.amount,
        category: e.category,
        submitter: e.submitter,
        status: e.status,
      }));
    } else if (type === 'cash-flow') {
      return [
        { month: 'Jan', inflows: 128000, outflows: 42000, net: 86000 },
        { month: 'Feb', inflows: 145000, outflows: 38000, net: 107000 },
        { month: 'Mar', inflows: 162000, outflows: 51000, net: 111000 },
      ];
    } else if (type === 'invoice-aging') {
      return [
        { range: '0-30 days', amount: 145000 },
        { range: '31-60 days', amount: 87000 },
        { range: '61-90 days', amount: 43000 },
        { range: '90+ days', amount: 22000 },
      ];
    }
    return [];
  }
}
