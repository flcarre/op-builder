import { z } from 'zod';

const baseCreateOperationSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  date: z.coerce.date(),
  endDate: z.coerce.date(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  coverImageUrl: z.string().url().optional(),
});

export const createOperationSchema = baseCreateOperationSchema.refine(
  (data) => data.endDate > data.date,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const createOperationSchemaBase = baseCreateOperationSchema;

const baseUpdateOperationSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  date: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
});

export const updateOperationSchema = baseUpdateOperationSchema.refine((data) => {
  if (data.date && data.endDate) {
    return data.endDate > data.date;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateOperationSchemaBase = baseUpdateOperationSchema;

export const inviteTeamSchema = z.object({
  operationId: z.string(),
  teamId: z.string(),
  role: z.enum(['CREATOR', 'CO_ADMIN', 'VIEWER']).default('VIEWER'),
});

export const updateTeamRoleSchema = z.object({
  id: z.string(),
  role: z.enum(['CREATOR', 'CO_ADMIN', 'VIEWER']),
});

export const acceptInvitationSchema = z.object({
  operationId: z.string(),
  teamId: z.string(),
});

export const publishOperationSchema = z.object({
  id: z.string(),
});

export const startOperationSchema = z.object({
  id: z.string(),
});

export const completeOperationSchema = z.object({
  id: z.string(),
});

export const cancelOperationSchema = z.object({
  id: z.string(),
});

export const reopenOperationSchema = z.object({
  id: z.string(),
});

export type CreateOperationInput = z.infer<typeof createOperationSchema>;
export type UpdateOperationInput = z.infer<typeof updateOperationSchema>;
export type InviteTeamInput = z.infer<typeof inviteTeamSchema>;
export type UpdateTeamRoleInput = z.infer<typeof updateTeamRoleSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type PublishOperationInput = z.infer<typeof publishOperationSchema>;
export type StartOperationInput = z.infer<typeof startOperationSchema>;
export type CompleteOperationInput = z.infer<typeof completeOperationSchema>;
export type CancelOperationInput = z.infer<typeof cancelOperationSchema>;
export type ReopenOperationInput = z.infer<typeof reopenOperationSchema>;
