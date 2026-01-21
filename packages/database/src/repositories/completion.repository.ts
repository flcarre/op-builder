import { prisma } from '../index';
import type { ObjectiveCompletion, Prisma } from '@prisma/client';

type CompletionWithDetails = ObjectiveCompletion & {
  objective: {
    id: string;
    title: string;
    points: number;
    type: string;
  };
  operationTeam: {
    id: string;
    teamId: string;
    team: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  };
};

export const completionRepository = {
  async createCompletion(
    data: Prisma.ObjectiveCompletionCreateInput
  ): Promise<ObjectiveCompletion> {
    return prisma.objectiveCompletion.create({ data });
  },

  async findObjectiveByToken(token: string) {
    return prisma.objective.findUnique({
      where: { qrCodeToken: token },
      include: {
        operation: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        camp: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        parentObjective: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  async checkCompletion(
    objectiveId: string,
    operationTeamId: string
  ): Promise<ObjectiveCompletion | null> {
    return prisma.objectiveCompletion.findUnique({
      where: {
        objectiveId_operationTeamId: {
          objectiveId,
          operationTeamId,
        },
      },
    });
  },

  async findCompletionsByObjective(
    objectiveId: string
  ): Promise<CompletionWithDetails[]> {
    return prisma.objectiveCompletion.findMany({
      where: { objectiveId },
      include: {
        objective: {
          select: {
            id: true,
            title: true,
            points: true,
            type: true,
          },
        },
        operationTeam: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'asc' },
    });
  },

  async findCompletionsByOperationTeam(
    operationTeamId: string
  ): Promise<CompletionWithDetails[]> {
    return prisma.objectiveCompletion.findMany({
      where: { operationTeamId },
      include: {
        objective: {
          select: {
            id: true,
            title: true,
            points: true,
            type: true,
          },
        },
        operationTeam: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  },
};
