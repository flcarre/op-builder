import { z } from 'zod';

export const createCampSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  order: z.number().int().min(0).default(0),
});

export const updateCampSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

export const assignTeamToCampSchema = z.object({
  campId: z.string(),
  operationTeamId: z.string(),
});

export const updateCampOrderSchema = z.object({
  camps: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ).min(2).max(4),
});

export type CreateCampInput = z.infer<typeof createCampSchema>;
export type UpdateCampInput = z.infer<typeof updateCampSchema>;
export type AssignTeamToCampInput = z.infer<typeof assignTeamToCampSchema>;
export type UpdateCampOrderInput = z.infer<typeof updateCampOrderSchema>;
