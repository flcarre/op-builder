import {
  objectiveRepository,
  operationRepository,
  attemptRepository,
  completionRepository,
  sabotageRepository,
  gpsRepository,
} from '@crafted/database';
import type {
  CreateObjectiveInput,
  UpdateObjectiveInput,
  UpdateObjectiveOrderInput,
  AttemptPhysicalCodeInput,
  PhysicalCodeConfig,
  ScanVipInput,
  VipEliminationConfig,
  StartSabotageInput,
  CompleteSabotageInput,
  TimedSabotageConfig,
  GPSCaptureConfig,
  StartGPSCaptureInput,
  CompleteGPSCaptureInput,
  GetEnigmaInput,
  AnswerEnigmaInput,
  ScanQrSimpleInput,
  CollectItemInput,
  GetCollectionProgressInput,
  GetCurrentStepInput,
  AnswerStepInput,
  StartDefenseInput,
  CompleteDefenseInput,
  DecodeMorseInput,
  StartTimeRaceInput,
  ValidateCheckpointInput,
  CheckConditionInput,
  ConditionalConfig,
  StartAntennaHackInput,
  CompleteAntennaHackInput,
  AntennaHackConfig,
} from '@crafted/validators';
import { randomBytes } from 'crypto';

async function checkOperationPermission(
  operationId: string,
  teamId: string
): Promise<void> {
  const operation = await operationRepository.findOperationById(operationId);
  if (!operation) {
    throw new Error('Operation not found');
  }

  const operationTeam = operation.operationTeams.find(
    (ot) => ot.teamId === teamId
  );

  if (!operationTeam) {
    throw new Error('Unauthorized: Team not part of this operation');
  }

  const isAdmin =
    operationTeam.role === 'CREATOR' || operationTeam.role === 'CO_ADMIN';
  if (!isAdmin) {
    throw new Error('Unauthorized: Only creators and co-admins can manage');
  }
}

export async function createObjective(
  teamId: string,
  input: CreateObjectiveInput
) {
  await checkOperationPermission(input.operationId, teamId);

  if (input.parentObjectiveId) {
    const parentObjective = await objectiveRepository.findObjectiveById(
      input.parentObjectiveId
    );
    if (
      !parentObjective ||
      parentObjective.operationId !== input.operationId
    ) {
      throw new Error('Parent objective not found in this operation');
    }
  }

  const { operationId, campId, parentObjectiveId, ...objectiveData } = input;

  return objectiveRepository.createObjective({
    ...objectiveData,
    operation: { connect: { id: operationId } },
    camp: campId ? { connect: { id: campId } } : undefined,
    parentObjective: parentObjectiveId
      ? { connect: { id: parentObjectiveId } }
      : undefined,
  });
}

export async function getObjectiveById(
  teamId: string,
  objectiveId: string
) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objective not found');
  }

  await checkOperationPermission(objective.operationId, teamId);
  return objective;
}

export async function getObjectivesByOperation(
  teamId: string,
  operationId: string
) {
  await checkOperationPermission(operationId, teamId);
  return objectiveRepository.findObjectivesByOperation(operationId);
}

export async function updateObjective(
  teamId: string,
  input: UpdateObjectiveInput
) {
  const objective = await objectiveRepository.findObjectiveById(input.id);
  if (!objective) {
    throw new Error('Objective not found');
  }

  await checkOperationPermission(objective.operationId, teamId);

  if (input.parentObjectiveId !== undefined) {
    if (input.parentObjectiveId) {
      const isCircular = await objectiveRepository.checkCircularDependency(
        input.id,
        input.parentObjectiveId
      );
      if (isCircular) {
        throw new Error('Circular dependency detected');
      }
    }
  }

  const { id, campId, parentObjectiveId, ...updateData } = input;
  return objectiveRepository.updateObjective(id, {
    ...updateData,
    camp:
      campId !== undefined
        ? campId
          ? { connect: { id: campId } }
          : { disconnect: true }
        : undefined,
    parentObjective:
      parentObjectiveId !== undefined
        ? parentObjectiveId
          ? { connect: { id: parentObjectiveId } }
          : { disconnect: true }
        : undefined,
  });
}

export async function deleteObjective(teamId: string, objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objective not found');
  }

  await checkOperationPermission(objective.operationId, teamId);
  return objectiveRepository.deleteObjective(objectiveId);
}

