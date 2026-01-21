import { z } from 'zod';

export const completeObjectiveSchema = z.object({
  token: z.string().min(1),
  teamId: z.string(),
  completedBy: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  deviceInfo: z.string().max(500).optional(),
});

export const getObjectiveByTokenSchema = z.object({
  token: z.string().min(1),
});

export const getCompletionsByObjectiveSchema = z.object({
  objectiveId: z.string(),
  teamId: z.string(),
});

export const getCompletionsByTeamSchema = z.object({
  operationId: z.string(),
  teamId: z.string(),
});

export const getTeamProgressSchema = z.object({
  operationId: z.string(),
  teamId: z.string(),
});

export type CompleteObjectiveInput = z.infer<typeof completeObjectiveSchema>;
export type GetObjectiveByTokenInput = z.infer<typeof getObjectiveByTokenSchema>;
export type GetCompletionsByObjectiveInput = z.infer<typeof getCompletionsByObjectiveSchema>;
export type GetCompletionsByTeamInput = z.infer<typeof getCompletionsByTeamSchema>;
export type GetTeamProgressInput = z.infer<typeof getTeamProgressSchema>;
