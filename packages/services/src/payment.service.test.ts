import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCheckoutSession, getCheckoutSession } from '@crafted/payments';
import { createPaymentCheckout, getPaymentSession } from './payment.service';

vi.mock('@crafted/payments');

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentCheckout', () => {
    it('should create a checkout session', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };
      vi.mocked(createCheckoutSession).mockResolvedValue(mockSession as any);

      const result = await createPaymentCheckout({
        priceId: 'price_123',
        userId: 'user_1',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });
    });
  });

  describe('getPaymentSession', () => {
    it('should retrieve a checkout session', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
        customer_email: 'test@example.com',
        amount_total: 2000,
      };
      vi.mocked(getCheckoutSession).mockResolvedValue(mockSession as any);

      const result = await getPaymentSession({
        sessionId: 'cs_test_123',
      });

      expect(result).toEqual({
        id: 'cs_test_123',
        status: 'paid',
        customerEmail: 'test@example.com',
        amountTotal: 2000,
      });
    });
  });
});
