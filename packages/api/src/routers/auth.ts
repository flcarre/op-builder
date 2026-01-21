import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import * as authService from '@crafted/services';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
        teamName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await authService.registerUser(input);
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await authService.loginUser(input);
    }),

  logout: publicProcedure.mutation(async () => {
    return await authService.logoutUser();
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.user || null;
  }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return await authService.requestPasswordReset(input.email);
    }),
});
