import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

export interface Context {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
