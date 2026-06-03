import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction } from '../entities/payment.entity';
import { Invoice } from '../entities/invoice.entity';
import { FinanceAuditService } from './finance-audit.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly auditService: FinanceAuditService,
  ) {}

  async findAll(tenantId: string, gateway?: string, status?: string): Promise<PaymentTransaction[]> {
    const query = this.paymentRepository.createQueryBuilder('payment')
      .where('payment.tenantId = :tenantId', { tenantId });

    if (gateway && gateway !== 'All') {
      query.andWhere('payment.gateway = :gateway', { gateway });
    }

    if (status && status !== 'All') {
      query.andWhere('payment.status = :status', { status });
    }

    return query.orderBy('payment.createdAt', 'DESC').getMany();
  }

  async createManual(data: any, tenantId: string, actor: string): Promise<PaymentTransaction> {
    const transactionId = `TXN-MAN-${Date.now()}`;
    const payment = this.paymentRepository.create({
      transactionId,
      client: data.client,
      amount: data.amount,
      type: 'payment',
      gateway: 'Manual',
      status: 'completed',
      time: new Date().toISOString(),
      invoiceId: data.invoiceId ? data.invoiceId.toString() : null,
      tenantId,
      createdBy: actor,
    });

    const saved = await this.paymentRepository.save(payment);

    // If associated with an invoice, update the paid amount
    if (data.invoiceId) {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: parseInt(data.invoiceId), tenantId },
      });
      if (invoice) {
        invoice.paid = Number(invoice.paid || 0) + Number(data.amount);
        if (invoice.paid >= invoice.amount) {
          invoice.status = 'Paid';
        } else if (invoice.paid > 0) {
          invoice.status = 'Partially Paid';
        }
        await this.invoiceRepository.save(invoice);
      }
    }

    await this.auditService.log(actor, 'PAYMENT_RECORDED_MANUAL', 'PaymentTransaction', saved.id.toString(), null, saved, tenantId);
    return saved;
  }

  async refund(id: number, data: any, tenantId: string, actor: string): Promise<PaymentTransaction> {
    const payment = await this.paymentRepository.findOne({ where: { id, tenantId } });
    if (!payment) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const oldSnapshot = JSON.parse(JSON.stringify(payment));
    payment.status = 'refunded';
    payment.updatedBy = actor;

    const saved = await this.paymentRepository.save(payment);

    // If associated with an invoice, adjust paid amount
    if (payment.invoiceId) {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: parseInt(payment.invoiceId), tenantId },
      });
      if (invoice) {
        invoice.paid = Math.max(0, Number(invoice.paid || 0) - Number(payment.amount));
        if (invoice.paid === 0) {
          invoice.status = 'Sent';
        } else {
          invoice.status = 'Partially Paid';
        }
        await this.invoiceRepository.save(invoice);
      }
    }

    await this.auditService.log(actor, 'PAYMENT_REFUNDED', 'PaymentTransaction', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  async reconcile(id: number, tenantId: string, actor: string): Promise<PaymentTransaction> {
    const payment = await this.paymentRepository.findOne({ where: { id, tenantId } });
    if (!payment) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const oldSnapshot = JSON.parse(JSON.stringify(payment));
    payment.status = 'completed';
    payment.updatedBy = actor;

    const saved = await this.paymentRepository.save(payment);
    await this.auditService.log(actor, 'PAYMENT_RECONCILED', 'PaymentTransaction', id.toString(), oldSnapshot, saved, tenantId);
    return saved;
  }

  // ── Hubtel Gateway ────────────────────────────────────────────────────────
  async initiateHubtel(data: any, tenantId: string): Promise<any> {
    const reference = `HUB-${Date.now()}`;
    const payment = this.paymentRepository.create({
      transactionId: reference,
      client: data.client || 'Hubtel Client',
      amount: data.amount,
      type: 'payment',
      gateway: 'Hubtel',
      status: 'pending',
      time: new Date().toISOString(),
      invoiceId: data.invoiceId ? data.invoiceId.toString() : null,
      tenantId,
    });
    await this.paymentRepository.save(payment);

    return {
      success: true,
      reference,
      checkoutUrl: `https://checkout.hubtel.com/mock-sandbox-payment?ref=${reference}`,
      message: 'Hubtel payment initiated successfully',
    };
  }

  async verifyHubtel(reference: string, tenantId: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({ where: { transactionId: reference, tenantId } });
    if (!payment) {
      throw new NotFoundException(`Hubtel payment reference ${reference} not found`);
    }

    if (payment.status === 'pending') {
      payment.status = 'completed';
      await this.paymentRepository.save(payment);

      if (payment.invoiceId) {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: parseInt(payment.invoiceId), tenantId },
        });
        if (invoice) {
          invoice.paid = Number(invoice.paid || 0) + Number(payment.amount);
          invoice.status = invoice.paid >= invoice.amount ? 'Paid' : 'Partially Paid';
          await this.invoiceRepository.save(invoice);
        }
      }
    }

    return {
      status: 'completed',
      amount: payment.amount,
      transactionId: reference,
      gateway: 'Hubtel',
    };
  }

  // ── Paystack Gateway ──────────────────────────────────────────────────────
  async initiatePaystack(data: any, tenantId: string): Promise<any> {
    const reference = `PST-${Date.now()}`;
    const payment = this.paymentRepository.create({
      transactionId: reference,
      client: data.client || 'Paystack Client',
      amount: data.amount,
      type: 'payment',
      gateway: 'Paystack',
      status: 'pending',
      time: new Date().toISOString(),
      invoiceId: data.invoiceId ? data.invoiceId.toString() : null,
      tenantId,
    });
    await this.paymentRepository.save(payment);

    return {
      success: true,
      reference,
      authorizationUrl: `https://checkout.paystack.com/mock-sandbox-payment?ref=${reference}`,
      message: 'Paystack payment initiated successfully',
    };
  }

  async verifyPaystack(reference: string, tenantId: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({ where: { transactionId: reference, tenantId } });
    if (!payment) {
      throw new NotFoundException(`Paystack payment reference ${reference} not found`);
    }

    if (payment.status === 'pending') {
      payment.status = 'completed';
      await this.paymentRepository.save(payment);

      if (payment.invoiceId) {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: parseInt(payment.invoiceId), tenantId },
        });
        if (invoice) {
          invoice.paid = Number(invoice.paid || 0) + Number(payment.amount);
          invoice.status = invoice.paid >= invoice.amount ? 'Paid' : 'Partially Paid';
          await this.invoiceRepository.save(invoice);
        }
      }
    }

    return {
      status: 'completed',
      amount: payment.amount,
      transactionId: reference,
      gateway: 'Paystack',
    };
  }
}
