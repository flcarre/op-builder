import { router, publicProcedure } from '../trpc';
import {
  createDominationSessionSchema,
  updateDominationSessionSchema,
  createDominationTeamSchema,
  updateDominationTeamSchema,
  createDominationPointSchema,
  updateDominationPointSchema,
  captureDominationPointSchema,
  dominationSessionByIdSchema,
  dominationPointByTokenSchema,
  setScoringEnabledSchema,
} from '@crafted/validators';
import {
  createDominationSession,
  getDominationSessionById,
  getAllDominationSessions,
  updateDominationSession,
  deleteDominationSession,
  startDominationSession,
  pauseDominationSession,
  resumeDominationSession,
  endDominationSession,
  setScoringEnabled,
  createDominationTeam,
  updateDominationTeam,
  deleteDominationTeam,
  createDominationPoint,
  updateDominationPoint,
  deleteDominationPoint,
  getDominationPointByToken,
  captureDominationPoint,
  getDominationSessionScores,
  getDominationSessionState,
  calculateAndUpdateDominationScores,
  checkAndEndExpiredSession,
} from '@crafted/services';

export const dominationRouter = router({
  createSession: publicProcedure
    .input(createDominationSessionSchema)
    .mutation(({ input }) => createDominationSession(input)),

  getSession: publicProcedure
    .input(dominationSessionByIdSchema)
    .query(({ input }) => getDominationSessionById(input.id)),

  getAllSessions: publicProcedure.query(() => getAllDominationSessions()),

  updateSession: publicProcedure
    .input(updateDominationSessionSchema)
    .mutation(({ input }) => updateDominationSession(input)),

  deleteSession: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => deleteDominationSession(input.id)),

  startSession: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => startDominationSession(input.id)),

  pauseSession: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => pauseDominationSession(input.id)),

  resumeSession: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => resumeDominationSession(input.id)),

  endSession: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => endDominationSession(input.id)),

  setScoringEnabled: publicProcedure
    .input(setScoringEnabledSchema)
    .mutation(({ input }) => setScoringEnabled(input.id, input.enabled)),

  createTeam: publicProcedure
    .input(createDominationTeamSchema)
    .mutation(({ input }) => createDominationTeam(input)),

  updateTeam: publicProcedure
    .input(updateDominationTeamSchema)
    .mutation(({ input }) => updateDominationTeam(input)),

  deleteTeam: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => deleteDominationTeam(input.id)),

  createPoint: publicProcedure
    .input(createDominationPointSchema)
    .mutation(({ input }) => createDominationPoint(input)),

  updatePoint: publicProcedure
    .input(updateDominationPointSchema)
    .mutation(({ input }) => updateDominationPoint(input)),

  deletePoint: publicProcedure
    .input(dominationSessionByIdSchema)
    .mutation(({ input }) => deleteDominationPoint(input.id)),

  getPointByToken: publicProcedure
    .input(dominationPointByTokenSchema)
    .query(({ input }) => getDominationPointByToken(input.qrToken)),

  capturePoint: publicProcedure
    .input(captureDominationPointSchema)
    .mutation(({ input }) => captureDominationPoint(input)),

  getScores: publicProcedure
    .input(dominationSessionByIdSchema)
    .query(({ input }) => getDominationSessionScores(input.id)),

  getState: publicProcedure
    .input(dominationSessionByIdSchema)
    .query(async ({ input }) => {
      await checkAndEndExpiredSession(input.id);
      await calculateAndUpdateDominationScores(input.id);
      return getDominationSessionState(input.id);
    }),
});
