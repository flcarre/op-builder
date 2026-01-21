import { prisma } from '../index';
import type {
  DominationSession,
  DominationTeam,
  DominationPoint,
  DominationCapture,
  DominationScore,
  Prisma,
} from '@prisma/client';

type SessionWithRelations = DominationSession & {
  teams: DominationTeam[];
  points: DominationPoint[];
  scores: DominationScore[];
};

type PointWithCaptures = DominationPoint & {
  captures: DominationCapture[];
};

export const dominationRepository = {
  async createSession(
    data: Prisma.DominationSessionCreateInput
  ): Promise<DominationSession> {
    return prisma.dominationSession.create({ data });
  },

  async findSessionById(id: string): Promise<SessionWithRelations | null> {
    return prisma.dominationSession.findUnique({
      where: { id },
      include: {
        teams: { orderBy: { order: 'asc' } },
        points: { orderBy: { order: 'asc' } },
        scores: true,
      },
    });
  },

  async findAllSessions(): Promise<DominationSession[]> {
    return prisma.dominationSession.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateSession(
    id: string,
    data: Prisma.DominationSessionUpdateInput
  ): Promise<DominationSession> {
    return prisma.dominationSession.update({ where: { id }, data });
  },

  async deleteSession(id: string): Promise<DominationSession> {
    return prisma.dominationSession.delete({ where: { id } });
  },

  async createTeam(
    data: Prisma.DominationTeamCreateInput
  ): Promise<DominationTeam> {
    return prisma.dominationTeam.create({ data });
  },

  async findTeamById(id: string): Promise<DominationTeam | null> {
    return prisma.dominationTeam.findUnique({ where: { id } });
  },

  async updateTeam(
    id: string,
    data: Prisma.DominationTeamUpdateInput
  ): Promise<DominationTeam> {
    return prisma.dominationTeam.update({ where: { id }, data });
  },

  async deleteTeam(id: string): Promise<DominationTeam> {
    return prisma.dominationTeam.delete({ where: { id } });
  },

  async createPoint(
    data: Prisma.DominationPointCreateInput
  ): Promise<DominationPoint> {
    return prisma.dominationPoint.create({ data });
  },

  async findPointById(id: string): Promise<PointWithCaptures | null> {
    return prisma.dominationPoint.findUnique({
      where: { id },
      include: { captures: { orderBy: { capturedAt: 'desc' }, take: 10 } },
    });
  },

  async findPointByToken(qrToken: string): Promise<PointWithCaptures | null> {
    return prisma.dominationPoint.findUnique({
      where: { qrToken },
      include: { captures: { orderBy: { capturedAt: 'desc' }, take: 1 } },
    });
  },

  async updatePoint(
    id: string,
    data: Prisma.DominationPointUpdateInput
  ): Promise<DominationPoint> {
    return prisma.dominationPoint.update({ where: { id }, data });
  },

  async deletePoint(id: string): Promise<DominationPoint> {
    return prisma.dominationPoint.delete({ where: { id } });
  },

  async createCapture(
    data: Prisma.DominationCaptureCreateInput
  ): Promise<DominationCapture> {
    return prisma.dominationCapture.create({ data });
  },

  async findLastCaptureForPoint(
    pointId: string
  ): Promise<DominationCapture | null> {
    return prisma.dominationCapture.findFirst({
      where: { pointId },
      orderBy: { capturedAt: 'desc' },
    });
  },

  async findCapturesBySession(sessionId: string): Promise<DominationCapture[]> {
    return prisma.dominationCapture.findMany({
      where: { sessionId },
      orderBy: { capturedAt: 'desc' },
    });
  },

  async upsertScore(
    sessionId: string,
    teamId: string,
    points: number
  ): Promise<DominationScore> {
    return prisma.dominationScore.upsert({
      where: { sessionId_teamId: { sessionId, teamId } },
      update: { points },
      create: {
        session: { connect: { id: sessionId } },
        team: { connect: { id: teamId } },
        points,
      },
    });
  },

  async incrementScore(
    sessionId: string,
    teamId: string,
    increment: number
  ): Promise<DominationScore> {
    return prisma.dominationScore.upsert({
      where: { sessionId_teamId: { sessionId, teamId } },
      update: { points: { increment } },
      create: {
        session: { connect: { id: sessionId } },
        team: { connect: { id: teamId } },
        points: increment,
      },
    });
  },

  async getScoresBySession(sessionId: string): Promise<DominationScore[]> {
    return prisma.dominationScore.findMany({
      where: { sessionId },
      include: { team: true },
      orderBy: { points: 'desc' },
    });
  },

  async getPointsWithLastCapture(sessionId: string) {
    return prisma.dominationPoint.findMany({
      where: { sessionId },
      include: {
        captures: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
          include: { team: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  },

  async getAllCapturesForSession(sessionId: string) {
    return prisma.dominationCapture.findMany({
      where: { sessionId },
      orderBy: { capturedAt: 'asc' },
      include: { point: true },
    });
  },
};
