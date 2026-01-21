import { z } from 'zod';

export const createCheckInSchema = z.object({
  token: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  deviceInfo: z.string().max(500).optional(),
});

export const getMemberByTokenSchema = z.object({
  token: z.string().min(1),
});

export const getCheckInsSchema = z.object({
  memberId: z.string(),
});

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type GetMemberByTokenInput = z.infer<typeof getMemberByTokenSchema>;
export type GetCheckInsInput = z.infer<typeof getCheckInsSchema>;
