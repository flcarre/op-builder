import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@crafted/api';

export const api: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();
