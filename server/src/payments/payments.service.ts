import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider } from './providers/click.provider';
import { UzumProvider } from './providers/uzum.provider';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private payme: PaymeProvider,
    private click: ClickProvider,
    private uzum: UzumProvider,
  ) {}

  /**
   * To'lov yaratish va provider ga yo'naltirish
   */
  async initiate(data: {
    applicationId: number;
    amount: number;
    provider: string;
    returnUrl?: string;
  }) {
    // Application mavjudligini tekshirish
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
    });

    if (!application) {
      throw new NotFoundException('Ariza topilmadi');
    }

    // Mavjud to'lov bormi tekshirish
    const existingPayment = await this.prisma.payment.findUnique({
      where: { applicationId: data.applicationId },
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      throw new BadRequestException('Bu ariza uchun to\'lov allaqachon qilingan');
    }

    // Payment yaratish yoki yangilash
    const payment = existingPayment
      ? await this.prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            amount: data.amount,
            provider: data.provider.toUpperCase() as PaymentProvider,
            status: 'PENDING',
          },
        })
      : await this.prisma.payment.create({
          data: {
            applicationId: data.applicationId,
            amount: data.amount,
            provider: data.provider.toUpperCase() as PaymentProvider,
          },
        });

    // Provider ga yo'naltirish URL ni yaratish
    const orderId = `MSP-${payment.id}`;
    let paymentUrl = '';

    switch (data.provider.toUpperCase()) {
      case 'PAYME':
        paymentUrl = this.payme.generatePaymentUrl(orderId, data.amount);
        break;
      case 'CLICK':
        paymentUrl = this.click.generatePaymentUrl(orderId, data.amount, data.returnUrl);
        break;
      case 'UZUM': {
        const result = await this.uzum.createPayment(orderId, data.amount);
        paymentUrl = result.paymentUrl;
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { providerTransactionId: result.transactionId },
        });
        break;
      }
      case 'CASH':
      case 'PERSONAL_CARD':
        // Naqd va shaxsiy karta uchun to'g'ridan-to'g'ri tasdiqlash
        break;
      default:
        throw new BadRequestException(`Noma\'lum to'lov usuli: ${data.provider}`);
    }

    // Audit
    await this.prisma.auditEvent.create({
      data: {
        applicationId: data.applicationId,
        action: 'PAYMENT_INITIATED',
        details: {
          paymentId: payment.id,
          provider: data.provider,
          amount: data.amount,
        },
      },
    });

    return {
      paymentId: payment.id,
      paymentUrl,
      status: payment.status,
      provider: data.provider,
    };
  }

  /**
   * To'lovni tasdiqlash (manual — naqd/karta uchun)
   */
  async confirm(id: number) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });

    await this.prisma.application.update({
      where: { id: payment.applicationId },
      data: { status: 'PAID_PENDING' },
    });

    this.logger.log(`To'lov tasdiqlandi: payment=${id}, application=${payment.applicationId}`);
    return payment;
  }

  /**
   * To'lovni qaytarish
   */
  async refund(id: number, reason?: string) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    });

    await this.prisma.auditEvent.create({
      data: {
        applicationId: payment.applicationId,
        action: 'PAYMENT_REFUNDED',
        details: { paymentId: id, reason },
      },
    });

    return payment;
  }

  /**
   * To'lov holatini olish
   */
  async getPayment(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!payment) {
      throw new NotFoundException('To\'lov topilmadi');
    }

    return payment;
  }

  /**
   * Ariza bo'yicha to'lovni olish
   */
  async getByApplication(applicationId: number) {
    return this.prisma.payment.findUnique({
      where: { applicationId },
    });
  }

  // ── Webhook handlers ──────────────────────────────────────────────────

  async handlePaymeWebhook(authHeader: string, body: any) {
    if (!this.payme.verifyWebhookAuth(authHeader)) {
      return { error: { code: -32504, message: 'Unauthorized' } };
    }

    const { method, params, id: rpcId } = body;
    const result = this.payme.handleWebhook(method, params);

    // PerformTransaction bo'lsa, to'lovni DB da yangilash
    if (method === 'PerformTransaction' && result.result?.state === 2) {
      await this.updatePaymentByOrderId(params.account?.order_id, 'PAID');
    }

    if (method === 'CancelTransaction' && result.result?.state === -1) {
      await this.updatePaymentByOrderId(params.account?.order_id, 'CANCELLED');
    }

    return { jsonrpc: '2.0', id: rpcId, ...result };
  }

  async handleClickPrepare(body: any) {
    const result = this.click.handlePrepare(body);

    // TODO: DB da to'lovni tekshirish va prepare ID saqlash

    return result;
  }

  async handleClickComplete(body: any) {
    const result = this.click.handleComplete(body);

    if (result.error === 0) {
      await this.updatePaymentByOrderId(body.merchant_trans_id, 'PAID');
    }

    return result;
  }

  async handleUzumWebhook(body: any) {
    const result = this.uzum.handleWebhook(body);

    if (body.status === 'success' && body.orderId) {
      await this.updatePaymentByOrderId(body.orderId, 'PAID');
    }

    return result;
  }

  // ── Helper ────────────────────────────────────────────────────────────

  private async updatePaymentByOrderId(orderId: string, status: 'PAID' | 'CANCELLED') {
    if (!orderId) return;

    // orderId format: MSP-{paymentId}
    const paymentId = parseInt(orderId.replace('MSP-', ''), 10);
    if (isNaN(paymentId)) return;

    try {
      const prismaStatus = status === 'PAID' ? PaymentStatus.PAID : PaymentStatus.CANCELLED;
      const payment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: prismaStatus,
          paidAt: status === 'PAID' ? new Date() : undefined,
        },
      });

      if (status === 'PAID') {
        await this.prisma.application.update({
          where: { id: payment.applicationId },
          data: { status: 'PAID_PENDING' },
        });
      }

      this.logger.log(`Webhook: payment=${paymentId} status=${status}`);
    } catch (error) {
      this.logger.error(`Webhook update xatosi: ${error.message}`);
    }
  }
}
