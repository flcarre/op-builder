import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  collectItem,
  getCollectionProgress,
} from '../objective.service';
import type { ItemCollectionConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
  attemptRepository: {
    findAttemptsByOperationTeam: vi.fn(),
    createAttempt: vi.fn(),
  },
}));

describe('Item Collection Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('collectItem', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'ITEM_COLLECTION',
      title: 'Collect Items',
      description: 'Collect required items',
      points: 200,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should collect first item successfully', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
        itemsList: 'Batterie\nCarte SD\nAntenne',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(attemptRepository.findAttemptsByOperationTeam).mockResolvedValue(
        []
      );
      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({} as any);

      const result = await collectItem({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        itemName: 'Batterie',
      });

      expect(result.itemCollected).toBe('Batterie');
      expect(result.itemsCollected).toBe(1);
      expect(result.itemsRequired).toBe(3);
      expect(result.completed).toBe(false);
      expect(result.completion).toBeNull();
    });

    it('should complete objective when all items collected', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
        itemsList: 'Batterie\nCarte SD\nAntenne',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(
        attemptRepository.findAttemptsByOperationTeam
      ).mockResolvedValue([
        {
          id: 'att-1',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: 'Batterie',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'att-2',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: 'Carte SD',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({} as any);

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

      const result = await collectItem({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        itemName: 'Antenne',
      });

      expect(result.itemCollected).toBe('Antenne');
      expect(result.itemsCollected).toBe(3);
      expect(result.itemsRequired).toBe(3);
      expect(result.completed).toBe(true);
      expect(result.completion).toBeDefined();
      expect(result.points).toBe(200);
    });

    it('should reject duplicate item collection', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
        itemsList: 'Batterie\nCarte SD\nAntenne',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(
        attemptRepository.findAttemptsByOperationTeam
      ).mockResolvedValue([
        {
          id: 'att-1',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: 'Batterie',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      await expect(
        collectItem({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          itemName: 'Batterie',
        })
      ).rejects.toThrow('Cet item a deja ete collecte');
    });

    it('should reject invalid item not in list', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
        itemsList: 'Batterie\nCarte SD\nAntenne',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(attemptRepository.findAttemptsByOperationTeam).mockResolvedValue(
        []
      );

      await expect(
        collectItem({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          itemName: 'Invalid Item',
        })
      ).rejects.toThrow('Cet item ne fait pas partie de la liste');
    });

    it('should accept any item when list is not specified', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 2,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(attemptRepository.findAttemptsByOperationTeam).mockResolvedValue(
        []
      );
      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({} as any);

      const result = await collectItem({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        itemName: 'Any Item Name',
      });

      expect(result.itemCollected).toBe('Any Item Name');
      expect(result.itemsCollected).toBe(1);
    });

    it('should throw when objective already completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
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
        collectItem({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          itemName: 'Batterie',
        })
      ).rejects.toThrow('Objectif deja complete par cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        collectItem({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          itemName: 'Batterie',
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not ITEM_COLLECTION type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        collectItem({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          itemName: 'Batterie',
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Collecte d'Items");
    });
  });

  describe('getCollectionProgress', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'ITEM_COLLECTION',
      title: 'Collect Items',
      description: 'Collect required items',
      points: 200,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return progress with collected items', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(
        attemptRepository.findAttemptsByOperationTeam
      ).mockResolvedValue([
        {
          id: 'att-1',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: 'Batterie',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'att-2',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: 'Carte SD',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      const result = await getCollectionProgress({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.completed).toBe(false);
      expect(result.itemsCollected).toBe(2);
      expect(result.itemsRequired).toBe(3);
      expect(result.collectedItemNames).toEqual(['Batterie', 'Carte SD']);
    });

    it('should return completed status when objective is done', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: ItemCollectionConfig = {
        itemsRequired: 3,
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

      const result = await getCollectionProgress({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.completed).toBe(true);
      expect(result.itemsCollected).toBe(3);
      expect(result.itemsRequired).toBe(3);
    });
  });
});
