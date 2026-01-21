import { router, protectedProcedure } from '../trpc';
import {
  getOperationLeaderboardSchema,
  getCampLeaderboardSchema,
} from '@crafted/validators';
import {
  getOperationLeaderboard,
  getCampLeaderboard,
} from '@crafted/services';

export const leaderboardRouter = router({
  getOperationLeaderboard: protectedProcedure
    .input(getOperationLeaderboardSchema)
    .query(({ input }) =>
      getOperationLeaderboard(input.operationId, input.teamId)
    ),

  getCampLeaderboard: protectedProcedure
    .input(getCampLeaderboardSchema)
    .query(({ input }) => getCampLeaderboard(input.operationId, input.teamId)),
});
