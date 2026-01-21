import { prisma } from '../index';
import type { Prisma, Objective } from '@prisma/client';

type ObjectiveWithRelations = Objective & {
  camp: {
    id: string;
    name: string;
    color: string;
  } | null;
  parentObjective: {
    id: string;
    title: string;
  } | null;
  childObjectives: {
    id: string;
    title: string;
  }[];
};

export const objectiveRepository = {
  async createObjective(
    data: Prisma.ObjectiveCreateInput
  ): Promise<Objective> {
    return prisma.objective.create({ data });
  },

  async findObjectiveById(
    id: string
  ): Promise<ObjectiveWithRelations | null> {
    return prisma.objective.findUnique({
      where: { id },
      include: {
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
        childObjectives: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  async findObjectivesByOperation(
    operationId: string
  ): Promise<ObjectiveWithRelations[]> {
    return prisma.objective.findMany({
      where: { operationId },
      include: {
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
        childObjectives: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  },

  async findObjectivesByCamp(
    campId: string
  ): Promise<ObjectiveWithRelations[]> {
    return prisma.objective.findMany({
      where: { campId },
      include: {
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
        childObjectives: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  },

  async updateObjective(
    id: string,
    data: Prisma.ObjectiveUpdateInput
  ): Promise<Objective> {
    return prisma.objective.update({
      where: { id },
      data,
    });
  },

  async deleteObjective(id: string): Promise<Objective> {
    return prisma.objective.delete({ where: { id } });
  },

  async updateObjectiveOrder(
    updates: { id: string; order: number }[]
  ): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.objective.update({
          where: { id },
          data: { order },
        })
      )
    );
  },

  async checkCircularDependency(
    objectiveId: string,
    targetParentId: string
  ): Promise<boolean> {
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === objectiveId) {
        return true;
      }
      if (visited.has(currentId)) {
        return true;
      }
      visited.add(currentId);

      const objective: { parentObjectiveId: string | null } | null =
        await prisma.objective.findUnique({
          where: { id: currentId },
          select: { parentObjectiveId: true },
        });

      currentId = objective?.parentObjectiveId || null;
    }

    return false;
  },
};
