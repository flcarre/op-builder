import { prisma } from '../index';
import type { AccessPoint, AccessLevel, SimpleAccess, Prisma } from '@prisma/client';

type AccessPointWithLevels = AccessPoint & {
  levels: AccessLevel[];
};

type AccessLevelWithPoint = AccessLevel & {
  accessPoint: AccessPointWithLevels;
};

export const accessRepository = {
  // ============================================
  // Access Point Operations
  // ============================================

  async createAccessPoint(
    data: Prisma.AccessPointCreateInput
  ): Promise<AccessPoint> {
    return prisma.accessPoint.create({ data });
  },

  async findAccessPointById(id: string): Promise<AccessPointWithLevels | null> {
    return prisma.accessPoint.findUnique({
      where: { id },
      include: { levels: { orderBy: { level: 'asc' } } },
    });
  },

  async findAccessPointsBySession(
    sessionId: string
  ): Promise<AccessPointWithLevels[]> {
    return prisma.accessPoint.findMany({
      where: { sessionId },
      include: { levels: { orderBy: { level: 'asc' } } },
      orderBy: { order: 'asc' },
    });
  },

  async updateAccessPoint(
    id: string,
    data: Prisma.AccessPointUpdateInput
  ): Promise<AccessPoint> {
    return prisma.accessPoint.update({ where: { id }, data });
  },

  async deleteAccessPoint(id: string): Promise<AccessPoint> {
    return prisma.accessPoint.delete({ where: { id } });
  },

  // ============================================
  // Access Level Operations
  // ============================================

  async createAccessLevel(
    data: Prisma.AccessLevelCreateInput
  ): Promise<AccessLevel> {
    return prisma.accessLevel.create({ data });
  },

  async findAccessLevelById(id: string): Promise<AccessLevel | null> {
    return prisma.accessLevel.findUnique({ where: { id } });
  },

  async findAccessLevelByToken(
    qrToken: string
  ): Promise<AccessLevelWithPoint | null> {
    return prisma.accessLevel.findUnique({
      where: { qrToken },
      include: {
        accessPoint: {
          include: { levels: { orderBy: { level: 'asc' } } },
        },
      },
    });
  },

  async findMaxLevelForPoint(accessPointId: string): Promise<number> {
    const result = await prisma.accessLevel.aggregate({
      where: { accessPointId },
      _max: { level: true },
    });
    return result._max.level ?? 0;
  },

  async updateAccessLevel(
    id: string,
    data: Prisma.AccessLevelUpdateInput
  ): Promise<AccessLevel> {
    return prisma.accessLevel.update({ where: { id }, data });
  },

  async deleteAccessLevel(id: string): Promise<AccessLevel> {
    return prisma.accessLevel.delete({ where: { id } });
  },

  // ============================================
  // Simple Access Operations
  // ============================================

  async createSimpleAccess(
    data: Prisma.SimpleAccessCreateInput
  ): Promise<SimpleAccess> {
    return prisma.simpleAccess.create({ data });
  },

  async findSimpleAccessById(id: string): Promise<SimpleAccess | null> {
    return prisma.simpleAccess.findUnique({ where: { id } });
  },

  async findSimpleAccessByToken(qrToken: string): Promise<SimpleAccess | null> {
    return prisma.simpleAccess.findUnique({
      where: { qrToken },
      include: { session: true },
    });
  },

  async findSimpleAccessesBySession(sessionId: string): Promise<SimpleAccess[]> {
    return prisma.simpleAccess.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
    });
  },

  async updateSimpleAccess(
    id: string,
    data: Prisma.SimpleAccessUpdateInput
  ): Promise<SimpleAccess> {
    return prisma.simpleAccess.update({ where: { id }, data });
  },

  async deleteSimpleAccess(id: string): Promise<SimpleAccess> {
    return prisma.simpleAccess.delete({ where: { id } });
  },
};
