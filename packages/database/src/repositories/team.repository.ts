import { prisma } from '../index';
import type { Team, TeamMember, Prisma } from '@prisma/client';

type TeamWithMembers = Team & { members: TeamMember[] };

export const teamRepository = {
  async createTeam(data: Prisma.TeamCreateInput): Promise<Team> {
    return prisma.team.create({ data });
  },

  async findTeamById(id: string): Promise<TeamWithMembers | null> {
    return prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
  },

  async findTeamBySlug(slug: string): Promise<TeamWithMembers | null> {
    return prisma.team.findUnique({
      where: { slug },
      include: { members: true },
    });
  },

  async findTeamsByOwner(ownerId: string): Promise<TeamWithMembers[]> {
    return prisma.team.findMany({
      where: { ownerId },
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateTeam(
    id: string,
    data: Prisma.TeamUpdateInput
  ): Promise<Team> {
    return prisma.team.update({ where: { id }, data });
  },

  async deleteTeam(id: string): Promise<Team> {
    return prisma.team.delete({ where: { id } });
  },

  async addMember(data: Prisma.TeamMemberCreateInput): Promise<TeamMember> {
    return prisma.teamMember.create({ data });
  },

  async findMemberById(id: string): Promise<TeamMember | null> {
    return prisma.teamMember.findUnique({ where: { id } });
  },

  async updateMember(
    id: string,
    data: Prisma.TeamMemberUpdateInput
  ): Promise<TeamMember> {
    return prisma.teamMember.update({ where: { id }, data });
  },

  async deleteMember(id: string): Promise<TeamMember> {
    return prisma.teamMember.delete({ where: { id } });
  },
};