export async function updateObjectiveOrder(
  teamId: string,
  operationId: string,
  input: UpdateObjectiveOrderInput
) {
  await checkOperationPermission(operationId, teamId);

  for (const { id } of input.objectives) {
    const objective = await objectiveRepository.findObjectiveById(id);
    if (!objective || objective.operationId !== operationId) {
      throw new Error('Invalid objective in operation');
    }
  }

  await objectiveRepository.updateObjectiveOrder(input.objectives);
}

export async function duplicateObjective(
  teamId: string,
  objectiveId: string
) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objective not found');
  }

  await checkOperationPermission(objective.operationId, teamId);

  const existingObjectives =
    await objectiveRepository.findObjectivesByOperation(
      objective.operationId
    );
  const maxOrder = Math.max(...existingObjectives.map((o) => o.order), -1);

  return objectiveRepository.createObjective({
    type: objective.type,
    title: `${objective.title} (Copy)`,
    description: objective.description,
    points: objective.points,
    order: maxOrder + 1,
    config: objective.config !== null ? objective.config : undefined,
    qrCodeToken: randomBytes(32).toString('hex'),
    operation: { connect: { id: objective.operationId } },
    camp: objective.campId
      ? { connect: { id: objective.campId } }
      : undefined,
  });
}

export async function regenerateObjectiveQRCode(
  teamId: string,
  objectiveId: string
) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objective not found');
  }

  await checkOperationPermission(objective.operationId, teamId);

  const newToken = randomBytes(32).toString('hex');
  return objectiveRepository.updateObjective(objectiveId, {
    qrCodeToken: newToken,
  });
}

export async function regenerateAllObjectiveQRCodes(
  teamId: string,
  operationId: string
) {
  await checkOperationPermission(operationId, teamId);

  const objectives = await objectiveRepository.findObjectivesByOperation(
    operationId
  );

  const updates = objectives.map((objective) => {
    const newToken = randomBytes(32).toString('hex');
    return objectiveRepository.updateObjective(objective.id, {
      qrCodeToken: newToken,
    });
  });

  return Promise.all(updates);
}

async function validatePhysicalCodeObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  if (objective.type !== 'PHYSICAL_CODE') {
    throw new Error("Cet objectif n'est pas de type Code Physique");
  }

  const config = objective.config as PhysicalCodeConfig;
  if (!config || !config.secretCode) {
    throw new Error('Configuration de l\'objectif invalide');
  }

  return config;
}

async function checkAttemptEligibility(
  objectiveId: string,
  operationTeamId: string,
  maxAttempts?: number
) {
  const existingCompletion = await completionRepository.checkCompletion(
    objectiveId,
    operationTeamId
  );
  if (existingCompletion) {
    throw new Error('Objectif déjà complété');
  }

  if (maxAttempts) {
    const attemptCount = await attemptRepository.countAttemptsByOperationTeam(
      objectiveId,
      operationTeamId
    );
    if (attemptCount >= maxAttempts) {
      throw new Error('Nombre maximum de tentatives atteint');
    }
  }
}

function isCodeCorrect(
  attemptedCode: string,
  config: PhysicalCodeConfig
): boolean {
  return config.caseSensitive
    ? attemptedCode === config.secretCode
    : attemptedCode.toLowerCase() === config.secretCode.toLowerCase();
}

export async function attemptPhysicalCode(input: AttemptPhysicalCodeInput) {
  const config = await validatePhysicalCodeObjective(input.objectiveId);

  await checkAttemptEligibility(
    input.objectiveId,
    input.operationTeamId,
    config.maxAttempts
  );

  const isCorrect = isCodeCorrect(input.attemptedCode, config);

  const attempt = await attemptRepository.createAttempt({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    attemptedCode: input.attemptedCode,
    success: isCorrect,
  });

  if (isCorrect) {
    const completion = await completionRepository.createCompletion({
      objective: { connect: { id: input.objectiveId } },
      operationTeam: { connect: { id: input.operationTeamId } },
    });

    return {
      attempt,
      completion,
      success: true,
    };
  }

  return {
    attempt,
    completion: null,
    success: false,
  };
}

async function validateVipObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  if (objective.type !== 'VIP_ELIMINATION') {
    throw new Error("Cet objectif n'est pas de type VIP");
  }

  const config = objective.config as VipEliminationConfig;
  if (!config || !config.secretInfo) {
    throw new Error('Configuration de l\'objectif invalide');
  }

  return config;
}

