import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getOperationLeaderboard,
  getCampLeaderboard,
} from '../leaderboard.service';

vi.mock('@crafted/database', () => ({
  operationRepository: {
    findOperationById: vi.fn(),
  },
  prisma: {
    objectiveCompletion: {
      findMany: vi.fn(),
    },
    campTeam: {
      findUnique: vi.fn(),
    },
    camp: {
      findMany: vi.fn(),
    },
  },
}));

describe('Leaderboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOperationLeaderboard', () => {
    it('should return leaderboard with team rankings', async () => {
      const { operationRepository, prisma } = await import(
        '@crafted/database'
      );

      const mockOperation = {
        id: 'op-1',
        name: 'Operation Alpha',
        status: 'ACTIVE',
        operationTeams: [
          {
            id: 'ot-1',
            teamId: 'team-1',
            acceptedAt: new Date(),
            role: 'CREATOR',
            team: {
              name: 'Alpha Team',
              slug: 'alpha-team',
              color: '#3b82f6',
            },
          },
          {
            id: 'ot-2',
            teamId: 'team-2',
            acceptedAt: new Date(),
            role: 'VIEWER',
            team: {
              name: 'Bravo Team',
              slug: 'bravo-team',
              color: '#ef4444',
            },
          },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      vi.mocked(prisma.objectiveCompletion.findMany)
        .mockResolvedValueOnce([
          {
            id: 'c-1',
            objective: {
              id: 'obj-1',
              title: 'Capture Flag',
              points: 100,
              type: 'CAPTURE',
            },
            completedAt: new Date(),
          } as any,
        ])
        .mockResolvedValueOnce([
          {
            id: 'c-2',
            objective: {
              id: 'obj-2',
              title: 'Defend Base',
              points: 50,
              type: 'DEFEND',
            },
            completedAt: new Date(),
          } as any,
        ]);

      vi.mocked(prisma.campTeam.findUnique)
        .mockResolvedValueOnce({
          camp: {
            id: 'camp-1',
            name: 'Red Camp',
            color: '#ef4444',
          },
        } as any)
        .mockResolvedValueOnce(null);

      const result = await getOperationLeaderboard('op-1', 'team-1');

      expect(result.operation.id).toBe('op-1');
      expect(result.leaderboard).toHaveLength(2);
      expect(result.leaderboard[0].rank).toBe(1);
      expect(result.leaderboard[0].totalPoints).toBe(100);
      expect(result.leaderboard[1].rank).toBe(2);
      expect(result.leaderboard[1].totalPoints).toBe(50);
    });

    it('should throw error when operation not found', async () => {
      const { operationRepository } = await import('@crafted/database');

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(null);

      await expect(
        getOperationLeaderboard('invalid-id', 'team-1')
      ).rejects.toThrow('Operation not found');
    });

    it('should throw error when team not part of operation', async () => {
      const { operationRepository } = await import('@crafted/database');

      const mockOperation = {
        id: 'op-1',
        operationTeams: [
          {
            id: 'ot-1',
            teamId: 'other-team',
          },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      await expect(
        getOperationLeaderboard('op-1', 'team-1')
      ).rejects.toThrow('Unauthorized: Team not part of this operation');
    });
  });

  describe('getCampLeaderboard', () => {
    it('should return camp rankings', async () => {
      const { operationRepository, prisma } = await import(
        '@crafted/database'
      );

      const mockOperation = {
        id: 'op-1',
        name: 'Operation Alpha',
        status: 'ACTIVE',
        operationTeams: [
          {
            id: 'ot-1',
            teamId: 'team-1',
          },
        ],
      };

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(
        mockOperation as any
      );

      vi.mocked(prisma.camp.findMany).mockResolvedValue([
        {
          id: 'camp-1',
          name: 'Red Camp',
          color: '#ef4444',
          campTeams: [
            {
              operationTeamId: 'ot-1',
              operationTeam: {
                team: {
                  id: 'team-1',
                  name: 'Alpha Team',
                  slug: 'alpha-team',
                  color: '#3b82f6',
                },
              },
            },
          ],
        },
      ] as any);

      vi.mocked(prisma.objectiveCompletion.findMany).mockResolvedValue([
        {
          objective: { points: 100 },
        } as any,
      ]);

      const result = await getCampLeaderboard('op-1', 'team-1');

      expect(result.operation.id).toBe('op-1');
      expect(result.camps).toHaveLength(1);
      expect(result.camps[0].rank).toBe(1);
      expect(result.camps[0].totalPoints).toBe(100);
    });

    it('should throw error when operation not found', async () => {
      const { operationRepository } = await import('@crafted/database');

      vi.mocked(operationRepository.findOperationById).mockResolvedValue(null);

      await expect(
        getCampLeaderboard('invalid-id', 'team-1')
      ).rejects.toThrow('Operation not found');
    });
  });
});
