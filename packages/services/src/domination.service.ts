import { dominationRepository } from '@crafted/database';
import type {
  CreateDominationSessionInput,
  UpdateDominationSessionInput,
  CreateDominationTeamInput,
  UpdateDominationTeamInput,
  CreateDominationPointInput,
  UpdateDominationPointInput,
  CaptureDominationPointInput,
} from '@crafted/validators';

export async function createDominationSession(input: CreateDominationSessionInput) {
  return dominationRepository.createSession(input);
}

export async function getDominationSessionById(id: string) {
  const session = await dominationRepository.findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }
  return session;
}

export async function getAllDominationSessions() {
  return dominationRepository.findAllSessions();
}

export async function updateDominationSession(input: UpdateDominationSessionInput) {
  const session = await dominationRepository.findSessionById(input.id);
  if (!session) {
    throw new Error('Session not found');
  }

  const { id, ...updateData } = input;
  return dominationRepository.updateSession(id, updateData);
}

export async function deleteDominationSession(id: string) {
  const session = await dominationRepository.findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }
  return dominationRepository.deleteSession(id);
}

export async function startDominationSession(id: string) {
  const session = await dominationRepository.findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status === 'ACTIVE') {
    throw new Error('Session already active');
  }
  if (session.status === 'COMPLETED') {
    throw new Error('Session already completed');
  }

  return dominationRepository.updateSession(id, {
    status: 'ACTIVE',
    startedAt: new Date(),
  });
}

export async function pauseDominationSession(id: string) {
  const session = await dominationRepository.findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'ACTIVE') {
    throw new Error('Session is not active');
  }

  return dominationRepository.updateSession(id, { status: 'PAUSED' });
}

export async function resumeDominationSession(id: string) {
  const session = await dominationRepository.findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'PAUSED') {
    throw new Error('Session is not paused');
  }

  return dominationRepository.updateSession(id, { status: 'ACTIVE' });
}

export async function endDominationSession(id: string) {
  const session = await dominationRepository.findSessionById(id);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status === 'COMPLETED') {
    throw new Error('Session already completed');
  }

  return dominationRepository.updateSession(id, {
    status: 'COMPLETED',
    endedAt: new Date(),
  });
}