export async function scanVip(input: ScanVipInput) {
  const config = await validateVipObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('VIP déjà scanné par cette équipe');
  }

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
  });

  return {
    completion,
    secretInfo: config.secretInfo,
  };
}

async function validateSabotageObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  if (objective.type !== 'TIMED_SABOTAGE') {
    throw new Error("Cet objectif n'est pas de type Sabotage Temporisé");
  }

  const config = objective.config as TimedSabotageConfig;
  if (!config || !config.delayMinutes) {
    throw new Error('Configuration de l\'objectif invalide');
  }

  return config;
}

export async function startSabotage(input: StartSabotageInput) {
  const config = await validateSabotageObjective(input.objectiveId);

  const existingSabotage = await sabotageRepository.findActiveSabotage(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingSabotage) {
    throw new Error('Un sabotage est déjà en cours pour cette équipe');
  }

  const sabotage = await sabotageRepository.createSabotage({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    status: 'PENDING',
  });

  return {
    sabotage,
    delayMinutes: config.delayMinutes,
  };
}

export async function completeSabotage(input: CompleteSabotageInput) {
  const sabotage = await sabotageRepository.findSabotageById(input.sabotageId);

  if (!sabotage) {
    throw new Error('Sabotage non trouvé');
  }

  if (sabotage.status !== 'PENDING') {
    throw new Error('Ce sabotage n\'est plus en attente');
  }

  const objective = await objectiveRepository.findObjectiveById(
    sabotage.objectiveId
  );
  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  const config = objective.config as TimedSabotageConfig;
  const elapsedMinutes =
    (Date.now() - sabotage.startedAt.getTime()) / 1000 / 60;

  if (elapsedMinutes < config.delayMinutes) {
    throw new Error(
      `Le délai n'est pas encore écoulé. Temps restant: ${Math.ceil(config.delayMinutes - elapsedMinutes)} minutes`
    );
  }

  const updatedSabotage = await sabotageRepository.updateSabotage(
    input.sabotageId,
    {
      status: 'COMPLETED',
      completedAt: new Date(),
    }
  );

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: sabotage.objectiveId } },
    operationTeam: { connect: { id: sabotage.operationTeamId } },
  });

  return {
    sabotage: updatedSabotage,
    completion,
  };
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function validateGPSObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);
  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  if (objective.type !== 'GPS_CAPTURE') {
    throw new Error("Cet objectif n'est pas de type Capture GPS");
  }

  const config = objective.config as GPSCaptureConfig;
  if (!config || !config.latitude || !config.longitude) {
    throw new Error('Configuration de l\'objectif invalide');
  }

  return config;
}

export async function startGPSCapture(input: StartGPSCaptureInput) {
  const config = await validateGPSObjective(input.objectiveId);

  const distance = calculateDistance(
    input.latitude,
    input.longitude,
    config.latitude,
    config.longitude
  );

  if (distance > config.radiusMeters) {
    throw new Error(
      `Vous êtes trop loin de la zone (${Math.round(distance)}m). Distance max: ${config.radiusMeters}m`
    );
  }

  const existingCapture = await gpsRepository.findActiveCapture(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCapture) {
    throw new Error('Une capture est déjà en cours pour cette équipe');
  }

  const capture = await gpsRepository.createCapture({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    startLatitude: input.latitude,
    startLongitude: input.longitude,
    status: 'IN_PROGRESS',
  });

  return {
    capture,
    durationMinutes: config.durationMinutes,
    radiusMeters: config.radiusMeters,
  };
}

export async function completeGPSCapture(input: CompleteGPSCaptureInput) {
  const capture = await gpsRepository.findCaptureById(input.captureId);

  if (!capture) {
    throw new Error('Capture non trouvée');
  }

  if (capture.status !== 'IN_PROGRESS') {
    throw new Error("Cette capture n'est plus en cours");
  }

  const objective = await objectiveRepository.findObjectiveById(
    capture.objectiveId
  );
  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  const config = objective.config as GPSCaptureConfig;
  const elapsedMinutes =
    (Date.now() - capture.startedAt.getTime()) / 1000 / 60;

  if (elapsedMinutes < config.durationMinutes) {
    throw new Error(
      `La durée requise n'est pas atteinte. Temps restant: ${Math.ceil(config.durationMinutes - elapsedMinutes)} minutes`
    );
  }

  const distance = calculateDistance(
    input.latitude,
    input.longitude,
    config.latitude,
    config.longitude
  );

  if (distance > config.radiusMeters) {
    throw new Error(
      `Vous êtes sorti de la zone (${Math.round(distance)}m). Capture abandonnée`
    );
  }

  const updatedCapture = await gpsRepository.updateCapture(input.captureId, {
    status: 'COMPLETED',
    completedAt: new Date(),
  });

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: capture.objectiveId } },
    operationTeam: { connect: { id: capture.operationTeamId } },
  });

  return {
    capture: updatedCapture,
    completion,
  };
}

