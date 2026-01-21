import { prisma } from '../index';
import type { CheckIn, Prisma } from '@prisma/client';

type CheckInWithMember = CheckIn & {
  member: {
    id: string;
    name: string;
    callsign: string;
    teamId: string;
    team: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  };
};

export const checkinRepository = {
  async createCheckIn(
    data: Prisma.CheckInCreateInput
  ): Promise<CheckIn> {
    return prisma.checkIn.create({ data });
  },

  async findMemberByToken(token: string) {
    return prisma.teamMember.findUnique({
      where: { qrCodeToken: token },
      include: {
        team: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });
  },

  async findCheckInsByMember(
    memberId: string
  ): Promise<CheckInWithMember[]> {
    return prisma.checkIn.findMany({
      where: { memberId },
      include: {
        member: {
          include: {
            team: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });
  },

  async findLatestCheckIn(
    memberId: string
  ): Promise<CheckInWithMember | null> {
    return prisma.checkIn.findFirst({
      where: { memberId },
      include: {
        member: {
          include: {
            team: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
      orderBy: { checkedInAt: 'desc' },
    });
  },
};
