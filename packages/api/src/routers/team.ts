import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  updateTeamMemberSchema,
  transferOwnershipSchema,
} from '@crafted/validators';
import {
  createTeam,
  getTeamById,
  getTeamBySlug,
  getUserTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  transferOwnership,
  generateMemberQRCode,
  regenerateMemberQRCode,
  regenerateAllMemberQRCodes,
} from '@crafted/services';

export const teamRouter = router({
  create: protectedProcedure
    .input(createTeamSchema)
    .mutation(({ ctx, input }) => createTeam(ctx.userId, input)),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getTeamById(input.id)),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getTeamBySlug(input.slug)),

  getUserTeams: protectedProcedure
    .query(({ ctx }) => getUserTeams(ctx.userId)),

  update: protectedProcedure
    .input(updateTeamSchema)
    .mutation(({ ctx, input }) => updateTeam(ctx.userId, input)),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => deleteTeam(ctx.userId, input.id)),

  addMember: protectedProcedure
    .input(addTeamMemberSchema)
    .mutation(({ ctx, input }) => addTeamMember(ctx.userId, input)),

  updateMember: protectedProcedure
    .input(updateTeamMemberSchema)
    .mutation(({ ctx, input }) => updateTeamMember(ctx.userId, input)),

  deleteMember: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => deleteTeamMember(ctx.userId, input.id)),

  transferOwnership: protectedProcedure
    .input(transferOwnershipSchema)
    .mutation(({ ctx, input }) => transferOwnership(ctx.userId, input)),

  getMemberQRCode: protectedProcedure
    .input(z.object({ token: z.string(), baseUrl: z.string() }))
    .query(({ input }) => generateMemberQRCode(input.token, input.baseUrl)),

  regenerateMemberQRCode: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(({ ctx, input }) =>
      regenerateMemberQRCode(ctx.userId, input.memberId)
    ),

  regenerateAllMemberQRCodes: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(({ ctx, input }) =>
      regenerateAllMemberQRCodes(ctx.userId, input.teamId)
    ),
});
