import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  completeObjectiveSchema,
  getObjectiveByTokenSchema,
  getCompletionsByTeamSchema,
  getTeamProgressSchema,
} from '@crafted/validators';
import {
  completeObjective,
  getObjectiveByToken,
  getCompletionsByTeam,
  getTeamProgress,
} from '@crafted/services';

export const completionRouter = router({
  getObjectiveByToken: publicProcedure
    .input(getObjectiveByTokenSchema)
    .query(({ input }) => getObjectiveByToken(input.token)),

  complete: publicProcedure
    .input(completeObjectiveSchema)
    .mutation(({ input }) => completeObjective(input)),

  getByTeam: publicProcedure
    .input(getCompletionsByTeamSchema)
    .query(({ input }) =>
      getCompletionsByTeam(input.operationId, input.teamId)
    ),

  getTeamProgress: protectedProcedure
    .input(getTeamProgressSchema)
    .query(({ input }) => getTeamProgress(input.operationId, input.teamId)),
});
