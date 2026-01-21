import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  createObjectiveSchema,
  updateObjectiveSchema,
  updateObjectiveOrderSchema,
  duplicateObjectiveSchema,
  attemptPhysicalCodeSchema,
  scanVipSchema,
  startSabotageSchema,
  completeSabotageSchema,
  startGPSCaptureSchema,
  completeGPSCaptureSchema,
  getEnigmaSchema,
  answerEnigmaSchema,
  scanQrSimpleSchema,
  collectItemSchema,
  getCollectionProgressSchema,
  getCurrentStepSchema,
  answerStepSchema,
  startDefenseSchema,
  completeDefenseSchema,
  decodeMorseSchema,
  startTimeRaceSchema,
  validateCheckpointSchema,
  checkConditionSchema,
  startAntennaHackSchema,
  completeAntennaHackSchema,
} from '@crafted/validators';
import {
  createObjective,
  getObjectiveById,
  getObjectivesByOperation,
  updateObjective,
  deleteObjective,
  updateObjectiveOrder,
  duplicateObjective,
  regenerateObjectiveQRCode,
  regenerateAllObjectiveQRCodes,
  generateObjectiveQRCode,
  attemptPhysicalCode,
  scanVip,
  startSabotage,
  completeSabotage,
  startGPSCapture,
  completeGPSCapture,
  getEnigma,
  answerEnigma,
  scanQrSimple,
  collectItem,
  getCollectionProgress,
  getCurrentStep,
  answerStep,
  startDefense,
  completeDefense,
  decodeMorse,
  startTimeRace,
  validateCheckpoint,
  checkCondition,
  startAntennaHack,
  completeAntennaHack,
} from '@crafted/services';

export const objectiveRouter = router({
  create: protectedProcedure
    .input(
      createObjectiveSchema.extend({
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { teamId, ...objectiveData } = input;
      return createObjective(teamId, objectiveData);
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        teamId: z.string(),
      })
    )
    .query(({ input }) => getObjectiveById(input.teamId, input.id)),

  getByOperation: protectedProcedure
    .input(
      z.object({
        operationId: z.string(),
        teamId: z.string(),
      })
    )
    .query(({ input }) =>
      getObjectivesByOperation(input.teamId, input.operationId)
    ),

  update: protectedProcedure
    .input(
      updateObjectiveSchema.extend({
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { teamId, ...updateData } = input;
      return updateObjective(teamId, updateData);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => deleteObjective(input.teamId, input.id)),

  updateOrder: protectedProcedure
    .input(
      updateObjectiveOrderSchema.extend({
        operationId: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { operationId, teamId, ...orderData } = input;
      return updateObjectiveOrder(teamId, operationId, orderData);
    }),

  duplicate: protectedProcedure
    .input(
      duplicateObjectiveSchema.extend({
        teamId: z.string(),
      })
    )
    .mutation(({ input }) => duplicateObjective(input.teamId, input.id)),

  getObjectiveQRCode: protectedProcedure
    .input(z.object({ token: z.string(), baseUrl: z.string() }))
    .query(({ input }) => generateObjectiveQRCode(input.token, input.baseUrl)),

  regenerateQRCode: protectedProcedure
    .input(
      z.object({
        objectiveId: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(({ input }) =>
      regenerateObjectiveQRCode(input.teamId, input.objectiveId)
    ),

  regenerateAllQRCodes: protectedProcedure
    .input(
      z.object({
        operationId: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(({ input }) =>
      regenerateAllObjectiveQRCodes(input.teamId, input.operationId)
    ),

  attemptPhysicalCode: protectedProcedure
    .input(attemptPhysicalCodeSchema)
    .mutation(({ input }) => attemptPhysicalCode(input)),

  scanVip: protectedProcedure
    .input(scanVipSchema)
    .mutation(({ input }) => scanVip(input)),

  startSabotage: protectedProcedure
    .input(startSabotageSchema)
    .mutation(({ input }) => startSabotage(input)),

  completeSabotage: protectedProcedure
    .input(completeSabotageSchema)
    .mutation(({ input }) => completeSabotage(input)),

  startGPSCapture: protectedProcedure
    .input(startGPSCaptureSchema)
    .mutation(({ input }) => startGPSCapture(input)),

  completeGPSCapture: protectedProcedure
    .input(completeGPSCaptureSchema)
    .mutation(({ input }) => completeGPSCapture(input)),

  getEnigma: protectedProcedure
    .input(getEnigmaSchema)
    .query(({ input }) => getEnigma(input)),

  answerEnigma: protectedProcedure
    .input(answerEnigmaSchema)
    .mutation(({ input }) => answerEnigma(input)),

  scanQrSimple: protectedProcedure
    .input(scanQrSimpleSchema)
    .mutation(({ input }) => scanQrSimple(input)),

  collectItem: protectedProcedure
    .input(collectItemSchema)
    .mutation(({ input }) => collectItem(input)),

  getCollectionProgress: protectedProcedure
    .input(getCollectionProgressSchema)
    .query(({ input }) => getCollectionProgress(input)),

  getCurrentStep: protectedProcedure
    .input(getCurrentStepSchema)
    .query(({ input }) => getCurrentStep(input)),

  answerStep: protectedProcedure
    .input(answerStepSchema)
    .mutation(({ input }) => answerStep(input)),

  startDefense: protectedProcedure
    .input(startDefenseSchema)
    .mutation(({ input }) => startDefense(input)),

  completeDefense: protectedProcedure
    .input(completeDefenseSchema)
    .mutation(({ input }) => completeDefense(input)),

  decodeMorse: protectedProcedure
    .input(decodeMorseSchema)
    .mutation(({ input }) => decodeMorse(input)),

  startTimeRace: protectedProcedure
    .input(startTimeRaceSchema)
    .mutation(({ input }) => startTimeRace(input)),

  validateCheckpoint: protectedProcedure
    .input(validateCheckpointSchema)
    .mutation(({ input }) => validateCheckpoint(input)),

  checkCondition: protectedProcedure
    .input(checkConditionSchema)
    .query(({ input }) => checkCondition(input)),

  startAntennaHack: protectedProcedure
    .input(startAntennaHackSchema)
    .mutation(({ input }) => startAntennaHack(input)),

  completeAntennaHack: protectedProcedure
    .input(completeAntennaHackSchema)
    .mutation(({ input }) => completeAntennaHack(input)),
});
