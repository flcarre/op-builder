import { z } from 'zod';

export const teamMemberRoleEnum = z.enum(['ADMIN', 'CAPTAIN', 'PLAYER']);

export const createTeamSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
});

export const updateTeamSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const addTeamMemberSchema = z.object({
  teamId: z.string(),
  name: z.string().min(2).max(100),
  callsign: z.string().min(2).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: teamMemberRoleEnum.default('PLAYER'),
});

export const updateTeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  callsign: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: teamMemberRoleEnum.optional(),
});

export const transferOwnershipSchema = z.object({
  teamId: z.string(),
  newOwnerId: z.string(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
