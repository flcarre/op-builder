import { teamRepository, db } from '@crafted/database';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  AddTeamMemberInput,
  UpdateTeamMemberInput,
  TransferOwnershipInput,
} from '@crafted/validators';
import { randomBytes } from 'crypto';

export async function createTeam(ownerId: string, input: CreateTeamInput) {
  const existingTeam = await teamRepository.findTeamBySlug(input.slug);
  if (existingTeam) {
    throw new Error('Team slug already exists');
  }

  return teamRepository.createTeam({
    ...input,
    owner: { connect: { id: ownerId } },
  });
}

export async function getTeamById(id: string) {
  const team = await teamRepository.findTeamById(id);
  if (!team) {
    throw new Error('Team not found');
  }
  return team;
}

export async function getTeamBySlug(slug: string) {
  const team = await teamRepository.findTeamBySlug(slug);
  if (!team) {
    throw new Error('Team not found');
  }
  return team;
}

export async function getUserTeams(userId: string) {
  const teams = await teamRepository.findTeamsByOwner(userId);

  // Auto-create team if user has no team (for existing users or if registration failed)
  if (teams.length === 0) {
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user) {
      const teamName = user.name || user.email.split('@')[0];
      const teamSlug = `team-${userId.toLowerCase()}`;

      const newTeam = await createTeam(userId, {
        name: teamName,
        slug: teamSlug,
        description: `${teamName}'s team`,
        color: '#3b82f6',
      });

      return [newTeam];
    }
  }

  return teams;
}

export async function updateTeam(
  userId: string,
  input: UpdateTeamInput
) {
  const team = await teamRepository.findTeamById(input.id);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== userId) {
    throw new Error('Unauthorized: Only owner can update team');
  }

  const { id, ...updateData } = input;
  return teamRepository.updateTeam(id, updateData);
}

export async function deleteTeam(userId: string, teamId: string) {
  const team = await teamRepository.findTeamById(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== userId) {
    throw new Error('Unauthorized: Only owner can delete team');
  }

  return teamRepository.deleteTeam(teamId);
}

export async function addTeamMember(
  userId: string,
  input: AddTeamMemberInput
) {
  const team = await teamRepository.findTeamById(input.teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== userId) {
    throw new Error('Unauthorized: Only owner can add members');
  }

  return teamRepository.addMember({
    ...input,
    team: { connect: { id: input.teamId } },
  });
}

export async function updateTeamMember(
  userId: string,
  input: UpdateTeamMemberInput
) {
  const member = await teamRepository.findMemberById(input.id);
  if (!member) {
    throw new Error('Member not found');
  }

  const team = await teamRepository.findTeamById(member.teamId);
  if (!team || team.ownerId !== userId) {
    throw new Error('Unauthorized');
  }

  const { id, ...updateData } = input;
  return teamRepository.updateMember(id, updateData);
}

export async function deleteTeamMember(
  userId: string,
  memberId: string
) {
  const member = await teamRepository.findMemberById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }

  const team = await teamRepository.findTeamById(member.teamId);
  if (!team || team.ownerId !== userId) {
    throw new Error('Unauthorized');
  }

  return teamRepository.deleteMember(memberId);
}

export async function transferOwnership(
  userId: string,
  input: TransferOwnershipInput
) {
  const team = await teamRepository.findTeamById(input.teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== userId) {
    throw new Error('Unauthorized: Only owner can transfer');
  }

  return teamRepository.updateTeam(input.teamId, {
    owner: { connect: { id: input.newOwnerId } },
  });
}

export async function regenerateMemberQRCode(
  userId: string,
  memberId: string
) {
  const member = await teamRepository.findMemberById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }

  const team = await teamRepository.findTeamById(member.teamId);
  if (!team || team.ownerId !== userId) {
    throw new Error('Unauthorized: Only owner can regenerate');
  }

  const newToken = randomBytes(32).toString('hex');
  return teamRepository.updateMember(memberId, {
    qrCodeToken: newToken,
  });
}

export async function regenerateAllMemberQRCodes(
  userId: string,
  teamId: string
) {
  const team = await teamRepository.findTeamById(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  if (team.ownerId !== userId) {
    throw new Error('Unauthorized: Only owner can regenerate');
  }

  const updates = team.members.map((member) => {
    const newToken = randomBytes(32).toString('hex');
    return teamRepository.updateMember(member.id, {
      qrCodeToken: newToken,
    });
  });

  return Promise.all(updates);
}
