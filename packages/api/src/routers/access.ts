import { router, publicProcedure } from '../trpc';
import {
  createAccessPointSchema,
  updateAccessPointSchema,
  accessPointByIdSchema,
  accessPointsBySessionSchema,
  createAccessLevelSchema,
  updateAccessLevelSchema,
  accessLevelByIdSchema,
  accessLevelByTokenSchema,
  validateAccessPasswordSchema,
  createSimpleAccessSchema,
  updateSimpleAccessSchema,
  simpleAccessByIdSchema,
  simpleAccessByTokenSchema,
  validateSimpleAccessPasswordSchema,
} from '@crafted/validators';
import {
  createAccessPoint,
  getAccessPointsBySession,
  updateAccessPoint,
  deleteAccessPoint,
  addAccessLevel,
  updateAccessLevel,
  deleteAccessLevel,
  getAccessLevelByToken,
  validateAccessPassword,
  createSimpleAccess,
  getSimpleAccessesBySession,
  updateSimpleAccess,
  deleteSimpleAccess,
  getSimpleAccessByToken,
  validateSimpleAccessPassword,
} from '@crafted/services';

export const accessRouter = router({
  // ============================================
  // Access Point Operations (Admin)
  // ============================================

  createAccessPoint: publicProcedure
    .input(createAccessPointSchema)
    .mutation(({ input }) => createAccessPoint(input)),

  getAccessPointsBySession: publicProcedure
    .input(accessPointsBySessionSchema)
    .query(({ input }) => getAccessPointsBySession(input.sessionId)),

  updateAccessPoint: publicProcedure
    .input(updateAccessPointSchema)
    .mutation(({ input }) => updateAccessPoint(input)),

  deleteAccessPoint: publicProcedure
    .input(accessPointByIdSchema)
    .mutation(({ input }) => deleteAccessPoint(input.id)),

  // ============================================
  // Access Level Operations (Admin)
  // ============================================

  addAccessLevel: publicProcedure
    .input(createAccessLevelSchema)
    .mutation(({ input }) => addAccessLevel(input)),

  updateAccessLevel: publicProcedure
    .input(updateAccessLevelSchema)
    .mutation(({ input }) => updateAccessLevel(input)),

  deleteAccessLevel: publicProcedure
    .input(accessLevelByIdSchema)
    .mutation(({ input }) => deleteAccessLevel(input.id)),

  // ============================================
  // Player Operations
  // ============================================

  getAccessLevelByToken: publicProcedure
    .input(accessLevelByTokenSchema)
    .query(({ input }) => getAccessLevelByToken(input.qrToken)),

  validateAccessPassword: publicProcedure
    .input(validateAccessPasswordSchema)
    .mutation(({ input }) => validateAccessPassword(input.levelId, input.password)),

  // ============================================
  // Simple Access Operations (Admin)
  // ============================================

  createSimpleAccess: publicProcedure
    .input(createSimpleAccessSchema)
    .mutation(({ input }) => createSimpleAccess(input)),

  getSimpleAccessesBySession: publicProcedure
    .input(accessPointsBySessionSchema)
    .query(({ input }) => getSimpleAccessesBySession(input.sessionId)),

  updateSimpleAccess: publicProcedure
    .input(updateSimpleAccessSchema)
    .mutation(({ input }) => updateSimpleAccess(input)),

  deleteSimpleAccess: publicProcedure
    .input(simpleAccessByIdSchema)
    .mutation(({ input }) => deleteSimpleAccess(input.id)),

  // ============================================
  // Simple Access Player Operations
  // ============================================

  getSimpleAccessByToken: publicProcedure
    .input(simpleAccessByTokenSchema)
    .query(({ input }) => getSimpleAccessByToken(input.qrToken)),

  validateSimpleAccessPassword: publicProcedure
    .input(validateSimpleAccessPasswordSchema)
    .mutation(({ input }) => validateSimpleAccessPassword(input.qrToken, input.password)),
});
