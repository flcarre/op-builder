import { prisma } from '../index';
import type { Prisma, ObjectiveAttempt } from '@prisma/client';

export const attemptRepository = {
  async createAttempt(
    data: Prisma.ObjectiveAttemptCreateInput
  ): Promise<ObjectiveAttempt> {
    return prisma.objectiveAttempt.create({ data });
  },

  async findAttemptsByObjective(
    objectiveId: string
  ): Promise<ObjectiveAttempt[]> {
    return prisma.objectiveAttempt.findMany({
      where: { objectiveId },
      orderBy: { attemptedAt: 'desc' },
    });
  },

  async findAttemptsByOperationTeam(
    objectiveId: string,
    operationTeamId: string
  ): Promise<ObjectiveAttempt[]> {
    return prisma.objectiveAttempt.findMany({
      where: { objectiveId, operationTeamId },
      orderBy: { attemptedAt: 'desc' },
    });
  },

  async countAttemptsByOperationTeam(
    objectiveId: string,
    operationTeamId: string
  ): Promise<number> {
    return prisma.objectiveAttempt.count({
      where: { objectiveId, operationTeamId },
    });
  },
};
