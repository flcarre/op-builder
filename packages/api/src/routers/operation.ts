import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  createOperationSchemaBase,
  updateOperationSchemaBase,
  inviteTeamSchema,
  updateTeamRoleSchema,
  acceptInvitationSchema,
} from '@crafted/validators';
import {
  createOperation,
  getOperationById,
  getOperationsByTeam,
  updateOperation,
  deleteOperation,
  inviteTeamToOperation,
  updateTeamRole,
  removeTeamFromOperation,
  acceptInvitation,
  publishOperation,
  startOperation,
  completeOperation,
  cancelOperation,
  reopenOperation,
} from '@crafted/services';

export const operationRouter = router({
  create: protectedProcedure
    .input(
      createOperationSchemaBase.extend({
        teamId: z.string(),
      }).refine((data) => data.endDate > data.date, {
        message: 'End date must be after start date',
        path: ['endDate'],
      })
    )
    .mutation(({ input }) => {
      const { teamId, ...operationData } = input;
      return createOperation(teamId, operationData);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .query(({ input }) => getOperationById(input.id, input.teamId)),

  getByTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(({ input }) => getOperationsByTeam(input.teamId)),

  update: protectedProcedure
    .input(
      updateOperationSchemaBase.extend({
        teamId: z.string(),
      }).refine((data) => {
        if (data.date && data.endDate) {
          return data.endDate > data.date;
        }
        return true;
      }, {
        message: 'End date must be after start date',
        path: ['endDate'],
      })
    )
    .mutation(({ input }) => {
      const { teamId, ...operationData } = input;
      return updateOperation(teamId, operationData);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => deleteOperation(input.teamId, input.id)),

  inviteTeam: protectedProcedure
    .input(
      inviteTeamSchema.extend({
        actingTeamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { actingTeamId, ...inviteData } = input;
      return inviteTeamToOperation(actingTeamId, inviteData);
    }),

  updateTeamRole: protectedProcedure
    .input(
      updateTeamRoleSchema.extend({
        actingTeamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { actingTeamId, ...roleData } = input;
      return updateTeamRole(actingTeamId, roleData);
    }),

  removeTeam: protectedProcedure
    .input(z.object({ id: z.string(), actingTeamId: z.string() }))
    .mutation(({ input }) =>
      removeTeamFromOperation(input.actingTeamId, input.id)
    ),

  acceptInvitation: protectedProcedure
    .input(
      acceptInvitationSchema.extend({
        actingTeamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { actingTeamId, ...invitationData } = input;
      return acceptInvitation(actingTeamId, invitationData);
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => publishOperation(input.teamId, input.id)),

  start: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => startOperation(input.teamId, input.id)),

  complete: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => completeOperation(input.teamId, input.id)),

  cancel: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => cancelOperation(input.teamId, input.id)),

  reopen: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => reopenOperation(input.teamId, input.id)),
});
