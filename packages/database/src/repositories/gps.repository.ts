import { prisma } from '../index';
import type { Prisma, GPSCapture } from '@prisma/client';

export const gpsRepository = {
  async createCapture(
    data: Prisma.GPSCaptureCreateInput
  ): Promise<GPSCapture> {
    return prisma.gPSCapture.create({ data });
  },

  async findCaptureById(id: string): Promise<GPSCapture | null> {
    return prisma.gPSCapture.findUnique({
      where: { id },
    });
  },

  async findActiveCapture(
    objectiveId: string,
    operationTeamId: string
  ): Promise<GPSCapture | null> {
    return prisma.gPSCapture.findFirst({
      where: {
        objectiveId,
        operationTeamId,
        status: 'IN_PROGRESS',
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  },

  async findCapturesByObjective(
    objectiveId: string
  ): Promise<GPSCapture[]> {
    return prisma.gPSCapture.findMany({
      where: { objectiveId },
      orderBy: { startedAt: 'desc' },
    });
  },

  async updateCapture(
    id: string,
    data: Prisma.GPSCaptureUpdateInput
  ): Promise<GPSCapture> {
    return prisma.gPSCapture.update({
      where: { id },
      data,
    });
  },
};
