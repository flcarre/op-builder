import { operationRepository, prisma } from '@crafted/database';

export async function getTeamProgress(operationId: string, teamId: string) {
  const operation = await operationRepository.findOperationById(operationId);
  if (!operation) {
    throw new Error('Operation not found');
  }

  const operationTeam = operation.operationTeams.find(
    (ot) => ot.teamId === teamId
  );

  if (!operationTeam) {
    throw new Error('Team not part of this operation');
  }

  if (!operationTeam.acceptedAt) {
    throw new Error('Team has not accepted the invitation');
  }

  const objectives = await prisma.objective.findMany({
    where: { operationId },
    include: {
      camp: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      parentObjective: {
        select: {
          id: true,
          title: true,
        },
      },
      completions: {
        where: { operationTeamId: operationTeam.id },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const completedObjectiveIds = new Set(
    objectives
      .filter((obj) => obj.completions.length > 0)
      .map((obj) => obj.id)
  );

  const available = objectives.filter((obj) => {
    if (obj.completions.length > 0) return false;
    if (!obj.parentObjectiveId) return true;
    return completedObjectiveIds.has(obj.parentObjectiveId);
  });

  const locked = objectives.filter((obj) => {
    if (obj.completions.length > 0) return false;
    if (!obj.parentObjectiveId) return false;
    return !completedObjectiveIds.has(obj.parentObjectiveId);
  });

  const completed = objectives.filter((obj) => obj.completions.length > 0);

  const totalPoints = objectives.reduce((sum, obj) => sum + obj.points, 0);
  const earnedPoints = completed.reduce((sum, obj) => sum + obj.points, 0);
  const progressPercentage =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    operation: {
      id: operation.id,
      name: operation.name,
      status: operation.status,
    },
    team: {
      id: operationTeam.team.id,
      name: operationTeam.team.name,
      slug: operationTeam.team.slug,
      color: operationTeam.team.color,
    },
    stats: {
      totalObjectives: objectives.length,
      completedObjectives: completed.length,
      availableObjectives: available.length,
      lockedObjectives: locked.length,
      totalPoints,
      earnedPoints,
      progressPercentage,
    },
    objectives: {
      completed: completed.map((obj) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        points: obj.points,
        type: obj.type,
        camp: obj.camp,
        completedAt: obj.completions[0]?.completedAt,
      })),
      available: available.map((obj) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        points: obj.points,
        type: obj.type,
        camp: obj.camp,
        parentObjective: obj.parentObjective,
      })),
      locked: locked.map((obj) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        points: obj.points,
        type: obj.type,
        camp: obj.camp,
        parentObjective: obj.parentObjective,
      })),
    },
  };
}
