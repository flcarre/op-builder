import {
  completionRepository,
  operationRepository,
} from '@crafted/database';
import type { CompleteObjectiveInput } from '@crafted/validators';

export async function getObjectiveByToken(token: string) {
  const objective = await completionRepository.findObjectiveByToken(token);
  if (!objective) {
    throw new Error('Objective not found');
  }
  return objective;
}

export async function completeObjective(input: CompleteObjectiveInput) {
  const objective = await completionRepository.findObjectiveByToken(
    input.token
  );
  if (!objective) {
    throw new Error('Invalid QR code');
  }

  if (objective.operation.status !== 'ACTIVE') {
    throw new Error('Operation is not active');
  }

  const operationTeam = await operationRepository.findOperationTeam(
    objective.operationId,
    input.teamId
  );

  if (!operationTeam) {
    throw new Error('Team not part of this operation');
  }

  if (!operationTeam.acceptedAt) {
    throw new Error('Team has not accepted the invitation');
  }

  const existingCompletion = await completionRepository.checkCompletion(
    objective.id,
    operationTeam.id
  );

  if (existingCompletion) {
    throw new Error('Objective already completed by your team');
  }

  if (objective.parentObjectiveId) {
    const parentCompletion = await completionRepository.checkCompletion(
      objective.parentObjectiveId,
      operationTeam.id
    );

    if (!parentCompletion) {
      throw new Error(
        `You must complete "${objective.parentObjective?.title}" first`
      );
    }
  }

  const completion = await completionRepository.createCompletion({
    objective: { connect: { id: objective.id } },
    operationTeam: { connect: { id: operationTeam.id } },
    completedBy: input.completedBy,
    latitude: input.latitude,
    longitude: input.longitude,
    deviceInfo: input.deviceInfo,
    completedAt: new Date(),
  });

  return {
    completion,
    objective: {
      id: objective.id,
      title: objective.title,
      points: objective.points,
      type: objective.type,
    },
  };
}

export async function getCompletionsByTeam(
  operationId: string,
  teamId: string
) {
  const operationTeam = await operationRepository.findOperationTeam(
    operationId,
    teamId
  );

  if (!operationTeam) {
    throw new Error('Team not part of this operation');
  }

  return completionRepository.findCompletionsByOperationTeam(
    operationTeam.id
  );
}
