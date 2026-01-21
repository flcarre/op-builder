import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  createCampSchema,
  updateCampSchema,
  assignTeamToCampSchema,
  updateCampOrderSchema,
} from '@crafted/validators';
import {
  createCamp,
  getCampById,
  getCampsByOperation,
  updateCamp,
  deleteCamp,
  assignTeamToCamp,
  removeTeamFromCamp,
  updateCampOrder,
} from '@crafted/services';

export const campRouter = router({
  create: protectedProcedure
    .input(
      createCampSchema.extend({
        operationId: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { operationId, teamId, ...campData } = input;
      return createCamp(operationId, teamId, campData);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .query(({ input }) => getCampById(input.id, input.teamId)),

  getByOperation: protectedProcedure
    .input(z.object({ operationId: z.string(), teamId: z.string() }))
    .query(({ input }) => getCampsByOperation(input.operationId, input.teamId)),

  update: protectedProcedure
    .input(
      updateCampSchema.extend({
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { teamId, ...campData } = input;
      return updateCamp(teamId, campData);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string() }))
    .mutation(({ input }) => deleteCamp(input.id, input.teamId)),

  assignTeam: protectedProcedure
    .input(
      assignTeamToCampSchema.extend({
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { teamId, ...assignData } = input;
      return assignTeamToCamp(teamId, assignData);
    }),

  removeTeam: protectedProcedure
    .input(z.object({ campTeamId: z.string(), teamId: z.string() }))
    .mutation(({ input }) => removeTeamFromCamp(input.campTeamId, input.teamId)),

  updateOrder: protectedProcedure
    .input(
      updateCampOrderSchema.extend({
        operationId: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { operationId, teamId, camps } = input;
      return updateCampOrder(operationId, teamId, { camps });
    }),
});