async function validateQrEnigmaObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouvé');
  }

  if (objective.type !== 'QR_ENIGMA') {
    throw new Error("Cet objectif n'est pas de type QR Énigme");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error("Configuration de l'énigme manquante");
  }

  const config = objective.config as Record<string, unknown>;

  if (!config.enigma || typeof config.enigma !== 'string') {
    throw new Error("Texte de l'énigme manquant");
  }

  if (!config.answer || typeof config.answer !== 'string') {
    throw new Error("Réponse de l'énigme manquante");
  }

  return {
    enigma: config.enigma as string,
    answer: config.answer as string,
    caseSensitive: config.caseSensitive === true,
  };
}

export async function getEnigma(input: GetEnigmaInput) {
  const config = await validateQrEnigmaObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Enigme deja resolue par cette equipe');
  }

  return {
    enigma: config.enigma,
    objectiveId: input.objectiveId,
  };
}

export async function answerEnigma(input: AnswerEnigmaInput) {
  const config = await validateQrEnigmaObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Enigme deja resolue par cette equipe');
  }

  const userAnswer = config.caseSensitive
    ? input.answer
    : input.answer.toLowerCase();

  const correctAnswer = config.caseSensitive
    ? config.answer
    : config.answer.toLowerCase();

  const isCorrect = userAnswer === correctAnswer;

  if (!isCorrect) {
    throw new Error('Réponse incorrecte');
  }

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
  });

  return {
    completion,
    correct: true,
  };
}

export async function scanQrSimple(input: ScanQrSimpleInput) {
  const objective = await objectiveRepository.findObjectiveById(
    input.objectiveId
  );

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'QR_SIMPLE') {
    throw new Error("Cet objectif n'est pas de type QR Simple");
  }

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('QR code deja scanne par cette equipe');
  }

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
  });

  return {
    completion,
    points: objective.points,
  };
}

async function validateItemCollectionObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'ITEM_COLLECTION') {
    throw new Error("Cet objectif n'est pas de type Collecte d'Items");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration de la collecte manquante');
  }

  const config = objective.config as Record<string, unknown>;

  if (
    !config.itemsRequired ||
    typeof config.itemsRequired !== 'number' ||
    config.itemsRequired < 1
  ) {
    throw new Error('Nombre d items requis invalide');
  }

  const itemsList = config.itemsList
    ? String(config.itemsList)
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];

  return {
    itemsRequired: config.itemsRequired as number,
    itemsList,
    points: objective.points,
  };
}

export async function collectItem(input: CollectItemInput) {
  const config = await validateItemCollectionObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Objectif deja complete par cette equipe');
  }

  if (config.itemsList.length > 0) {
    const normalizedItemName = input.itemName.trim().toLowerCase();
    const validItems = config.itemsList.map((item) =>
      item.toLowerCase()
    );

    if (!validItems.includes(normalizedItemName)) {
      throw new Error('Cet item ne fait pas partie de la liste');
    }
  }

  const existingAttempts =
    await attemptRepository.findAttemptsByOperationTeam(
      input.objectiveId,
      input.operationTeamId
    );

  const collectedItems = existingAttempts
    .filter((attempt) => attempt.success)
    .map((attempt) => attempt.attemptedCode.trim().toLowerCase());

  const normalizedInput = input.itemName.trim().toLowerCase();

  if (collectedItems.includes(normalizedInput)) {
    throw new Error('Cet item a deja ete collecte');
  }

  await attemptRepository.createAttempt({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    attemptedCode: input.itemName.trim(),
    success: true,
    attemptedAt: new Date(),
  });

  const totalCollected = collectedItems.length + 1;

  let completion = null;
  if (totalCollected >= config.itemsRequired) {
    completion = await completionRepository.createCompletion({
      objective: { connect: { id: input.objectiveId } },
      operationTeam: { connect: { id: input.operationTeamId } },
    });
  }

  return {
    itemCollected: input.itemName.trim(),
    itemsCollected: totalCollected,
    itemsRequired: config.itemsRequired,
    completed: totalCollected >= config.itemsRequired,
    completion,
    points: completion ? config.points : 0,
  };
}

