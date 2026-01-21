import { z } from 'zod';

export const objectiveTypeEnum = z.enum([
  'QR_SIMPLE',
  'QR_ENIGMA',
  'GPS_CAPTURE',
  'VIP_ELIMINATION',
  'ITEM_COLLECTION',
  'MULTI_STEP_ENIGMA',
  'POINT_DEFENSE',
  'TIMED_SABOTAGE',
  'CONDITIONAL',
  'MORSE_RADIO',
  'ANTENNA_HACK',
  'NEGOTIATION',
  'RANDOM_POOL',
  'TIME_RACE',
  'LIVE_EVENT',
  'PHYSICAL_CODE',
]);

export const createObjectiveSchema = z.object({
  operationId: z.string(),
  type: objectiveTypeEnum,
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  points: z.number().int().min(0).max(10000).default(100),
  campId: z.string().optional(),
  parentObjectiveId: z.string().optional(),
  config: z.record(z.any()).optional(),
  order: z.number().int().min(0).default(0),
});

export const updateObjectiveSchema = z.object({
  id: z.string(),
  type: objectiveTypeEnum.optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  points: z.number().int().min(0).max(10000).optional(),
  campId: z.string().nullable().optional(),
  parentObjectiveId: z.string().nullable().optional(),
  config: z.record(z.any()).optional(),
});

export const updateObjectiveOrderSchema = z.object({
  objectives: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
      })
    )
    .min(1),
});

export const duplicateObjectiveSchema = z.object({
  id: z.string(),
});

export const physicalCodeConfigSchema = z.object({
  secretCode: z.string().min(1).max(100),
  caseSensitive: z.boolean().default(false),
  maxAttempts: z.number().int().min(1).optional(),
});

export const attemptPhysicalCodeSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  attemptedCode: z.string().min(1).max(100),
});

export const vipEliminationConfigSchema = z.object({
  secretInfo: z.string().min(1).max(2000),
});

export const scanVipSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const timedSabotageConfigSchema = z.object({
  delayMinutes: z.number().int().min(1).max(120),
});

export const startSabotageSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const completeSabotageSchema = z.object({
  sabotageId: z.string(),
});

export const gpsCaptureConfigSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(10).max(1000),
  durationMinutes: z.number().int().min(1).max(120),
});

export const startGPSCaptureSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const completeGPSCaptureSchema = z.object({
  captureId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const qrEnigmaConfigSchema = z.object({
  enigma: z.string().min(1).max(2000),
  answer: z.string().min(1).max(200),
  caseSensitive: z.boolean().default(false),
});

export const getEnigmaSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const answerEnigmaSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  answer: z.string().min(1).max(200),
});

export const scanQrSimpleSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const itemCollectionConfigSchema = z.object({
  itemsRequired: z.number().int().min(1).max(20),
  itemsList: z.string().optional(),
});

export const collectItemSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  itemName: z.string().min(1).max(200),
});

export const getCollectionProgressSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const multiStepEnigmaConfigSchema = z.object({
  stepsCount: z.number().int().min(2).max(10),
  enigmasData: z.string().min(1),
});

export const getCurrentStepSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const answerStepSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  answer: z.string().min(1).max(200),
});

export const pointDefenseConfigSchema = z.object({
  durationMinutes: z.number().int().min(1).max(120),
  radiusMeters: z.number().int().min(10).max(500),
  defenseRules: z.string().optional(),
});

export const startDefenseSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const completeDefenseSchema = z.object({
  defenseId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const morseRadioConfigSchema = z.object({
  message: z.string().min(1).max(200),
  encodedMessage: z.string().optional(),
});

export const decodeMorseSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  decodedMessage: z.string().min(1).max(200),
});

export const timeRaceConfigSchema = z.object({
  timeLimit: z.number().int().min(1).max(180),
  checkpointsCount: z.number().int().min(2).max(20),
});

