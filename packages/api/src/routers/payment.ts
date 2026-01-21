import { publicProcedure, router } from '../trpc';
import { createCheckoutSchema, getSessionSchema } from '@crafted/validators';
import { createPaymentCheckout, getPaymentSession } from '@crafted/services';

export const paymentRouter = router({
  createCheckout: publicProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ input }) => createPaymentCheckout(input)),

  getSession: publicProcedure
    .input(getSessionSchema)
    .query(async ({ input }) => getPaymentSession(input)),
});