export async function createDominationTeam(input: CreateDominationTeamInput) {
  const session = await dominationRepository.findSessionById(input.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const maxOrder = session.teams.reduce(
    (max, t) => Math.max(max, t.order),
    -1
  );

  return dominationRepository.createTeam({
    name: input.name,
    color: input.color,
    order: maxOrder + 1,
    session: { connect: { id: input.sessionId } },
  });
}

export async function updateDominationTeam(input: UpdateDominationTeamInput) {
  const team = await dominationRepository.findTeamById(input.id);
  if (!team) {
    throw new Error('Team not found');
  }

  const { id, ...updateData } = input;
  return dominationRepository.updateTeam(id, updateData);
}

export async function deleteDominationTeam(id: string) {
  const team = await dominationRepository.findTeamById(id);
  if (!team) {
    throw new Error('Team not found');
  }
  return dominationRepository.deleteTeam(id);
}

export async function createDominationPoint(input: CreateDominationPointInput) {
  const session = await dominationRepository.findSessionById(input.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const maxOrder = session.points.reduce(
    (max, p) => Math.max(max, p.order),
    -1
  );

  return dominationRepository.createPoint({
    name: input.name,
    description: input.description,
    latitude: input.latitude,
    longitude: input.longitude,
    order: maxOrder + 1,
    session: { connect: { id: input.sessionId } },
  });
}

export async function updateDominationPoint(input: UpdateDominationPointInput) {
  const point = await dominationRepository.findPointById(input.id);
  if (!point) {
    throw new Error('Point not found');
  }

  const { id, ...updateData } = input;
  return dominationRepository.updatePoint(id, updateData);
}

export async function deleteDominationPoint(id: string) {
  const point = await dominationRepository.findPointById(id);
  if (!point) {
    throw new Error('Point not found');
  }
  return dominationRepository.deletePoint(id);
}

export async function getDominationPointByToken(qrToken: string) {
  const point = await dominationRepository.findPointByToken(qrToken);
  if (!point) {
    throw new Error('Point not found');
  }
  return point;
}

export async function captureDominationPoint(input: CaptureDominationPointInput) {
  const point = await dominationRepository.findPointByToken(input.qrToken);
  if (!point) {
    throw new Error('Point not found');
  }

  const session = await dominationRepository.findSessionById(point.sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'ACTIVE') {
    throw new Error('Session is not active');
  }

  const team = await dominationRepository.findTeamById(input.teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.sessionId !== session.id) {
    throw new Error('Team does not belong to this session');
  }

  const lastCapture = await dominationRepository.findLastCaptureForPoint(
    point.id
  );
  if (lastCapture && lastCapture.teamId === input.teamId) {
    throw new Error('Point already captured by this team');
  }

  return dominationRepository.createCapture({
    point: { connect: { id: point.id } },
    team: { connect: { id: input.teamId } },
    session: { connect: { id: session.id } },
    capturedBy: input.capturedBy,
  });
}

export async function getDominationSessionScores(sessionId: string) {
  const session = await dominationRepository.findSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  return dominationRepository.getScoresBySession(sessionId);
}

export async function getDominationSessionState(sessionId: string) {
  const session = await dominationRepository.findSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const points = await dominationRepository.getPointsWithLastCapture(sessionId);
  const scores = await dominationRepository.getScoresBySession(sessionId);

  const pointsState = points.map((point) => {
    const lastCapture = point.captures[0] || null;
    return {
      id: point.id,
      name: point.name,
      controlledBy: lastCapture ? lastCapture.team : null,
      capturedAt: lastCapture?.capturedAt || null,
    };
  });

  const endsAt = session.startedAt && session.durationMinutes
    ? new Date(session.startedAt.getTime() + session.durationMinutes * 60 * 1000)
    : null;

  return {
    session: {
      id: session.id,
      name: session.name,
      status: session.status,
      startedAt: session.startedAt,
      durationMinutes: session.durationMinutes,
      tickIntervalSec: session.tickIntervalSec,
      pointsPerTick: session.pointsPerTick,
      endsAt,
    },
    teams: session.teams,
    points: pointsState,
    scores: scores.map((s) => ({
      teamId: s.teamId,
      points: s.points,
    })),
  };
}

export async function checkAndEndExpiredSession(sessionId: string) {
  const session = await dominationRepository.findSessionById(sessionId);
  if (!session || session.status !== 'ACTIVE') {
    return null;
  }

  if (!session.durationMinutes || !session.startedAt) {
    return null;
  }

  const endsAt = new Date(
    session.startedAt.getTime() + session.durationMinutes * 60 * 1000
  );

  if (new Date() >= endsAt) {
    return dominationRepository.updateSession(sessionId, {
      status: 'COMPLETED',
      endedAt: new Date(),
    });
  }

  return null;
}

export async function calculateAndUpdateDominationScores(sessionId: string) {
  const session = await dominationRepository.findSessionById(sessionId);
  if (!session || session.status !== 'ACTIVE') {
    return null;
  }

  if (!session.startedAt) {
    return null;
  }

  const now = new Date();
  const sessionEndTime = session.durationMinutes
    ? new Date(session.startedAt.getTime() + session.durationMinutes * 60 * 1000)
    : null;
  const effectiveNow = sessionEndTime && now > sessionEndTime ? sessionEndTime : now;

  const captures = await dominationRepository.getAllCapturesForSession(sessionId);
  const points = await dominationRepository.getPointsWithLastCapture(sessionId);

  const teamScores: Record<string, number> = {};
  session.teams.forEach((team) => {
    teamScores[team.id] = 0;
  });

  for (const point of points) {
    const pointCaptures = captures
      .filter((c) => c.pointId === point.id)
      .sort((a, b) => a.capturedAt.getTime() - b.capturedAt.getTime());

    for (let i = 0; i < pointCaptures.length; i++) {
      const capture = pointCaptures[i];
      const nextCapture = pointCaptures[i + 1];

      const controlStart = capture.capturedAt;
      const controlEnd = nextCapture ? nextCapture.capturedAt : effectiveNow;

      const controlDurationSec =
        (controlEnd.getTime() - controlStart.getTime()) / 1000;

      const earnedPoints =
        (controlDurationSec / session.tickIntervalSec) * session.pointsPerTick;

      teamScores[capture.teamId] =
        (teamScores[capture.teamId] || 0) + Math.floor(earnedPoints);
    }
  }

  const updates = Object.entries(teamScores).map(([teamId, totalPoints]) =>
    dominationRepository.upsertScore(sessionId, teamId, totalPoints)
  );

  return Promise.all(updates);
}
