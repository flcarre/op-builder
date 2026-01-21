import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMySubscription,
  getAllSubscriptions,
  cancelSubscription,
  reactivateSubscription,
} from '../subscription.service';

vi.mock('@crafted/database');
vi.mock('@crafted/payments');

describe('Subscription Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMySubscription', () => {
    it('should return active subscription for user', async () => {
      const { db } = await import('@crafted/database');

      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        status: 'active',
        stripeSubscriptionId: 'sub_stripe_123',
        stripePriceId: 'price_123',
        stripeProductId: 'prod_123',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.subscription.findFirst).mockResolvedValue(mockSubscription);

      const result = await getMySubscription('user-123');

      expect(db.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: {
            in: ['active', 'trialing'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(mockSubscription);
    });

    it('should return null if no active subscription', async () => {
      const { db } = await import('@crafted/database');

      vi.mocked(db.subscription.findFirst).mockResolvedValue(null);

      const result = await getMySubscription('user-123');

      expect(result).toBeNull();
    });
  });

  describe('getAllSubscriptions', () => {
    it('should return all subscriptions for user', async () => {
      const { db } = await import('@crafted/database');

      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-123',
          status: 'active',
        },
        {
          id: 'sub-2',
          userId: 'user-123',
          status: 'canceled',
        },
      ];

      vi.mocked(db.subscription.findMany).mockResolvedValue(mockSubscriptions as any);

      const result = await getAllSubscriptions('user-123');

      expect(db.subscription.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel active subscription in Stripe and DB', async () => {
      const { db } = await import('@crafted/database');
      const { stripe } = await import('@crafted/payments');

      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        status: 'active',
        stripeSubscriptionId: 'sub_stripe_123',
      };

      vi.mocked(db.subscription.findFirst).mockResolvedValue(mockSubscription as any);
      vi.mocked(stripe.subscriptions.update).mockResolvedValue({} as any);
      vi.mocked(db.subscription.update).mockResolvedValue({} as any);

      const result = await cancelSubscription('user-123');

      expect(db.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: 'active',
        },
      });

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_stripe_123', {
        cancel_at_period_end: true,
      });

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: {
          id: 'sub-123',
        },
        data: {
          cancelAtPeriodEnd: true,
        },
      });

      expect(result.success).toBe(true);
    });

    it('should throw error if no active subscription', async () => {
      const { db } = await import('@crafted/database');

      vi.mocked(db.subscription.findFirst).mockResolvedValue(null);

      await expect(
        cancelSubscription('user-123')
      ).rejects.toThrow('No active subscription found');
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate canceled subscription in Stripe and DB', async () => {
      const { db } = await import('@crafted/database');
      const { stripe } = await import('@crafted/payments');

      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_stripe_123',
      };

      vi.mocked(db.subscription.findFirst).mockResolvedValue(mockSubscription as any);
      vi.mocked(stripe.subscriptions.update).mockResolvedValue({} as any);
      vi.mocked(db.subscription.update).mockResolvedValue({} as any);

      const result = await reactivateSubscription('user-123');

      expect(db.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          cancelAtPeriodEnd: true,
        },
      });

      expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_stripe_123', {
        cancel_at_period_end: false,
      });

      expect(db.subscription.update).toHaveBeenCalledWith({
        where: {
          id: 'sub-123',
        },
        data: {
          cancelAtPeriodEnd: false,
        },
      });

      expect(result.success).toBe(true);
    });

    it('should throw error if no subscription to reactivate', async () => {
      const { db } = await import('@crafted/database');

      vi.mocked(db.subscription.findFirst).mockResolvedValue(null);

      await expect(
        reactivateSubscription('user-123')
      ).rejects.toThrow('No subscription to reactivate');
    });
  });
});