export async function getCollectionProgress(
  input: GetCollectionProgressInput
) {
  const config = await validateItemCollectionObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    return {
      completed: true,
      itemsCollected: config.itemsRequired,
      itemsRequired: config.itemsRequired,
      collectedItemNames: [],
      completion: existingCompletion,
    };
  }

  const existingAttempts =
    await attemptRepository.findAttemptsByOperationTeam(
      input.objectiveId,
      input.operationTeamId
    );

  const collectedItemNames = existingAttempts
    .filter((attempt) => attempt.success)
    .map((attempt) => attempt.attemptedCode);

  return {
    completed: false,
    itemsCollected: collectedItemNames.length,
    itemsRequired: config.itemsRequired,
    collectedItemNames,
    completion: null,
  };
}

async function validateMultiStepEnigmaObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'MULTI_STEP_ENIGMA') {
    throw new Error("Cet objectif n'est pas de type Enigme Multi-Etapes");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration des enigmes manquante');
  }

  const config = objective.config as Record<string, unknown>;

  if (
    !config.stepsCount ||
    typeof config.stepsCount !== 'number' ||
    config.stepsCount < 2
  ) {
    throw new Error('Nombre d etapes invalide');
  }

  if (!config.enigmasData || typeof config.enigmasData !== 'string') {
    throw new Error('Donnees des enigmes manquantes');
  }

  const enigmaLines = String(config.enigmasData)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const enigmas = enigmaLines.map((line) => {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length !== 2) {
      throw new Error('Format des enigmes invalide');
    }
    return {
      question: parts[0],
      answer: parts[1],
    };
  });

  if (enigmas.length < config.stepsCount) {
    throw new Error('Pas assez d enigmes pour le nombre d etapes');
  }

  return {
    stepsCount: config.stepsCount as number,
    enigmas: enigmas.slice(0, config.stepsCount),
    points: objective.points,
  };
}

export async function getCurrentStep(input: GetCurrentStepInput) {
  const config = await validateMultiStepEnigmaObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Enigme multi-etapes deja completee');
  }

  const completedSteps = await attemptRepository.findAttemptsByOperationTeam(
    input.objectiveId,
    input.operationTeamId
  );

  const completedCount = completedSteps.filter(
    (attempt) => attempt.success
  ).length;

  if (completedCount >= config.stepsCount) {
    throw new Error('Toutes les etapes sont deja completees');
  }

  const currentStep = completedCount;

  return {
    currentStep: currentStep + 1,
    totalSteps: config.stepsCount,
    enigma: config.enigmas[currentStep].question,
    objectiveId: input.objectiveId,
  };
}

export async function answerStep(input: AnswerStepInput) {
  const config = await validateMultiStepEnigmaObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Enigme multi-etapes deja completee');
  }

  const completedSteps = await attemptRepository.findAttemptsByOperationTeam(
    input.objectiveId,
    input.operationTeamId
  );

  const completedCount = completedSteps.filter(
    (attempt) => attempt.success
  ).length;

  if (completedCount >= config.stepsCount) {
    throw new Error('Toutes les etapes sont deja completees');
  }

  const currentStep = completedCount;
  const currentEnigma = config.enigmas[currentStep];

  const userAnswer = input.answer.trim().toLowerCase();
  const correctAnswer = currentEnigma.answer.trim().toLowerCase();

  const isCorrect = userAnswer === correctAnswer;

  if (!isCorrect) {
    await attemptRepository.createAttempt({
      objective: { connect: { id: input.objectiveId } },
      operationTeam: { connect: { id: input.operationTeamId } },
      attemptedCode: input.answer.trim(),
      success: false,
      attemptedAt: new Date(),
    });

    throw new Error('Reponse incorrecte');
  }

  await attemptRepository.createAttempt({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    attemptedCode: input.answer.trim(),
    success: true,
    attemptedAt: new Date(),
  });

  const newCompletedCount = completedCount + 1;
  const isFullyCompleted = newCompletedCount >= config.stepsCount;

  let completion = null;
  if (isFullyCompleted) {
    completion = await completionRepository.createCompletion({
      objective: { connect: { id: input.objectiveId } },
      operationTeam: { connect: { id: input.operationTeamId } },
    });
  }

  return {
    correct: true,
    currentStep: currentStep + 1,
    completedSteps: newCompletedCount,
    totalSteps: config.stepsCount,
    completed: isFullyCompleted,
    completion,
    points: completion ? config.points : 0,
  };
}

