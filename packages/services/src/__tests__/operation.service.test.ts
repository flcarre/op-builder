import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createOperation,
  getOperationById,
  getOperationsByTeam,
  updateOperation,
  deleteOperation,
  inviteTeamToOperation,
  updateTeamRole,
  removeTeamFromOperation,
  acceptInvitation,
  publishOperation,
  startOperation,
  completeOperation,
  cancelOperation,
  reopenOperation,
} from '../operation.service';

vi.mock('@crafted/database', () => ({
  operationRepository: {
    createOperation: vi.fn(),
    findOperationById: vi.fn(),
    findOperationsByTeam: vi.fn(),
    updateOperation: vi.fn(),
    deleteOperation: vi.fn(),
    inviteTeamToOperation: vi.fn(),
    findOperationTeam: vi.fn(),
    updateOperationTeam: vi.fn(),
    removeTeamFromOperation: vi.fn(),
  },
}));

describe('Operation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOperation', () => {
    it('should create operation and invite creator team', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        name: 'Operation Alpha',
        date: new Date('2025-12-01'),
        endDate: new Date('2025-12-01T03:00:00'),
        creatorTeamId: 'team-1',
        status: 'DRAFT',
      };

      vi.mocked(operationRepository.createOperation).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.inviteTeamToOperation).mockResolvedValue({
        id: 'ot-1',
        operationId: 'op-1',
        teamId: 'team-1',
        role: 'CREATOR',
      } as any);

      const result = await createOperation('team-1', {
        name: 'Operation Alpha',
        date: new Date('2025-12-01'),
        endDate: new Date('2025-12-01T03:00:00'),
      });

      expect(operationRepository.createOperation).toHaveBeenCalled();
      expect(operationRepository.inviteTeamToOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'CREATOR',
          acceptedAt: expect.any(Date),
        })
      );
      expect(result.id).toBe('op-1');
    });
  });

  describe('getOperationById', () => {
    it('should return operation if team has access', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        name: 'Operation Alpha',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      const result = await getOperationById('op-1', 'team-1');

      expect(result.id).toBe('op-1');
    });

    it('should throw error if operation not found', async () => {
      const { operationRepository } = await import('@crafted/database');

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(null);

      await expect(getOperationById('op-1', 'team-1')).rejects.toThrow(
        'Operation not found'
      );
    });

    it('should throw error if team has no access', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-2',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-2', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(getOperationById('op-1', 'team-1')).rejects.toThrow(
        'Unauthorized: Team not part of this operation'
      );
    });
  });

  describe('getOperationsByTeam', () => {
    it('should return all operations for team', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperations = [
        { id: 'op-1', name: 'Operation Alpha' },
        { id: 'op-2', name: 'Operation Bravo' },
      ];

      vi.mocked(operationRepository.findOperationsByTeam).mockResolvedValue(
        mockOperations as any
      );

      const result = await getOperationsByTeam('team-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Operation Alpha');
    });
  });

  describe('updateOperation', () => {
    it('should update operation if team is creator or co-admin', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.updateOperation).mockResolvedValue({
        id: 'op-1',
        name: 'Updated Name',
      } as any);

      const result = await updateOperation('team-1', {
        id: 'op-1',
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw error if team is viewer', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-2',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'VIEWER' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(
        updateOperation('team-1', { id: 'op-1', name: 'Test' })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteOperation', () => {
    it('should delete operation if team is creator', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.deleteOperation).mockResolvedValue({
        id: 'op-1',
      } as any);

      const result = await deleteOperation('team-1', 'op-1');

      expect(result.id).toBe('op-1');
    });

    it('should throw error if team is not creator', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-2',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CO_ADMIN' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(deleteOperation('team-1', 'op-1')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('inviteTeamToOperation', () => {
    it('should invite team to operation', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.findOperationTeam).mockResolvedValue(null);
      vi.mocked(operationRepository.inviteTeamToOperation).mockResolvedValue({
        id: 'ot-2',
        operationId: 'op-1',
        teamId: 'team-2',
        role: 'VIEWER',
      } as any);

      const result = await inviteTeamToOperation('team-1', {
        operationId: 'op-1',
        teamId: 'team-2',
        role: 'VIEWER',
      });

      expect(result.teamId).toBe('team-2');
      expect(result.role).toBe('VIEWER');
    });

    it('should throw error if team already invited', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.findOperationTeam).mockResolvedValue({
        id: 'ot-2',
      } as any);

      await expect(
        inviteTeamToOperation('team-1', {
          operationId: 'op-1',
          teamId: 'team-2',
          role: 'VIEWER',
        })
      ).rejects.toThrow('Team already invited to this operation');
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation', async () => {
      const { operationRepository } = await import('@crafted/database');

      vi.mocked(operationRepository.findOperationTeam).mockResolvedValue({
        id: 'ot-1',
        operationId: 'op-1',
        teamId: 'team-1',
        acceptedAt: null,
      } as any);
      vi.mocked(operationRepository.updateOperationTeam).mockResolvedValue({
        id: 'ot-1',
        acceptedAt: new Date(),
      } as any);

      const result = await acceptInvitation('team-1', {
        operationId: 'op-1',
        teamId: 'team-1',
      });

      expect(result.acceptedAt).toBeDefined();
    });

    it('should throw error if invitation not found', async () => {
      const { operationRepository } = await import('@crafted/database');

      vi.mocked(operationRepository.findOperationTeam).mockResolvedValue(null);

      await expect(
        acceptInvitation('team-1', {
          operationId: 'op-1',
          teamId: 'team-1',
        })
      ).rejects.toThrow('Invitation not found');
    });

    it('should throw error if already accepted', async () => {
      const { operationRepository } = await import('@crafted/database');

      vi.mocked(operationRepository.findOperationTeam).mockResolvedValue({
        id: 'ot-1',
        teamId: 'team-1',
        acceptedAt: new Date(),
      } as any);

      await expect(
        acceptInvitation('team-1', {
          operationId: 'op-1',
          teamId: 'team-1',
        })
      ).rejects.toThrow('Invitation already accepted');
    });
  });

  describe('publishOperation', () => {
    it('should publish operation from draft', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'DRAFT',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.updateOperation).mockResolvedValue({
        id: 'op-1',
        status: 'PUBLISHED',
      } as any);

      const result = await publishOperation('team-1', 'op-1');

      expect(result.status).toBe('PUBLISHED');
    });

    it('should throw error if not draft', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'PUBLISHED',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(publishOperation('team-1', 'op-1')).rejects.toThrow(
        'Can only publish operations in DRAFT status'
      );
    });
  });

  describe('startOperation', () => {
    it('should start a published operation', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'PUBLISHED',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.updateOperation).mockResolvedValue({
        ...mockOperation,
        status: 'ACTIVE',
      } as any);

      const result = await startOperation('team-1', 'op-1');

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw error if not published', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'DRAFT',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(startOperation('team-1', 'op-1')).rejects.toThrow(
        'Can only start operations in PUBLISHED status'
      );
    });
  });

  describe('completeOperation', () => {
    it('should complete an active operation', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'ACTIVE',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.updateOperation).mockResolvedValue({
        ...mockOperation,
        status: 'COMPLETED',
      } as any);

      const result = await completeOperation('team-1', 'op-1');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw error if not active', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'PUBLISHED',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(completeOperation('team-1', 'op-1')).rejects.toThrow(
        'Can only complete operations in ACTIVE status'
      );
    });
  });

  describe('cancelOperation', () => {
    it('should cancel an operation', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'ACTIVE',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.updateOperation).mockResolvedValue({
        ...mockOperation,
        status: 'CANCELLED',
      } as any);

      const result = await cancelOperation('team-1', 'op-1');

      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('reopenOperation', () => {
    it('should reopen a completed operation', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'COMPLETED',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );
      vi.mocked(operationRepository.updateOperation).mockResolvedValue({
        ...mockOperation,
        status: 'ACTIVE',
      } as any);

      const result = await reopenOperation('team-1', 'op-1');

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw error if not completed', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        status: 'ACTIVE',
        creatorTeamId: 'team-1',
        operationTeams: [
          { id: 'ot-1', teamId: 'team-1', role: 'CREATOR' },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(reopenOperation('team-1', 'op-1')).rejects.toThrow(
        'Can only reopen operations in COMPLETED status'
      );
    });
  });
});
