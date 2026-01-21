import { describe, it, expect, vi, beforeEach } from 'vitest';
import { teamRouter } from '../routers/team';
import type { Context } from '../trpc';

vi.mock('@crafted/services');

const mockContext: Context = {
  userId: 'user-1',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  },
};

describe('Team Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const { createTeam } = await import('@crafted/services');

      const mockTeam = {
        id: 'team-1',
        name: 'Alpha Team',
        slug: 'alpha-team',
        ownerId: 'user-1',
      };

      vi.mocked(createTeam).mockResolvedValue(mockTeam as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.create({
        name: 'Alpha Team',
        slug: 'alpha-team',
      });

      expect(createTeam).toHaveBeenCalledWith('user-1', {
        name: 'Alpha Team',
        slug: 'alpha-team',
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getById', () => {
    it('should get team by id', async () => {
      const { getTeamById } = await import('@crafted/services');

      const mockTeam = {
        id: 'team-1',
        name: 'Alpha Team',
      };

      vi.mocked(getTeamById).mockResolvedValue(mockTeam as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.getById({ id: 'team-1' });

      expect(getTeamById).toHaveBeenCalledWith('team-1');
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getBySlug', () => {
    it('should get team by slug', async () => {
      const { getTeamBySlug } = await import('@crafted/services');

      const mockTeam = {
        id: 'team-1',
        slug: 'alpha-team',
        name: 'Alpha Team',
      };

      vi.mocked(getTeamBySlug).mockResolvedValue(mockTeam as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.getBySlug({ slug: 'alpha-team' });

      expect(getTeamBySlug).toHaveBeenCalledWith('alpha-team');
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getUserTeams', () => {
    it('should get all teams for user', async () => {
      const { getUserTeams } = await import('@crafted/services');

      const mockTeams = [
        { id: 'team-1', name: 'Alpha Team', ownerId: 'user-1' },
        { id: 'team-2', name: 'Bravo Team', ownerId: 'user-1' },
      ];

      vi.mocked(getUserTeams).mockResolvedValue(mockTeams as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.getUserTeams();

      expect(getUserTeams).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockTeams);
    });
  });

  describe('update', () => {
    it('should update team', async () => {
      const { updateTeam } = await import('@crafted/services');

      const mockUpdatedTeam = {
        id: 'team-1',
        name: 'Updated Team',
      };

      vi.mocked(updateTeam).mockResolvedValue(mockUpdatedTeam as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.update({
        id: 'team-1',
        name: 'Updated Team',
      });

      expect(updateTeam).toHaveBeenCalledWith('user-1', {
        id: 'team-1',
        name: 'Updated Team',
      });
      expect(result).toEqual(mockUpdatedTeam);
    });
  });

  describe('delete', () => {
    it('should delete team', async () => {
      const { deleteTeam } = await import('@crafted/services');

      const mockDeletedTeam = {
        id: 'team-1',
      };

      vi.mocked(deleteTeam).mockResolvedValue(mockDeletedTeam as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.delete({ id: 'team-1' });

      expect(deleteTeam).toHaveBeenCalledWith('user-1', 'team-1');
      expect(result).toEqual(mockDeletedTeam);
    });
  });

  describe('addMember', () => {
    it('should add team member', async () => {
      const { addTeamMember } = await import('@crafted/services');

      const mockMember = {
        id: 'member-1',
        name: 'John Doe',
        callsign: 'Ghost',
        teamId: 'team-1',
      };

      vi.mocked(addTeamMember).mockResolvedValue(mockMember as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.addMember({
        teamId: 'team-1',
        name: 'John Doe',
        callsign: 'Ghost',
      });

      expect(addTeamMember).toHaveBeenCalledWith('user-1', {
        teamId: 'team-1',
        name: 'John Doe',
        callsign: 'Ghost',
      });
      expect(result).toEqual(mockMember);
    });
  });

  describe('updateMember', () => {
    it('should update team member', async () => {
      const { updateTeamMember } = await import('@crafted/services');

      const mockUpdatedMember = {
        id: 'member-1',
        name: 'Updated Name',
        role: 'CAPTAIN',
      };

      vi.mocked(updateTeamMember).mockResolvedValue(mockUpdatedMember as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.updateMember({
        id: 'member-1',
        name: 'Updated Name',
        role: 'CAPTAIN',
      });

      expect(updateTeamMember).toHaveBeenCalledWith('user-1', {
        id: 'member-1',
        name: 'Updated Name',
        role: 'CAPTAIN',
      });
      expect(result).toEqual(mockUpdatedMember);
    });
  });

  describe('deleteMember', () => {
    it('should delete team member', async () => {
      const { deleteTeamMember } = await import('@crafted/services');

      const mockDeletedMember = {
        id: 'member-1',
      };

      vi.mocked(deleteTeamMember).mockResolvedValue(mockDeletedMember as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.deleteMember({ id: 'member-1' });

      expect(deleteTeamMember).toHaveBeenCalledWith('user-1', 'member-1');
      expect(result).toEqual(mockDeletedMember);
    });
  });

  describe('transferOwnership', () => {
    it('should transfer team ownership', async () => {
      const { transferOwnership } = await import('@crafted/services');

      const mockTransferredTeam = {
        id: 'team-1',
        ownerId: 'user-2',
      };

      vi.mocked(transferOwnership).mockResolvedValue(mockTransferredTeam as any);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.transferOwnership({
        teamId: 'team-1',
        newOwnerId: 'user-2',
      });

      expect(transferOwnership).toHaveBeenCalledWith('user-1', {
        teamId: 'team-1',
        newOwnerId: 'user-2',
      });
      expect(result).toEqual(mockTransferredTeam);
    });
  });

  describe('getMemberQRCode', () => {
    it('should generate member QR code', async () => {
      const { generateMemberQRCode } = await import('@crafted/services');

      const mockQRCode = 'data:image/png;base64,qr-code-data';

      vi.mocked(generateMemberQRCode).mockResolvedValue(mockQRCode);

      const caller = teamRouter.createCaller(mockContext);

      const result = await caller.getMemberQRCode({
        token: 'member-token-123',
        baseUrl: 'https://example.com',
      });

      expect(generateMemberQRCode).toHaveBeenCalledWith(
        'member-token-123',
        'https://example.com'
      );
      expect(result).toBe(mockQRCode);
    });
  });
});
