import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createTeam,
  getTeamById,
  getTeamBySlug,
  getUserTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  transferOwnership,
} from '../team.service';

vi.mock('@crafted/database', () => ({
  teamRepository: {
    findTeamBySlug: vi.fn(),
    createTeam: vi.fn(),
    findTeamById: vi.fn(),
    findTeamsByOwner: vi.fn(),
    updateTeam: vi.fn(),
    deleteTeam: vi.fn(),
    addMember: vi.fn(),
    findMemberById: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  },
}));

describe('Team Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamBySlug).mockResolvedValue(null);
      vi.mocked(teamRepository.createTeam).mockResolvedValue({
        id: 'team-1',
        name: 'Alpha Team',
        slug: 'alpha-team',
        description: 'Elite squad',
        logoUrl: null,
        color: '#3b82f6',
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createTeam('user-1', {
        name: 'Alpha Team',
        slug: 'alpha-team',
        description: 'Elite squad',
      });

      expect(teamRepository.findTeamBySlug).toHaveBeenCalledWith('alpha-team');
      expect(result.name).toBe('Alpha Team');
    });

    it('should throw error if slug already exists', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamBySlug).mockResolvedValue({
        id: 'team-1',
        slug: 'alpha-team',
      } as any);

      await expect(
        createTeam('user-1', {
          name: 'Alpha Team',
          slug: 'alpha-team',
        })
      ).rejects.toThrow('Team slug already exists');
    });
  });

  describe('getTeamById', () => {
    it('should return team by id', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        name: 'Alpha Team',
      } as any);

      const result = await getTeamById('team-1');

      expect(result.id).toBe('team-1');
    });

    it('should throw error if team not found', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue(null);

      await expect(getTeamById('team-1')).rejects.toThrow('Team not found');
    });
  });

  describe('updateTeam', () => {
    it('should update team if user is owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-1',
      } as any);
      vi.mocked(teamRepository.updateTeam).mockResolvedValue({
        id: 'team-1',
        name: 'Updated Name',
      } as any);

      const result = await updateTeam('user-1', {
        id: 'team-1',
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw error if user is not owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-2',
      } as any);

      await expect(
        updateTeam('user-1', { id: 'team-1', name: 'Updated' })
      ).rejects.toThrow('Unauthorized: Only owner can update team');
    });
  });

  describe('deleteTeam', () => {
    it('should delete team if user is owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-1',
      } as any);
      vi.mocked(teamRepository.deleteTeam).mockResolvedValue({
        id: 'team-1',
      } as any);

      const result = await deleteTeam('user-1', 'team-1');

      expect(teamRepository.deleteTeam).toHaveBeenCalledWith('team-1');
      expect(result.id).toBe('team-1');
    });
  });

  describe('addTeamMember', () => {
    it('should add member to team', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-1',
      } as any);
      vi.mocked(teamRepository.addMember).mockResolvedValue({
        id: 'member-1',
        name: 'John Doe',
        callsign: 'Ghost',
      } as any);

      const result = await addTeamMember('user-1', {
        teamId: 'team-1',
        name: 'John Doe',
        callsign: 'Ghost',
      });

      expect(result.callsign).toBe('Ghost');
    });
  });

  describe('transferOwnership', () => {
    it('should transfer ownership if current owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-1',
      } as any);
      vi.mocked(teamRepository.updateTeam).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-2',
      } as any);

      const result = await transferOwnership('user-1', {
        teamId: 'team-1',
        newOwnerId: 'user-2',
      });

      expect(result.ownerId).toBe('user-2');
    });

    it('should throw error if not owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-2',
      } as any);

      await expect(
        transferOwnership('user-1', {
          teamId: 'team-1',
          newOwnerId: 'user-3',
        })
      ).rejects.toThrow('Unauthorized: Only owner can transfer');
    });
  });

  describe('getTeamBySlug', () => {
    it('should return team by slug', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamBySlug).mockResolvedValue({
        id: 'team-1',
        slug: 'alpha-team',
        name: 'Alpha Team',
      } as any);

      const result = await getTeamBySlug('alpha-team');

      expect(result.slug).toBe('alpha-team');
      expect(result.name).toBe('Alpha Team');
    });

    it('should throw error if team not found', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamBySlug).mockResolvedValue(null);

      await expect(getTeamBySlug('invalid-slug')).rejects.toThrow(
        'Team not found'
      );
    });
  });

  describe('getUserTeams', () => {
    it('should return all teams for user', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findTeamsByOwner).mockResolvedValue([
        {
          id: 'team-1',
          name: 'Alpha Team',
          ownerId: 'user-1',
        } as any,
        {
          id: 'team-2',
          name: 'Bravo Team',
          ownerId: 'user-1',
        } as any,
      ]);

      const result = await getUserTeams('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alpha Team');
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member if user is owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findMemberById).mockResolvedValue({
        id: 'member-1',
        teamId: 'team-1',
      } as any);
      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-1',
      } as any);
      vi.mocked(teamRepository.updateMember).mockResolvedValue({
        id: 'member-1',
        name: 'Updated Name',
        role: 'CAPTAIN',
      } as any);

      const result = await updateTeamMember('user-1', {
        id: 'member-1',
        name: 'Updated Name',
        role: 'CAPTAIN',
      });

      expect(result.name).toBe('Updated Name');
      expect(result.role).toBe('CAPTAIN');
    });

    it('should throw error if member not found', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findMemberById).mockResolvedValue(null);

      await expect(
        updateTeamMember('user-1', { id: 'member-1', name: 'Test' })
      ).rejects.toThrow('Member not found');
    });

    it('should throw error if user is not owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findMemberById).mockResolvedValue({
        id: 'member-1',
        teamId: 'team-1',
      } as any);
      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-2',
      } as any);

      await expect(
        updateTeamMember('user-1', { id: 'member-1', name: 'Test' })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteTeamMember', () => {
    it('should delete team member if user is owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findMemberById).mockResolvedValue({
        id: 'member-1',
        teamId: 'team-1',
      } as any);
      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-1',
      } as any);
      vi.mocked(teamRepository.deleteMember).mockResolvedValue({
        id: 'member-1',
      } as any);

      const result = await deleteTeamMember('user-1', 'member-1');

      expect(teamRepository.deleteMember).toHaveBeenCalledWith('member-1');
      expect(result.id).toBe('member-1');
    });

    it('should throw error if member not found', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findMemberById).mockResolvedValue(null);

      await expect(deleteTeamMember('user-1', 'member-1')).rejects.toThrow(
        'Member not found'
      );
    });

    it('should throw error if user is not owner', async () => {
      const { teamRepository } = await import('@crafted/database');

      vi.mocked(teamRepository.findMemberById).mockResolvedValue({
        id: 'member-1',
        teamId: 'team-1',
      } as any);
      vi.mocked(teamRepository.findTeamById).mockResolvedValue({
        id: 'team-1',
        ownerId: 'user-2',
      } as any);

      await expect(deleteTeamMember('user-1', 'member-1')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });
});
