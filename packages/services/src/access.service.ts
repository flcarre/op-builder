import { accessRepository, dominationRepository } from '@crafted/database';
import type {
  CreateAccessPointInput,
  UpdateAccessPointInput,
  CreateAccessLevelInput,
  UpdateAccessLevelInput,
  CreateSimpleAccessInput,
  UpdateSimpleAccessInput,
} from '@crafted/validators';

// ============================================
// Access Point Operations
// ============================================

export async function createAccessPoint(input: CreateAccessPointInput) {
  const session = await dominationRepository.findSessionById(input.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const existingPoints = await accessRepository.findAccessPointsBySession(
    input.sessionId
  );
  const maxOrder = existingPoints.reduce((max, p) => Math.max(max, p.order), -1);

  return accessRepository.createAccessPoint({
    name: input.name,
    description: input.description,
    order: maxOrder + 1,
    session: { connect: { id: input.sessionId } },
  });
}

export async function getAccessPointsBySession(sessionId: string) {
  return accessRepository.findAccessPointsBySession(sessionId);
}

export async function updateAccessPoint(input: UpdateAccessPointInput) {
  const point = await accessRepository.findAccessPointById(input.id);
  if (!point) {
    throw new Error('Access point not found');
  }

  const { id, ...updateData } = input;
  return accessRepository.updateAccessPoint(id, updateData);
}

export async function deleteAccessPoint(id: string) {
  const point = await accessRepository.findAccessPointById(id);
  if (!point) {
    throw new Error('Access point not found');
  }
  return accessRepository.deleteAccessPoint(id);
}

// ============================================
// Access Level Operations
// ============================================

export async function addAccessLevel(input: CreateAccessLevelInput) {
  const point = await accessRepository.findAccessPointById(input.accessPointId);
  if (!point) {
    throw new Error('Access point not found');
  }

  const maxLevel = await accessRepository.findMaxLevelForPoint(
    input.accessPointId
  );

  return accessRepository.createAccessLevel({
    name: input.name,
    password: input.password,
    level: maxLevel + 1,
    accessPoint: { connect: { id: input.accessPointId } },
  });
}

export async function updateAccessLevel(input: UpdateAccessLevelInput) {
  const level = await accessRepository.findAccessLevelById(input.id);
  if (!level) {
    throw new Error('Access level not found');
  }

  const { id, ...updateData } = input;
  return accessRepository.updateAccessLevel(id, updateData);
}

export async function deleteAccessLevel(id: string) {
  const level = await accessRepository.findAccessLevelById(id);
  if (!level) {
    throw new Error('Access level not found');
  }
  return accessRepository.deleteAccessLevel(id);
}

// ============================================
// Player Operations
// ============================================

export async function getAccessLevelByToken(qrToken: string) {
  const level = await accessRepository.findAccessLevelByToken(qrToken);
  if (!level) {
    throw new Error('Access level not found');
  }

  const session = await dominationRepository.findSessionById(
    level.accessPoint.sessionId
  );
  if (!session) {
    throw new Error('Session not found');
  }

  return {
    level,
    session: {
      id: session.id,
      name: session.name,
      status: session.status,
    },
  };
}

export async function validateAccessPassword(
  levelId: string,
  password: string
): Promise<boolean> {
  const level = await accessRepository.findAccessLevelById(levelId);
  if (!level) {
    throw new Error('Access level not found');
  }

  return level.password === password;
}

// ============================================
// Simple Access Operations
// ============================================

export async function createSimpleAccess(input: CreateSimpleAccessInput) {
  const session = await dominationRepository.findSessionById(input.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const existingAccesses = await accessRepository.findSimpleAccessesBySession(
    input.sessionId
  );
  const maxOrder = existingAccesses.reduce((max, a) => Math.max(max, a.order), -1);

  return accessRepository.createSimpleAccess({
    name: input.name,
    description: input.description,
    password: input.password,
    order: maxOrder + 1,
    session: { connect: { id: input.sessionId } },
  });
}

export async function getSimpleAccessesBySession(sessionId: string) {
  return accessRepository.findSimpleAccessesBySession(sessionId);
}

export async function updateSimpleAccess(input: UpdateSimpleAccessInput) {
  const access = await accessRepository.findSimpleAccessById(input.id);
  if (!access) {
    throw new Error('Simple access not found');
  }

  const { id, ...updateData } = input;
  return accessRepository.updateSimpleAccess(id, updateData);
}

export async function deleteSimpleAccess(id: string) {
  const access = await accessRepository.findSimpleAccessById(id);
  if (!access) {
    throw new Error('Simple access not found');
  }
  return accessRepository.deleteSimpleAccess(id);
}

export async function getSimpleAccessByToken(qrToken: string) {
  const access = await accessRepository.findSimpleAccessByToken(qrToken);
  if (!access) {
    throw new Error('Simple access not found');
  }

  const session = await dominationRepository.findSessionById(access.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  return {
    access,
    session: {
      id: session.id,
      name: session.name,
      status: session.status,
    },
  };
}

export async function validateSimpleAccessPassword(
  qrToken: string,
  password: string
): Promise<boolean> {
  const access = await accessRepository.findSimpleAccessByToken(qrToken);
  if (!access) {
    throw new Error('Simple access not found');
  }

  return access.password === password;
}
