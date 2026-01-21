import { router, protectedProcedure } from '../trpc';
import * as subscriptionService from '@crafted/services';

export const subscriptionRouter = router({
  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    return await subscriptionService.getMySubscription(ctx.userId!);
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await subscriptionService.getAllSubscriptions(ctx.userId!);
  }),

  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    return await subscriptionService.cancelSubscription(ctx.userId!);
  }),

  reactivate: protectedProcedure.mutation(async ({ ctx }) => {
    return await subscriptionService.reactivateSubscription(ctx.userId!);
  }),
});
