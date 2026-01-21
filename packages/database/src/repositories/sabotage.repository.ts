import { prisma } from '../index';
import type { Prisma, ObjectiveSabotage } from '@prisma/client';

export const sabotageRepository = {
  async createSabotage(
    data: Prisma.ObjectiveSabotageCreateInput
  ): Promise<ObjectiveSabotage> {
    return prisma.objectiveSabotage.create({ data });
  },

  async findSabotageById(id: string): Promise<ObjectiveSabotage | null> {
    return prisma.objectiveSabotage.findUnique({
      where: { id },
    });
  },

  async findActiveSabotage(
    objectiveId: string,
    operationTeamId: string
  ): Promise<ObjectiveSabotage | null> {
    return prisma.objectiveSabotage.findFirst({
      where: {
        objectiveId,
        operationTeamId,
        status: 'PENDING',
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  },

  async findSabotagesByObjective(
    objectiveId: string
  ): Promise<ObjectiveSabotage[]> {
    return prisma.objectiveSabotage.findMany({
      where: { objectiveId },
      orderBy: { startedAt: 'desc' },
    });
  },

  async updateSabotage(
    id: string,
    data: Prisma.ObjectiveSabotageUpdateInput
  ): Promise<ObjectiveSabotage> {
    return prisma.objectiveSabotage.update({
      where: { id },
      data,
    });
  },
};