async function validatePointDefenseObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'POINT_DEFENSE') {
    throw new Error("Cet objectif n'est pas de type Defense de Point");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration de la defense manquante');
  }

  const config = objective.config as Record<string, unknown>;

  if (
    !config.durationMinutes ||
    typeof config.durationMinutes !== 'number' ||
    config.durationMinutes < 1
  ) {
    throw new Error('Duree de defense invalide');
  }

  if (
    !config.radiusMeters ||
    typeof config.radiusMeters !== 'number' ||
    config.radiusMeters < 10
  ) {
    throw new Error('Rayon de defense invalide');
  }

  return {
    durationMinutes: config.durationMinutes as number,
    radiusMeters: config.radiusMeters as number,
    defenseRules: config.defenseRules
      ? String(config.defenseRules)
      : undefined,
    points: objective.points,
  };
}

export async function startDefense(input: StartDefenseInput) {
  const config = await validatePointDefenseObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Defense deja completee par cette equipe');
  }

  const existingDefense = await gpsRepository.findActiveCapture(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingDefense) {
    throw new Error('Defense deja en cours pour cette equipe');
  }

  const defense = await gpsRepository.createCapture({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    startLatitude: input.latitude,
    startLongitude: input.longitude,
    status: 'IN_PROGRESS',
    startedAt: new Date(),
  });

  const completionTime = new Date(
    Date.now() + config.durationMinutes * 60 * 1000
  );

  return {
    defenseId: defense.id,
    durationMinutes: config.durationMinutes,
    radiusMeters: config.radiusMeters,
    startedAt: defense.startedAt,
    mustCompleteBy: completionTime,
    defenseRules: config.defenseRules,
  };
}

export async function completeDefense(input: CompleteDefenseInput) {
  const defense = await gpsRepository.findCaptureById(input.defenseId);

  if (!defense) {
    throw new Error('Defense non trouvee');
  }

  if (defense.status !== 'IN_PROGRESS') {
    throw new Error('Cette defense n est pas en cours');
  }

  const config = await validatePointDefenseObjective(defense.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    defense.objectiveId,
    defense.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Defense deja completee par cette equipe');
  }

  const elapsedMinutes =
    (Date.now() - defense.startedAt.getTime()) / (1000 * 60);

  if (elapsedMinutes < config.durationMinutes) {
    throw new Error('Duree de defense non atteinte');
  }

  const distance = calculateDistance(
    defense.startLatitude,
    defense.startLongitude,
    input.latitude,
    input.longitude
  );

  if (distance > config.radiusMeters) {
    throw new Error('Position trop eloignee du point de defense');
  }

  const updatedDefense = await gpsRepository.updateCapture(input.defenseId, {
    status: 'COMPLETED',
    completedAt: new Date(),
  });

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: defense.objectiveId } },
    operationTeam: { connect: { id: defense.operationTeamId } },
    latitude: input.latitude,
    longitude: input.longitude,
  });

  return {
    defense: updatedDefense,
    completion,
    points: config.points,
    durationMinutes: Math.floor(elapsedMinutes),
  };
}

async function validateMorseRadioObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'MORSE_RADIO') {
    throw new Error("Cet objectif n'est pas de type Morse/Radio");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration du message morse manquante');
  }

  const config = objective.config as Record<string, unknown>;

  if (!config.message || typeof config.message !== 'string') {
    throw new Error('Message a decoder manquant');
  }

  return {
    message: config.message as string,
    encodedMessage: config.encodedMessage
      ? String(config.encodedMessage)
      : undefined,
    points: objective.points,
  };
}

export async function decodeMorse(input: DecodeMorseInput) {
  const config = await validateMorseRadioObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Message morse deja decode par cette equipe');
  }

  const userMessage = input.decodedMessage.trim().toLowerCase();
  const correctMessage = config.message.trim().toLowerCase();

  const isCorrect = userMessage === correctMessage;

  if (!isCorrect) {
    throw new Error('Message decode incorrect');
  }

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
  });

  return {
    completion,
    correct: true,
    message: config.message,
    points: config.points,
  };
}

