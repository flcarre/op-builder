import { prisma } from '../index';
import type { Prisma, Camp, CampTeam } from '@prisma/client';

type CampWithTeams = Camp & {
  campTeams: (CampTeam & {
    operationTeam: {
      id: string;
      teamId: string;
      role: string;
      acceptedAt: Date | null;
      team: {
        id: string;
        name: string;
        slug: string;
        color: string;
      };
    };
  })[];
};

export const campRepository = {
  async createCamp(data: Prisma.CampCreateInput): Promise<Camp> {
    return prisma.camp.create({ data });
  },

  async findCampById(id: string): Promise<CampWithTeams | null> {
    return prisma.camp.findUnique({
      where: { id },
      include: {
        campTeams: {
          include: {
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
        },
      },
    });
  },

  async findCampsByOperation(operationId: string): Promise<CampWithTeams[]> {
    return prisma.camp.findMany({
      where: { operationId },
      include: {
        campTeams: {
          include: {
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
        },
      },
      orderBy: { order: 'asc' },
    });
  },

  async updateCamp(
    id: string,
    data: Prisma.CampUpdateInput
  ): Promise<Camp> {
    return prisma.camp.update({
      where: { id },
      data,
    });
  },

  async deleteCamp(id: string): Promise<Camp> {
    return prisma.camp.delete({ where: { id } });
  },

  async assignTeamToCamp(
    data: Prisma.CampTeamCreateInput
  ): Promise<CampTeam> {
    return prisma.campTeam.create({ data });
  },

  async removeTeamFromCamp(id: string): Promise<CampTeam> {
    return prisma.campTeam.delete({ where: { id } });
  },

  async findCampTeamByOperationTeam(
    operationTeamId: string
  ): Promise<CampTeam | null> {
    return prisma.campTeam.findUnique({
      where: { operationTeamId },
    });
  },

  async updateCampOrder(
    updates: { id: string; order: number }[]
  ): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.camp.update({
          where: { id },
          data: { order },
        })
      )
    );
  },
};
