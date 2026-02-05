import { z } from 'zod';

export const dominationSessionStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
]);

export const createDominationSessionSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  pointsPerTick: z.number().int().min(1).max(100).default(1),
  tickIntervalSec: z.number().int().min(1).max(300).default(1),
  durationMinutes: z.number().int().min(1).max(480).optional(),
});

export const updateDominationSessionSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  pointsPerTick: z.number().int().min(1).max(100).optional(),
  tickIntervalSec: z.number().int().min(1).max(300).optional(),
  durationMinutes: z.number().int().min(1).max(480).nullable().optional(),
});

export const setScoringEnabledSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
});

export const createDominationTeamSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(2).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
});

export const updateDominationTeamSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const reorderDominationTeamsSchema = z.object({
  sessionId: z.string(),
  teamIds: z.array(z.string()),
});

export const createDominationPointSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateDominationPointSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const reorderDominationPointsSchema = z.object({
  sessionId: z.string(),
  pointIds: z.array(z.string()),
});

export const captureDominationPointSchema = z.object({
  qrToken: z.string(),
  teamId: z.string(),
  capturedBy: z.string().optional(),
});

export const dominationSessionByIdSchema = z.object({
  id: z.string(),
});

export const dominationPointByTokenSchema = z.object({
  qrToken: z.string(),
});

export type CreateDominationSessionInput = z.infer<typeof createDominationSessionSchema>;
export type UpdateDominationSessionInput = z.infer<typeof updateDominationSessionSchema>;
export type CreateDominationTeamInput = z.infer<typeof createDominationTeamSchema>;
export type UpdateDominationTeamInput = z.infer<typeof updateDominationTeamSchema>;
export type ReorderDominationTeamsInput = z.infer<typeof reorderDominationTeamsSchema>;
export type CreateDominationPointInput = z.infer<typeof createDominationPointSchema>;
export type UpdateDominationPointInput = z.infer<typeof updateDominationPointSchema>;
export type ReorderDominationPointsInput = z.infer<typeof reorderDominationPointsSchema>;
export type CaptureDominationPointInput = z.infer<typeof captureDominationPointSchema>;
export type DominationSessionByIdInput = z.infer<typeof dominationSessionByIdSchema>;
export type DominationPointByTokenInput = z.infer<typeof dominationPointByTokenSchema>;
export type SetScoringEnabledInput = z.infer<typeof setScoringEnabledSchema>;
