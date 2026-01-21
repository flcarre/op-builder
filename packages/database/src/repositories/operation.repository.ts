import { prisma } from '../index';
import type { Operation, OperationTeam, Prisma } from '@prisma/client';

type OperationWithTeams = Operation & {
  operationTeams: (OperationTeam & { team: { id: string; name: string; slug: string; color: string } })[];
  creatorTeam: { id: string; name: string; slug: string; color: string };
  camps?: { id: string; name: string; color: string }[];
};

export const operationRepository = {
  async createOperation(
    data: Prisma.OperationCreateInput
  ): Promise<Operation> {
    return prisma.operation.create({ data });
  },

  async findOperationById(
    id: string
  ): Promise<OperationWithTeams | null> {
    return prisma.operation.findUnique({
      where: { id },
      include: {
        operationTeams: {
          include: {
            team: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        creatorTeam: {
          select: { id: true, name: true, slug: true, color: true },
        },
        camps: {
          select: { id: true, name: true, color: true },
        },
      },
    });
  },

  async findOperationsByCreatorTeam(
    teamId: string
  ): Promise<OperationWithTeams[]> {
    return prisma.operation.findMany({
      where: { creatorTeamId: teamId },
      include: {
        operationTeams: {
          include: {
            team: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        creatorTeam: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  async findOperationsByTeam(
    teamId: string
  ): Promise<OperationWithTeams[]> {
    return prisma.operation.findMany({
      where: {
        OR: [
          { creatorTeamId: teamId },
          { operationTeams: { some: { teamId } } },
        ],
      },
      include: {
        operationTeams: {
          include: {
            team: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        creatorTeam: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  async updateOperation(
    id: string,
    data: Prisma.OperationUpdateInput
  ): Promise<Operation> {
    return prisma.operation.update({ where: { id }, data });
  },

  async deleteOperation(id: string): Promise<Operation> {
    return prisma.operation.delete({ where: { id } });
  },

  async inviteTeamToOperation(
    data: Prisma.OperationTeamCreateInput
  ): Promise<OperationTeam> {
    return prisma.operationTeam.create({ data });
  },

  async findOperationTeam(
    operationId: string,
    teamId: string
  ): Promise<OperationTeam | null> {
    return prisma.operationTeam.findUnique({
      where: {
        operationId_teamId: { operationId, teamId },
      },
    });
  },

  async updateOperationTeam(
    id: string,
    data: Prisma.OperationTeamUpdateInput
  ): Promise<OperationTeam> {
    return prisma.operationTeam.update({ where: { id }, data });
  },

  async removeTeamFromOperation(id: string): Promise<OperationTeam> {
    return prisma.operationTeam.delete({ where: { id } });
  },

  async getOperationTeamsByOperation(
    operationId: string
  ): Promise<OperationTeam[]> {
    return prisma.operationTeam.findMany({
      where: { operationId },
      include: {
        team: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });
  },
};