async function validateTimeRaceObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'TIME_RACE') {
    throw new Error("Cet objectif n'est pas de type Course Contre la Montre");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration de la course manquante');
  }

  const config = objective.config as Record<string, unknown>;

  if (
    !config.timeLimit ||
    typeof config.timeLimit !== 'number' ||
    config.timeLimit < 1
  ) {
    throw new Error('Limite de temps invalide');
  }

  if (
    !config.checkpointsCount ||
    typeof config.checkpointsCount !== 'number' ||
    config.checkpointsCount < 2
  ) {
    throw new Error('Nombre de checkpoints invalide');
  }

  return {
    timeLimit: config.timeLimit as number,
    checkpointsCount: config.checkpointsCount as number,
    points: objective.points,
  };
}

export async function startTimeRace(input: StartTimeRaceInput) {
  const config = await validateTimeRaceObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Course deja completee par cette equipe');
  }

  const existingRace = await sabotageRepository.findActiveSabotage(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingRace) {
    throw new Error('Course deja en cours pour cette equipe');
  }

  const race = await sabotageRepository.createSabotage({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    status: 'PENDING',
    startedAt: new Date(),
  });

  const deadline = new Date(Date.now() + config.timeLimit * 60 * 1000);

  return {
    raceId: race.id,
    timeLimit: config.timeLimit,
    checkpointsCount: config.checkpointsCount,
    startedAt: race.startedAt,
    deadline,
  };
}

export async function validateCheckpoint(input: ValidateCheckpointInput) {
  const config = await validateTimeRaceObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Course deja completee par cette equipe');
  }

  const race = await sabotageRepository.findActiveSabotage(
    input.objectiveId,
    input.operationTeamId
  );

  if (!race) {
    throw new Error('Course non demarree');
  }

  const elapsedMinutes =
    (Date.now() - race.startedAt.getTime()) / (1000 * 60);

  if (elapsedMinutes > config.timeLimit) {
    await sabotageRepository.updateSabotage(race.id, {
      status: 'DEFUSED',
      completedAt: new Date(),
    });
    throw new Error('Temps ecoule');
  }

  const validatedCheckpoints =
    await attemptRepository.findAttemptsByOperationTeam(
      input.objectiveId,
      input.operationTeamId
    );

  const validatedCount = validatedCheckpoints.filter(
    (attempt) => attempt.success
  ).length;

  const expectedCheckpoint = validatedCount + 1;

  if (input.checkpointNumber !== expectedCheckpoint) {
    throw new Error(
      'Checkpoint invalide, validez dans l ordre'
    );
  }

  await attemptRepository.createAttempt({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    attemptedCode: String(input.checkpointNumber),
    success: true,
    attemptedAt: new Date(),
  });

  const newValidatedCount = validatedCount + 1;
  const allCheckpointsValidated = newValidatedCount >= config.checkpointsCount;

  let completion = null;
  if (allCheckpointsValidated) {
    await sabotageRepository.updateSabotage(race.id, {
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    completion = await completionRepository.createCompletion({
      objective: { connect: { id: input.objectiveId } },
      operationTeam: { connect: { id: input.operationTeamId } },
    });
  }

  return {
    checkpointValidated: input.checkpointNumber,
    totalValidated: newValidatedCount,
    totalCheckpoints: config.checkpointsCount,
    completed: allCheckpointsValidated,
    completion,
    points: completion ? config.points : 0,
    elapsedMinutes: Math.floor(elapsedMinutes),
  };
}

async function validateConditionalObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'CONDITIONAL') {
    throw new Error("Cet objectif n'est pas de type Conditionnel");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration conditionnelle manquante');
  }

  const config = objective.config as ConditionalConfig;

  if (
    !config.requiredObjectiveIds ||
    !Array.isArray(config.requiredObjectiveIds) ||
    config.requiredObjectiveIds.length === 0
  ) {
    throw new Error('Objectifs requis manquants');
  }

  if (typeof config.requireAll !== 'boolean') {
    throw new Error('Parametre requireAll invalide');
  }

  return {
    requiredObjectiveIds: config.requiredObjectiveIds,
    requireAll: config.requireAll,
    conditionDescription: config.conditionDescription,
    points: objective.points,
  };
}

