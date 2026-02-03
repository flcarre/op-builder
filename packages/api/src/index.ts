import { inferRouterOutputs } from '@trpc/server';
import { router } from './trpc';
import { exampleRouter } from './routers/example';
import { authRouter } from './routers/auth';
import { paymentRouter } from './routers/payment';
import { subscriptionRouter } from './routers/subscription';
import { teamRouter } from './routers/team';
import { operationRouter } from './routers/operation';
import { campRouter } from './routers/camp';
import { objectiveRouter } from './routers/objective';
import { checkinRouter } from './routers/checkin';
import { completionRouter } from './routers/completion';
import { leaderboardRouter } from './routers/leaderboard';
import { dominationRouter } from './routers/domination';
import { accessRouter } from './routers/access';

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  payment: paymentRouter,
  subscription: subscriptionRouter,
  team: teamRouter,
  operation: operationRouter,
  camp: campRouter,
  objective: objectiveRouter,
  checkin: checkinRouter,
  completion: completionRouter,
  leaderboard: leaderboardRouter,
  domination: dominationRouter,
  access: accessRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