export const startTimeRaceSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const validateCheckpointSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
  checkpointNumber: z.number().int().min(1),
});

export const conditionalConfigSchema = z.object({
  requiredObjectiveIds: z.array(z.string()).min(1).max(10),
  requireAll: z.boolean().default(true),
  conditionDescription: z.string().optional(),
});

export const checkConditionSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const antennaHackConfigSchema = z.object({
  hackDurationMinutes: z.number().int().min(1).max(60),
  hackInstructions: z.string().optional(),
});

export const startAntennaHackSchema = z.object({
  objectiveId: z.string(),
  operationTeamId: z.string(),
});

export const completeAntennaHackSchema = z.object({
  hackId: z.string(),
});

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;
export type UpdateObjectiveInput = z.infer<typeof updateObjectiveSchema>;
export type UpdateObjectiveOrderInput = z.infer<
  typeof updateObjectiveOrderSchema
>;
export type DuplicateObjectiveInput = z.infer<
  typeof duplicateObjectiveSchema
>;
export type PhysicalCodeConfig = z.infer<typeof physicalCodeConfigSchema>;
export type AttemptPhysicalCodeInput = z.infer<
  typeof attemptPhysicalCodeSchema
>;
export type VipEliminationConfig = z.infer<typeof vipEliminationConfigSchema>;
export type ScanVipInput = z.infer<typeof scanVipSchema>;
export type TimedSabotageConfig = z.infer<typeof timedSabotageConfigSchema>;
export type StartSabotageInput = z.infer<typeof startSabotageSchema>;
export type CompleteSabotageInput = z.infer<typeof completeSabotageSchema>;
export type GPSCaptureConfig = z.infer<typeof gpsCaptureConfigSchema>;
export type StartGPSCaptureInput = z.infer<typeof startGPSCaptureSchema>;
export type CompleteGPSCaptureInput = z.infer<typeof completeGPSCaptureSchema>;
export type QrEnigmaConfig = z.infer<typeof qrEnigmaConfigSchema>;
export type GetEnigmaInput = z.infer<typeof getEnigmaSchema>;
export type AnswerEnigmaInput = z.infer<typeof answerEnigmaSchema>;
export type ScanQrSimpleInput = z.infer<typeof scanQrSimpleSchema>;
export type ItemCollectionConfig = z.infer<typeof itemCollectionConfigSchema>;
export type CollectItemInput = z.infer<typeof collectItemSchema>;
export type GetCollectionProgressInput = z.infer<
  typeof getCollectionProgressSchema
>;
export type MultiStepEnigmaConfig = z.infer<typeof multiStepEnigmaConfigSchema>;
export type GetCurrentStepInput = z.infer<typeof getCurrentStepSchema>;
export type AnswerStepInput = z.infer<typeof answerStepSchema>;
export type PointDefenseConfig = z.infer<typeof pointDefenseConfigSchema>;
export type StartDefenseInput = z.infer<typeof startDefenseSchema>;
export type CompleteDefenseInput = z.infer<typeof completeDefenseSchema>;
export type MorseRadioConfig = z.infer<typeof morseRadioConfigSchema>;
export type DecodeMorseInput = z.infer<typeof decodeMorseSchema>;
export type TimeRaceConfig = z.infer<typeof timeRaceConfigSchema>;
export type StartTimeRaceInput = z.infer<typeof startTimeRaceSchema>;
export type ValidateCheckpointInput = z.infer<typeof validateCheckpointSchema>;
export type ConditionalConfig = z.infer<typeof conditionalConfigSchema>;
export type CheckConditionInput = z.infer<typeof checkConditionSchema>;
export type AntennaHackConfig = z.infer<typeof antennaHackConfigSchema>;
export type StartAntennaHackInput = z.infer<typeof startAntennaHackSchema>;
export type CompleteAntennaHackInput = z.infer<typeof completeAntennaHackSchema>;
