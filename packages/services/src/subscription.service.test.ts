import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@crafted/database';
import {
  getActiveSubscription,
  getAllUserSubscriptions,
  cancelUserSubscription,
  reactivateUserSubscription,
} from './subscription.service';

vi.mock('@crafted/database', () => ({
  db: {
    subscription: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveSubscription', () => {
    it('should return active subscription', async () => {
      const mockSubscription = {
        id: 'sub_1',
        userId: 'user_1',
        status: 'active',
      };
      vi.mocked(db.subscription.findFirst).mockResolvedValue(mockSubscription as any);

      const result = await getActiveSubscription('user_1');

      expect(result).toEqual(mockSubscription);
      expect(db.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user_1',
          status: { in: ['active', 'trialing'] },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getAllUserSubscriptions', () => {
    it('should return all user subscriptions', async () => {
      const mockSubscriptions = [
        { id: 'sub_1', userId: 'user_1', status: 'active' },
        { id: 'sub_2', userId: 'user_1', status: 'canceled' },
      ];
      vi.mocked(db.subscription.findMany).mockResolvedValue(mockSubscriptions as any);

      const result = await getAllUserSubscriptions('user_1');

      expect(result).toEqual(mockSubscriptions);
    });
  });

  describe('cancelUserSubscription', () => {
    it('should cancel active subscription', async () => {
      const mockSubscription = {
        id: 'sub_1',
        userId: 'user_1',
        status: 'active',
      };
      vi.mocked(db.subscription.findFirst).mockResolvedValue(mockSubscription as any);
      vi.mocked(db.subscription.update).mockResolvedValue(mockSubscription as any);

      const result = await cancelUserSubscription('user_1');

      expect(result).toEqual({ success: true });
      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_1' },
        data: { cancelAtPeriodEnd: true },
      });
    });

    it('should throw when no active subscription found', async () => {
      vi.mocked(db.subscription.findFirst).mockResolvedValue(null);

      await expect(cancelUserSubscription('user_1')).rejects.toThrow(
        'No active subscription found'
      );
    });
  });

  describe('reactivateUserSubscription', () => {
    it('should reactivate canceled subscription', async () => {
      const mockSubscription = {
        id: 'sub_1',
        userId: 'user_1',
        cancelAtPeriodEnd: true,
      };
      vi.mocked(db.subscription.findFirst).mockResolvedValue(mockSubscription as any);
      vi.mocked(db.subscription.update).mockResolvedValue(mockSubscription as any);

      const result = await reactivateUserSubscription('user_1');

      expect(result).toEqual({ success: true });
      expect(db.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_1' },
        data: { cancelAtPeriodEnd: false },
      });
    });

    it('should throw when no subscription to reactivate', async () => {
      vi.mocked(db.subscription.findFirst).mockResolvedValue(null);

      await expect(reactivateUserSubscription('user_1')).rejects.toThrow(
        'No subscription to reactivate'
      );
    });
  });
});
