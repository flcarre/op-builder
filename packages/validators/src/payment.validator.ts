import { z } from 'zod';

export const createCheckoutSchema = z.object({
  priceId: z.string(),
  userId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
});

export const getSessionSchema = z.object({
  sessionId: z.string(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type GetSessionInput = z.infer<typeof getSessionSchema>;
