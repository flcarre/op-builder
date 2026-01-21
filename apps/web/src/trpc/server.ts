import { appRouter } from '@crafted/api';

export const api: ReturnType<typeof appRouter.createCaller> = appRouter.createCaller({});
