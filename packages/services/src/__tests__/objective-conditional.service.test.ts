import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkCondition } from '../objective.service';
import type { ConditionalConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

describe('Conditional Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkCondition', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'CONDITIONAL',
      title: 'Complete Prerequisites',
      description: 'Complete required objectives first',
      points: 200,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should complete when requireAll=true and all objectives completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: ConditionalConfig = {
        requiredObjectiveIds: ['obj-req-1', 'obj-req-2', 'obj-req-3'],
        requireAll: true,
        conditionDescription: 'Complete all three missions first',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'comp-1' } as any)
        .mockResolvedValueOnce({ id: 'comp-2' } as any)
        .mockResolvedValueOnce({ id: 'comp-3' } as any);

      vi.mocked(completionRepository.createCompletion).mockResolvedValue({
        id: 'completion-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        completedBy: null,
        latitude: null,
        longitude: null,
        deviceInfo: null,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await checkCondition({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.conditionMet).toBe(true);
      expect(result.totalCompleted).toBe(3);
      expect(result.totalRequired).toBe(3);
      expect(result.completion).toBeDefined();
      expect(result.points).toBe(200);
    });

    it('should not complete when requireAll=true and not all completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: ConditionalConfig = {
        requiredObjectiveIds: ['obj-req-1', 'obj-req-2', 'obj-req-3'],
        requireAll: true,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'comp-1' } as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'comp-2' } as any);

      const result = await checkCondition({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.conditionMet).toBe(false);
      expect(result.totalCompleted).toBe(2);
      expect(result.totalRequired).toBe(3);
      expect(result.requireAll).toBe(true);
    });

    it('should complete when requireAll=false and at least one completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: ConditionalConfig = {
        requiredObjectiveIds: ['obj-req-1', 'obj-req-2'],
        requireAll: false,
        conditionDescription: 'Complete any mission',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'comp-1' } as any)
        .mockResolvedValueOnce(null);

      vi.mocked(completionRepository.createCompletion).mockResolvedValue({
        id: 'completion-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        completedBy: null,
        latitude: null,
        longitude: null,
        deviceInfo: null,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await checkCondition({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.conditionMet).toBe(true);
      expect(result.totalCompleted).toBe(1);
      expect(result.totalRequired).toBe(2);
      expect(result.completion).toBeDefined();
      expect(result.points).toBe(200);
    });

    it('should not complete when requireAll=false and none completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: ConditionalConfig = {
        requiredObjectiveIds: ['obj-req-1', 'obj-req-2'],
        requireAll: false,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await checkCondition({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.conditionMet).toBe(false);
      expect(result.totalCompleted).toBe(0);
      expect(result.totalRequired).toBe(2);
      expect(result.requireAll).toBe(false);
    });

    it('should throw when objective already completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: ConditionalConfig = {
        requiredObjectiveIds: ['obj-req-1'],
        requireAll: true,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue({
        id: 'completion-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        completedBy: null,
        latitude: null,
        longitude: null,
        deviceInfo: null,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        checkCondition({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Objectif conditionnel deja complete');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        checkCondition({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not CONDITIONAL type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        checkCondition({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Conditionnel");
    });

    it('should throw when config is missing', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config: null,
      } as any);

      await expect(
        checkCondition({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Configuration conditionnelle manquante');
    });

    it('should throw when requiredObjectiveIds is missing', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config: { requireAll: true },
      } as any);

      await expect(
        checkCondition({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Objectifs requis manquants');
    });

    it('should throw when requireAll is invalid', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config: {
          requiredObjectiveIds: ['obj-req-1'],
          requireAll: 'invalid',
        },
      } as any);

      await expect(
        checkCondition({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Parametre requireAll invalide');
    });
  });
});
