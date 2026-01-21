import { z } from 'zod';

export const helloSchema = z.object({
  name: z.string(),
});

export type HelloInput = z.infer<typeof helloSchema>;
