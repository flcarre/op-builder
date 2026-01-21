import { z } from 'zod';

export const getOperationLeaderboardSchema = z.object({
  operationId: z.string(),
  teamId: z.string(),
});

export const getCampLeaderboardSchema = z.object({
  operationId: z.string(),
  teamId: z.string(),
});

export type GetOperationLeaderboardInput = z.infer<
  typeof getOperationLeaderboardSchema
>;
export type GetCampLeaderboardInput = z.infer<typeof getCampLeaderboardSchema>;
