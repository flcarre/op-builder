import { operationRepository } from '@crafted/database';
import type {
  CreateOperationInput,
  UpdateOperationInput,
  InviteTeamInput,
  UpdateTeamRoleInput,
  AcceptInvitationInput,
} from '@crafted/validators';

export async function createOperation(
  creatorTeamId: string,
  input: CreateOperationInput
) {
  const operation = await operationRepository.createOperation({
    ...input,
    creatorTeam: { connect: { id: creatorTeamId } },
  });

  await operationRepository.inviteTeamToOperation({
    operation: { connect: { id: operation.id } },
    team: { connect: { id: creatorTeamId } },
    role: 'CREATOR',
    acceptedAt: new Date(),
  });

  return operation;
}

export async function getOperationById(operationId: string, teamId: string) {
  const operation = await operationRepository.findOperationById(operationId);
  if (!operation) {
    throw new Error('Operation not found');
  }

  const hasAccess =
    operation.creatorTeamId === teamId ||
    operation.operationTeams.some((ot) => ot.teamId === teamId);

  if (!hasAccess) {
    throw new Error('Unauthorized: Team not part of this operation');
  }

  return operation;
}

export async function getOperationsByTeam(teamId: string) {
  return operationRepository.findOperationsByTeam(teamId);
}

async function checkOperationPermission(
  operationId: string,
  teamId: string,
  requiredRoles: string[]
) {
  const operation = await operationRepository.findOperationById(operationId);
  if (!operation) {
    throw new Error('Operation not found');
  }

  const operationTeam = operation.operationTeams.find(
    (ot) => ot.teamId === teamId
  );

  if (!operationTeam || !requiredRoles.includes(operationTeam.role)) {
    throw new Error('Unauthorized');
  }

  return operation;
}

export async function updateOperation(
  teamId: string,
  input: UpdateOperationInput
) {
  await checkOperationPermission(input.id, teamId, ['CREATOR', 'CO_ADMIN']);

  const { id, ...updateData } = input;
  return operationRepository.updateOperation(id, updateData);
}

export async function deleteOperation(teamId: string, operationId: string) {
  await checkOperationPermission(operationId, teamId, ['CREATOR']);

  return operationRepository.deleteOperation(operationId);
}

export async function inviteTeamToOperation(
  teamId: string,
  input: InviteTeamInput
) {
  await checkOperationPermission(input.operationId, teamId, [
    'CREATOR',
    'CO_ADMIN',
  ]);

  const existingInvite = await operationRepository.findOperationTeam(
    input.operationId,
    input.teamId
  );

  if (existingInvite) {
    throw new Error('Team already invited to this operation');
  }

  return operationRepository.inviteTeamToOperation({
    operation: { connect: { id: input.operationId } },
    team: { connect: { id: input.teamId } },
    role: input.role,
  });
}

export async function updateTeamRole(
  teamId: string,
  input: UpdateTeamRoleInput
) {
  const operationTeam = await operationRepository.findOperationTeam(
    input.id,
    teamId
  );

  if (!operationTeam) {
    throw new Error('Operation team not found');
  }

  await checkOperationPermission(operationTeam.operationId, teamId, [
    'CREATOR',
  ]);

  return operationRepository.updateOperationTeam(input.id, {
    role: input.role,
  });
}

export async function removeTeamFromOperation(
  teamId: string,
  operationTeamId: string
) {
  const operationTeam = await operationRepository.findOperationTeam(
    operationTeamId,
    teamId
  );

  if (!operationTeam) {
    throw new Error('Operation team not found');
  }

  await checkOperationPermission(operationTeam.operationId, teamId, [
    'CREATOR',
  ]);

  if (operationTeam.role === 'CREATOR') {
    throw new Error('Cannot remove creator from operation');
  }

  return operationRepository.removeTeamFromOperation(operationTeamId);
}

export async function acceptInvitation(
  teamId: string,
  input: AcceptInvitationInput
) {
  const operationTeam = await operationRepository.findOperationTeam(
    input.operationId,
    input.teamId
  );

  if (!operationTeam) {
    throw new Error('Invitation not found');
  }

  if (operationTeam.teamId !== teamId) {
    throw new Error('Unauthorized: Can only accept own invitations');
  }

  if (operationTeam.acceptedAt) {
    throw new Error('Invitation already accepted');
  }

  return operationRepository.updateOperationTeam(operationTeam.id, {
    acceptedAt: new Date(),
  });
}

export async function publishOperation(teamId: string, operationId: string) {
  const operation = await checkOperationPermission(operationId, teamId, [
    'CREATOR',
    'CO_ADMIN',
  ]);

  if (operation.status !== 'DRAFT') {
    throw new Error('Can only publish operations in DRAFT status');
  }

  return operationRepository.updateOperation(operationId, {
    status: 'PUBLISHED',
  });
}

export async function startOperation(teamId: string, operationId: string) {
  const operation = await checkOperationPermission(operationId, teamId, [
    'CREATOR',
    'CO_ADMIN',
  ]);

  if (operation.status !== 'PUBLISHED') {
    throw new Error('Can only start operations in PUBLISHED status');
  }

  return operationRepository.updateOperation(operationId, {
    status: 'ACTIVE',
  });
}

export async function completeOperation(teamId: string, operationId: string) {
  const operation = await checkOperationPermission(operationId, teamId, [
    'CREATOR',
    'CO_ADMIN',
  ]);

  if (operation.status !== 'ACTIVE') {
    throw new Error('Can only complete operations in ACTIVE status');
  }

  return operationRepository.updateOperation(operationId, {
    status: 'COMPLETED',
  });
}

export async function cancelOperation(teamId: string, operationId: string) {
  await checkOperationPermission(operationId, teamId, ['CREATOR']);

  return operationRepository.updateOperation(operationId, {
    status: 'CANCELLED',
  });
}

export async function reopenOperation(teamId: string, operationId: string) {
  const operation = await checkOperationPermission(operationId, teamId, [
    'CREATOR',
    'CO_ADMIN',
  ]);

  if (operation.status !== 'COMPLETED') {
    throw new Error('Can only reopen operations in COMPLETED status');
  }

  return operationRepository.updateOperation(operationId, {
    status: 'ACTIVE',
  });
}