export async function checkCondition(input: CheckConditionInput) {
  const config = await validateConditionalObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Objectif conditionnel deja complete');
  }

  const completedCount = await Promise.all(
    config.requiredObjectiveIds.map(async (requiredId) => {
      const completion = await completionRepository.checkCompletion(
        requiredId,
        input.operationTeamId
      );
      return completion !== null;
    })
  );

  const totalCompleted = completedCount.filter((completed) => completed).length;
  const totalRequired = config.requiredObjectiveIds.length;

  const conditionMet = config.requireAll
    ? totalCompleted === totalRequired
    : totalCompleted > 0;

  if (!conditionMet) {
    return {
      conditionMet: false,
      totalCompleted,
      totalRequired,
      requireAll: config.requireAll,
      conditionDescription: config.conditionDescription,
    };
  }

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
  });

  return {
    conditionMet: true,
    totalCompleted,
    totalRequired,
    requireAll: config.requireAll,
    conditionDescription: config.conditionDescription,
    completion,
    points: config.points,
  };
}

async function validateAntennaHackObjective(objectiveId: string) {
  const objective = await objectiveRepository.findObjectiveById(objectiveId);

  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  if (objective.type !== 'ANTENNA_HACK') {
    throw new Error("Cet objectif n'est pas de type Piratage d'Antenne");
  }

  if (!objective.config || typeof objective.config !== 'object') {
    throw new Error('Configuration du piratage manquante');
  }

  const config = objective.config as AntennaHackConfig;

  if (
    !config.hackDurationMinutes ||
    typeof config.hackDurationMinutes !== 'number' ||
    config.hackDurationMinutes < 1
  ) {
    throw new Error('Duree de piratage invalide');
  }

  return {
    hackDurationMinutes: config.hackDurationMinutes,
    hackInstructions: config.hackInstructions,
    points: objective.points,
  };
}

export async function startAntennaHack(input: StartAntennaHackInput) {
  const config = await validateAntennaHackObjective(input.objectiveId);

  const existingCompletion = await completionRepository.checkCompletion(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Piratage deja complete par cette equipe');
  }

  const existingHack = await sabotageRepository.findActiveSabotage(
    input.objectiveId,
    input.operationTeamId
  );

  if (existingHack) {
    throw new Error('Piratage deja en cours pour cette equipe');
  }

  const hack = await sabotageRepository.createSabotage({
    objective: { connect: { id: input.objectiveId } },
    operationTeam: { connect: { id: input.operationTeamId } },
    status: 'PENDING',
    startedAt: new Date(),
  });

  const completionTime = new Date(
    Date.now() + config.hackDurationMinutes * 60 * 1000
  );

  return {
    hackId: hack.id,
    hackDurationMinutes: config.hackDurationMinutes,
    startedAt: hack.startedAt,
    mustCompleteBy: completionTime,
    hackInstructions: config.hackInstructions,
  };
}

export async function completeAntennaHack(input: CompleteAntennaHackInput) {
  const hack = await sabotageRepository.findSabotageById(input.hackId);

  if (!hack) {
    throw new Error('Piratage non trouve');
  }

  if (hack.status !== 'PENDING') {
    throw new Error('Ce piratage n est plus en attente');
  }

  const objective = await objectiveRepository.findObjectiveById(
    hack.objectiveId
  );
  if (!objective) {
    throw new Error('Objectif non trouve');
  }

  const config = objective.config as AntennaHackConfig;
  const elapsedMinutes =
    (Date.now() - hack.startedAt.getTime()) / (1000 * 60);

  if (elapsedMinutes < config.hackDurationMinutes) {
    throw new Error(
      `Le piratage n'est pas encore termine. Temps restant: ${Math.ceil(config.hackDurationMinutes - elapsedMinutes)} minutes`
    );
  }

  const existingCompletion = await completionRepository.checkCompletion(
    hack.objectiveId,
    hack.operationTeamId
  );

  if (existingCompletion) {
    throw new Error('Piratage deja complete par cette equipe');
  }

  await sabotageRepository.updateSabotage(input.hackId, {
    status: 'COMPLETED',
    completedAt: new Date(),
  });

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: hack.objectiveId } },
    operationTeam: { connect: { id: hack.operationTeamId } },
  });

  return {
    completion,
    points: objective.points,
    hackDurationMinutes: Math.floor(elapsedMinutes),
  };
}
