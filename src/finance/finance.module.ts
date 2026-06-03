import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Invoice, InvoiceItem } from './entities/invoice.entity';
import { PaymentTransaction } from './entities/payment.entity';
import { Subscription, SubscriptionPlan } from './entities/subscription.entity';
import { Expense, ExpenseCategory } from './entities/expense.entity';
import { Vendor, PurchaseOrder } from './entities/vendor.entity';
import { Budget } from './entities/budget.entity';
import { Settlement } from './entities/settlement.entity';
import { TaxRecord } from './entities/tax-record.entity';
import { FinanceAuditLog } from './entities/audit-log.entity';

// Services
import { FinanceAuditService } from './services/finance-audit.service';
import { InvoicesService } from './services/invoices.service';
import { PaymentsService } from './services/payments.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { ExpensesService } from './services/expenses.service';
import { VendorsService } from './services/vendors.service';
import { BudgetsService } from './services/budgets.service';
import { ReportsService } from './services/reports.service';
import { AIFinanceService } from './services/ai-finance.service';
import { FinanceEventPublisher } from './events/finance-event.publisher';

// Controllers
import { InvoicesController } from './controllers/invoices.controller';
import { PaymentsController } from './controllers/payments.controller';
import { GatewaysController } from './controllers/gateways.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { ExpensesController } from './controllers/expenses.controller';
import { VendorsController } from './controllers/vendors.controller';
import { ProcurementController } from './controllers/procurement.controller';
import { BudgetsController } from './controllers/budgets.controller';
import { OverviewController } from './controllers/overview.controller';
import { ReportsController } from './controllers/reports.controller';
import { SettlementsController } from './controllers/settlements.controller';
import { TaxController } from './controllers/tax.controller';
import { AIController } from './controllers/ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      PaymentTransaction,
      Subscription,
      SubscriptionPlan,
      Expense,
      ExpenseCategory,
      Vendor,
      PurchaseOrder,
      Budget,
      Settlement,
      TaxRecord,
      FinanceAuditLog,
    ]),
  ],
  providers: [
    FinanceAuditService,
    InvoicesService,
    PaymentsService,
    SubscriptionsService,
    ExpensesService,
    VendorsService,
    BudgetsService,
    ReportsService,
    AIFinanceService,
    FinanceEventPublisher,
  ],
  controllers: [
    InvoicesController,
    PaymentsController,
    GatewaysController,
    SubscriptionsController,
    ExpensesController,
    VendorsController,
    ProcurementController,
    BudgetsController,
    OverviewController,
    ReportsController,
    SettlementsController,
    TaxController,
    AIController,
  ],
  exports: [
    InvoicesService,
    PaymentsService,
    SubscriptionsService,
    ExpensesService,
    VendorsService,
    BudgetsService,
    ReportsService,
    AIFinanceService,
    FinanceEventPublisher,
  ],
})
export class FinanceModule {}
