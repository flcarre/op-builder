import {
  campRepository,
  operationRepository,
} from '@crafted/database';
import type {
  CreateCampInput,
  UpdateCampInput,
  AssignTeamToCampInput,
  UpdateCampOrderInput,
} from '@crafted/validators';

async function checkOperationAccess(
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
    throw new Error('Unauthorized: Only creators and co-admins can manage camps');
  }
}

export async function createCamp(
  operationId: string,
  teamId: string,
  input: CreateCampInput
) {
  await checkOperationAccess(operationId, teamId);

  const existingCamps = await campRepository.findCampsByOperation(operationId);
  if (existingCamps.length >= 4) {
    throw new Error('Maximum 4 camps allowed per operation');
  }

  return campRepository.createCamp({
    ...input,
    operation: { connect: { id: operationId } },
  });
}

export async function getCampById(campId: string, teamId: string) {
  const camp = await campRepository.findCampById(campId);
  if (!camp) {
    throw new Error('Camp not found');
  }

  await checkOperationAccess(camp.operationId, teamId);

  return camp;
}

export async function getCampsByOperation(operationId: string, teamId: string) {
  await checkOperationAccess(operationId, teamId);

  return campRepository.findCampsByOperation(operationId);
}

export async function updateCamp(teamId: string, input: UpdateCampInput) {
  const { id, ...updateData } = input;

  const camp = await campRepository.findCampById(id);
  if (!camp) {
    throw new Error('Camp not found');
  }

  await checkOperationAccess(camp.operationId, teamId);

  return campRepository.updateCamp(id, updateData);
}

export async function deleteCamp(campId: string, teamId: string) {
  const camp = await campRepository.findCampById(campId);
  if (!camp) {
    throw new Error('Camp not found');
  }

  await checkOperationAccess(camp.operationId, teamId);

  const allCamps = await campRepository.findCampsByOperation(camp.operationId);
  if (allCamps.length <= 2) {
    throw new Error('Cannot delete camp: Minimum 2 camps required');
  }

  if (camp.campTeams.length > 0) {
    throw new Error('Cannot delete camp with assigned teams');
  }

  return campRepository.deleteCamp(campId);
}

export async function assignTeamToCamp(
  teamId: string,
  input: AssignTeamToCampInput
) {
  const camp = await campRepository.findCampById(input.campId);
  if (!camp) {
    throw new Error('Camp not found');
  }

  await checkOperationAccess(camp.operationId, teamId);

  const existingAssignment = await campRepository.findCampTeamByOperationTeam(
    input.operationTeamId
  );

  if (existingAssignment) {
    throw new Error('Team already assigned to a camp');
  }

  return campRepository.assignTeamToCamp({
    camp: { connect: { id: input.campId } },
    operationTeam: { connect: { id: input.operationTeamId } },
  });
}

export async function removeTeamFromCamp(
  campTeamId: string,
  teamId: string
) {
  const campTeam = await campRepository.findCampTeamByOperationTeam(campTeamId);
  if (!campTeam) {
    throw new Error('Camp team assignment not found');
  }

  const camp = await campRepository.findCampById(campTeam.campId);
  if (!camp) {
    throw new Error('Camp not found');
  }

  await checkOperationAccess(camp.operationId, teamId);

  return campRepository.removeTeamFromCamp(campTeamId);
}

export async function updateCampOrder(
  operationId: string,
  teamId: string,
  input: UpdateCampOrderInput
) {
  await checkOperationAccess(operationId, teamId);

  const existingCamps = await campRepository.findCampsByOperation(operationId);
  const campIds = input.camps.map((c) => c.id);
  const allCampIds = existingCamps.map((c) => c.id);

  const missingCamps = allCampIds.filter((id) => !campIds.includes(id));
  if (missingCamps.length > 0) {
    throw new Error('All camps must be included in order update');
  }

  await campRepository.updateCampOrder(input.camps);
}
