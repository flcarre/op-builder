import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;

export * from '@prisma/client';
export * from './repositories/team.repository';
export * from './repositories/operation.repository';
export * from './repositories/camp.repository';
export * from './repositories/objective.repository';
export * from './repositories/checkin.repository';
export * from './repositories/completion.repository';
export * from './repositories/attempt.repository';
export * from './repositories/sabotage.repository';
export * from './repositories/gps.repository';
export * from './repositories/domination.repository';
