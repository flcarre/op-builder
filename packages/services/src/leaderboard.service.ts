import { operationRepository, prisma } from '@crafted/database';

export async function getOperationLeaderboard(
  operationId: string,
  teamId: string
) {
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

  const operationTeams = operation.operationTeams.filter(
    (ot) => ot.acceptedAt !== null
  );

  const leaderboard = await Promise.all(
    operationTeams.map(async (ot) => {
      const completions = await prisma.objectiveCompletion.findMany({
        where: { operationTeamId: ot.id },
        include: {
          objective: {
            select: {
              id: true,
              title: true,
              points: true,
              type: true,
            },
          },
        },
      });

      const totalPoints = completions.reduce(
        (sum, c) => sum + c.objective.points,
        0
      );

      const campTeam = await prisma.campTeam.findUnique({
        where: { operationTeamId: ot.id },
        include: {
          camp: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return {
        operationTeamId: ot.id,
        teamId: ot.teamId,
        teamName: ot.team.name,
        teamSlug: ot.team.slug,
        teamColor: ot.team.color,
        role: ot.role,
        camp: campTeam
          ? {
              id: campTeam.camp.id,
              name: campTeam.camp.name,
              color: campTeam.camp.color,
            }
          : null,
        totalPoints,
        completedObjectives: completions.length,
        completions: completions.map((c) => ({
          id: c.id,
          objectiveId: c.objective.id,
          objectiveTitle: c.objective.title,
          points: c.objective.points,
          completedAt: c.completedAt,
        })),
      };
    })
  );

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    operation: {
      id: operation.id,
      name: operation.name,
      status: operation.status,
    },
    leaderboard: leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })),
  };
}

export async function getCampLeaderboard(
  operationId: string,
  teamId: string
) {
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

  const camps = await prisma.camp.findMany({
    where: { operationId },
    include: {
      campTeams: {
        include: {
          operationTeam: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const campScores = await Promise.all(
    camps.map(async (camp) => {
      const teamScores = await Promise.all(
        camp.campTeams.map(async (ct) => {
          const completions = await prisma.objectiveCompletion.findMany({
            where: { operationTeamId: ct.operationTeamId },
            include: {
              objective: {
                select: {
                  points: true,
                },
              },
            },
          });

          return completions.reduce(
            (sum, c) => sum + c.objective.points,
            0
          );
        })
      );

      const totalPoints = teamScores.reduce((sum, points) => sum + points, 0);

      return {
        campId: camp.id,
        campName: camp.name,
        campColor: camp.color,
        teamCount: camp.campTeams.length,
        totalPoints,
      };
    })
  );

  campScores.sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    operation: {
      id: operation.id,
      name: operation.name,
      status: operation.status,
    },
    camps: campScores.map((camp, index) => ({
      ...camp,
      rank: index + 1,
    })),
  };
}
