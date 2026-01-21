import { describe, it, expect, vi, beforeEach } from 'vitest';
import { operationRouter } from '../routers/operation';
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

describe('Operation Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new operation', async () => {
      const { createOperation } = await import('@crafted/services');

      const mockOperation = {
        id: 'op-1',
        name: 'Operation Alpha',
        creatorTeamId: 'team-1',
        date: new Date('2025-12-01'),
        duration: 180,
      };

      vi.mocked(createOperation).mockResolvedValue(mockOperation as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.create({
        teamId: 'team-1',
        name: 'Operation Alpha',
        date: new Date('2025-12-01'),
        endDate: new Date('2025-12-01T03:00:00'),
      });

      expect(createOperation).toHaveBeenCalledWith('team-1', {
        name: 'Operation Alpha',
        date: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(result).toEqual(mockOperation);
    });
  });

  describe('getById', () => {
    it('should get operation by id', async () => {
      const { getOperationById } = await import('@crafted/services');

      const mockOperation = {
        id: 'op-1',
        name: 'Operation Alpha',
      };

      vi.mocked(getOperationById).mockResolvedValue(mockOperation as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.getById({ id: 'op-1', teamId: 'team-1' });

      expect(getOperationById).toHaveBeenCalledWith('op-1', 'team-1');
      expect(result).toEqual(mockOperation);
    });
  });

  describe('getByTeam', () => {
    it('should get all operations for team', async () => {
      const { getOperationsByTeam } = await import('@crafted/services');

      const mockOperations = [
        { id: 'op-1', name: 'Operation Alpha' },
        { id: 'op-2', name: 'Operation Bravo' },
      ];

      vi.mocked(getOperationsByTeam).mockResolvedValue(mockOperations as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.getByTeam({ teamId: 'team-1' });

      expect(getOperationsByTeam).toHaveBeenCalledWith('team-1');
      expect(result).toEqual(mockOperations);
    });
  });

  describe('update', () => {
    it('should update operation', async () => {
      const { updateOperation } = await import('@crafted/services');

      const mockUpdatedOperation = {
        id: 'op-1',
        name: 'Updated Operation',
      };

      vi.mocked(updateOperation).mockResolvedValue(
        mockUpdatedOperation as any
      );

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.update({
        teamId: 'team-1',
        id: 'op-1',
        name: 'Updated Operation',
      });

      expect(updateOperation).toHaveBeenCalledWith('team-1', {
        id: 'op-1',
        name: 'Updated Operation',
      });
      expect(result).toEqual(mockUpdatedOperation);
    });
  });

  describe('delete', () => {
    it('should delete operation', async () => {
      const { deleteOperation } = await import('@crafted/services');

      const mockDeletedOperation = {
        id: 'op-1',
      };

      vi.mocked(deleteOperation).mockResolvedValue(
        mockDeletedOperation as any
      );

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.delete({ id: 'op-1', teamId: 'team-1' });

      expect(deleteOperation).toHaveBeenCalledWith('team-1', 'op-1');
      expect(result).toEqual(mockDeletedOperation);
    });
  });

  describe('inviteTeam', () => {
    it('should invite team to operation', async () => {
      const { inviteTeamToOperation } = await import('@crafted/services');

      const mockInvite = {
        id: 'ot-1',
        operationId: 'op-1',
        teamId: 'team-2',
        role: 'VIEWER',
      };

      vi.mocked(inviteTeamToOperation).mockResolvedValue(mockInvite as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.inviteTeam({
        actingTeamId: 'team-1',
        operationId: 'op-1',
        teamId: 'team-2',
        role: 'VIEWER',
      });

      expect(inviteTeamToOperation).toHaveBeenCalledWith('team-1', {
        operationId: 'op-1',
        teamId: 'team-2',
        role: 'VIEWER',
      });
      expect(result).toEqual(mockInvite);
    });
  });

  describe('updateTeamRole', () => {
    it('should update team role', async () => {
      const { updateTeamRole } = await import('@crafted/services');

      const mockUpdatedRole = {
        id: 'ot-1',
        role: 'CO_ADMIN',
      };

      vi.mocked(updateTeamRole).mockResolvedValue(mockUpdatedRole as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.updateTeamRole({
        actingTeamId: 'team-1',
        id: 'ot-1',
        role: 'CO_ADMIN',
      });

      expect(updateTeamRole).toHaveBeenCalledWith('team-1', {
        id: 'ot-1',
        role: 'CO_ADMIN',
      });
      expect(result).toEqual(mockUpdatedRole);
    });
  });

  describe('removeTeam', () => {
    it('should remove team from operation', async () => {
      const { removeTeamFromOperation } = await import('@crafted/services');

      const mockRemoved = {
        id: 'ot-1',
      };

      vi.mocked(removeTeamFromOperation).mockResolvedValue(mockRemoved as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.removeTeam({
        id: 'ot-1',
        actingTeamId: 'team-1',
      });

      expect(removeTeamFromOperation).toHaveBeenCalledWith('team-1', 'ot-1');
      expect(result).toEqual(mockRemoved);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation', async () => {
      const { acceptInvitation } = await import('@crafted/services');

      const mockAccepted = {
        id: 'ot-1',
        acceptedAt: new Date(),
      };

      vi.mocked(acceptInvitation).mockResolvedValue(mockAccepted as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.acceptInvitation({
        actingTeamId: 'team-1',
        operationId: 'op-1',
        teamId: 'team-1',
      });

      expect(acceptInvitation).toHaveBeenCalledWith('team-1', {
        operationId: 'op-1',
        teamId: 'team-1',
      });
      expect(result).toEqual(mockAccepted);
    });
  });

  describe('publish', () => {
    it('should publish operation', async () => {
      const { publishOperation } = await import('@crafted/services');

      const mockPublished = {
        id: 'op-1',
        status: 'PUBLISHED',
      };

      vi.mocked(publishOperation).mockResolvedValue(mockPublished as any);

      const caller = operationRouter.createCaller(mockContext);

      const result = await caller.publish({ id: 'op-1', teamId: 'team-1' });

      expect(publishOperation).toHaveBeenCalledWith('team-1', 'op-1');
      expect(result).toEqual(mockPublished);
    });
  });
});
