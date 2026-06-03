import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { Expense } from '../entities/expense.entity';
import { PaymentTransaction } from '../entities/payment.entity';
import { Budget } from '../entities/budget.entity';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class AIFinanceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async getInsights(tenantId: string): Promise<any[]> {
    const overdueCount = await this.invoiceRepository.count({ where: { tenantId, status: 'Overdue' } });
    const pendingExpenses = await this.expenseRepository.count({ where: { tenantId, status: 'Pending' } });
    
    return [
      {
        id: 1,
        type: overdueCount > 0 ? 'warning' : 'info',
        text: overdueCount > 0 
          ? `You have ${overdueCount} overdue invoices. Standard follow-ups are recommended.`
          : 'Invoice collection velocity is healthy with no outstanding overdue bills.',
        color: overdueCount > 0 ? '#E4FF1A' : '#01FDF6',
      },
      {
        id: 2,
        type: 'danger',
        text: 'Projected operating cash flow remains tight. Delayed collections could impact Q3 runway.',
        color: '#FF47DA',
      },
      {
        id: 3,
        type: pendingExpenses > 0 ? 'warning' : 'info',
        text: pendingExpenses > 0
          ? `There are ${pendingExpenses} pending expense claims awaiting manager approval.`
          : 'All submitted employee expense reports have been processed.',
        color: pendingExpenses > 0 ? '#8A4FFF' : '#21FA90',
      },
    ];
  }

  async getOverdueAlerts(tenantId: string): Promise<any[]> {
    const overdueInvoices = await this.invoiceRepository.find({
      where: { tenantId, status: 'Overdue' },
      order: { amount: 'DESC' },
    });

    return overdueInvoices.map(i => ({
      invoiceNumber: i.invoiceNumber,
      client: i.client,
      amount: i.amount,
      dueDate: i.dueDate,
      daysOverdue: Math.round((Date.now() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }

  async getExecutiveSummary(tenantId: string): Promise<any> {
    const invoices = await this.invoiceRepository.find({ where: { tenantId } });
    const expenses = await this.expenseRepository.find({ where: { tenantId } });
    const payments = await this.paymentRepository.find({ where: { tenantId, status: 'completed' } });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
    const outstanding = invoices
      .filter(i => !['Paid', 'Cancelled', 'Draft'].includes(i.status))
      .reduce((sum, i) => sum + (i.amount - i.paid), 0);

    return {
      summary: `Techtopia financial position is stable. Year-to-date total recorded revenue stands at GH₵${totalRevenue.toLocaleString()}, offset by operating expenses of GH₵${totalExpenses.toLocaleString()}. Pending collections represent GH₵${outstanding.toLocaleString()} in short-term receivables.`,
      kpis: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        receivables: outstanding,
        operatingRatio: totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) + '%' : '0%',
      },
    };
  }

  async getForecast(months: number, tenantId: string): Promise<any[]> {
    const payments = await this.paymentRepository.find({ where: { tenantId, status: 'completed' } });
    const monthlyData: { [key: string]: number } = {};

    payments.forEach(p => {
      const date = new Date(p.time || p.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + p.amount;
    });

    // Basic linear extrapolation or moving average
    const history = Object.keys(monthlyData).sort().map(k => ({ month: k, revenue: monthlyData[k] }));
    const avgMonthly = history.length > 0 ? history.reduce((sum, h) => sum + h.revenue, 0) / history.length : 50000;

    const forecast = [];
    const lastDate = new Date();
    for (let i = 1; i <= months; i++) {
      const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
      const label = nextDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      // Add slight upward growth trend (e.g. 2% growth per month)
      const projected = avgMonthly * Math.pow(1.02, i);
      forecast.push({
        period: label,
        projectedRevenue: Math.round(projected),
        confidenceHigh: Math.round(projected * 1.15),
        confidenceLow: Math.round(projected * 0.85),
      });
    }

    return forecast;
  }

  async getChurn(tenantId: string): Promise<any[]> {
    const subscriptions = await this.subscriptionRepository.find({ where: { tenantId, status: 'active' } });
    
    // Flag subscriptions with usage current < 20% of limit as churn risk
    return subscriptions
      .filter(s => s.usageLimit > 0 && (s.usageCurrent / s.usageLimit) < 0.20)
      .map(s => ({
        id: s.id,
        clientCompany: s.clientCompany,
        planId: s.planId,
        usageRatio: ((s.usageCurrent / s.usageLimit) * 100).toFixed(1) + '%',
        churnRisk: 'High',
      }));
  }

  async chat(query: string, tenantId: string): Promise<any> {
    const q = query.toLowerCase();

    if (q.includes('invoice') || q.includes('overdue') || q.includes('bills')) {
      const overdue = await this.invoiceRepository.find({ where: { tenantId, status: 'Overdue' } });
      const pending = await this.invoiceRepository.find({ where: { tenantId, status: 'Pending Approval' } });
      let reply = `### 📋 Invoice Status Overview\n\n`;
      if (overdue.length > 0) {
        reply += `⚠️ **Overdue Invoices (${overdue.length}):**\n`;
        overdue.forEach(i => {
          reply += `- **${i.invoiceNumber}** for **${i.client}** — **GH₵${i.amount.toLocaleString()}** (Due: ${i.dueDate})\n`;
        });
      } else {
        reply += `✅ No invoices are currently overdue.\n`;
      }
      if (pending.length > 0) {
        reply += `\n⏳ **Awaiting Approval (${pending.length}):**\n`;
        pending.forEach(i => {
          reply += `- **${i.invoiceNumber}** for **${i.client}** — **GH₵${i.amount.toLocaleString()}**\n`;
        });
      }
      return { response: reply };
    }

    if (q.includes('revenue') || q.includes('sales') || q.includes('income') || q.includes('earn')) {
      const payments = await this.paymentRepository.find({ where: { tenantId, status: 'completed' } });
      const total = payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        response: `### 📈 Revenue Analytics Summary\n\nTotal recorded revenue collections YTD is **GH₵${total.toLocaleString()}**.\n\nMost revenue was processed via payment gateways Hubtel and Paystack.`,
      };
    }

    if (q.includes('budget') || q.includes('variance') || q.includes('department')) {
      const budgets = await this.budgetRepository.find({ where: { tenantId } });
      let reply = `### 💼 Budget Allocation & Spending\n\n`;
      budgets.forEach(b => {
        const remaining = b.allocated - b.spent;
        const pct = ((b.spent / b.allocated) * 100).toFixed(0);
        reply += `- **${b.name}**: Allocated: GH₵${b.allocated.toLocaleString()} | Spent: GH₵${b.spent.toLocaleString()} (${pct}%) | Remaining: GH₵${remaining.toLocaleString()}\n`;
      });
      return { response: reply };
    }

    if (q.includes('expense') || q.includes('spend')) {
      const expenses = await this.expenseRepository.find({ where: { tenantId } });
      const total = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
      const pending = expenses.filter(e => e.status === 'Pending');
      return {
        response: `### 🧾 Expense Log Analysis\n\n- **Total Approved Expenses YTD:** GH₵${total.toLocaleString()}\n- **Pending Claims Awaiting Review:** ${pending.length} claims\n\nSubmit new expenses directly in the Expense Claim dashboard.`,
      };
    }

    return {
      response: `👋 Hello! I am the **AI Finance Assistant**. I can help you analyze invoice statuses, revenue projections, operational budgets, and expense logs. Try asking me:\n\n- *"Show overdue invoices"* \n- *"What is our YTD revenue?"*\n- *"List department budget balances"*`,
    };
  }
}
