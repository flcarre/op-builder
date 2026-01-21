import { router, publicProcedure } from '../trpc';
import {
  createCheckInSchema,
  getMemberByTokenSchema,
} from '@crafted/validators';
import {
  createCheckIn,
  getMemberByToken,
} from '@crafted/services';

export const checkinRouter = router({
  getMemberByToken: publicProcedure
    .input(getMemberByTokenSchema)
    .query(({ input }) => getMemberByToken(input.token)),

  create: publicProcedure
    .input(createCheckInSchema)
    .mutation(({ input }) => createCheckIn(input)),
});
