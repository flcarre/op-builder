import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startSabotage, completeSabotage } from '../objective.service';
import type { TimedSabotageConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  operationRepository: {
    findOperationById: vi.fn(),
  },
  sabotageRepository: {
    findActiveSabotage: vi.fn(),
    createSabotage: vi.fn(),
    findSabotageById: vi.fn(),
    updateSabotage: vi.fn(),
  },
  completionRepository: {
    createCompletion: vi.fn(),
  },
}));

describe('Timed Sabotage Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startSabotage', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'TIMED_SABOTAGE',
      title: 'Sabotage du générateur',
      description: 'Placer la bombe sur le générateur',
      points: 300,
      campId: null,
      order: 0,
      qrCodeToken: 'token-123',
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockInput = {
      objectiveId: 'obj-1',
      operationTeamId: 'team-1',
    };

    it('should start sabotage timer', async () => {
      const {
        objectiveRepository,
        sabotageRepository,
      } = await import('@crafted/database');

      const config: TimedSabotageConfig = {
        delayMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue(null);

      vi.mocked(sabotageRepository.createSabotage).mockResolvedValue({
        id: 'sabotage-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await startSabotage(mockInput);

      expect(result.sabotage).toBeDefined();
      expect(result.delayMinutes).toBe(15);
      expect(sabotageRepository.createSabotage).toHaveBeenCalledWith({
        objective: { connect: { id: 'obj-1' } },
        operationTeam: { connect: { id: 'team-1' } },
        status: 'PENDING',
      });
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(startSabotage(mockInput)).rejects.toThrow(
        'Objectif non trouvé'
      );
    });

    it('should throw when objective is not TIMED_SABOTAGE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(startSabotage(mockInput)).rejects.toThrow(
        "Cet objectif n'est pas de type Sabotage Temporisé"
      );
    });

    it('should throw when sabotage already in progress', async () => {
      const {
        objectiveRepository,
        sabotageRepository,
      } = await import('@crafted/database');

      const config: TimedSabotageConfig = {
        delayMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'sabotage-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(startSabotage(mockInput)).rejects.toThrow(
        'Un sabotage est déjà en cours pour cette équipe'
      );
    });
  });

  describe('completeSabotage', () => {
    it('should complete sabotage after delay', async () => {
      const {
        sabotageRepository,
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const startTime = new Date(Date.now() - 20 * 60 * 1000);

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'sabotage-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: startTime,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const config: TimedSabotageConfig = {
        delayMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        id: 'obj-1',
        operationId: 'op-1',
        type: 'TIMED_SABOTAGE',
        title: 'Sabotage',
        config,
      } as any);

      vi.mocked(sabotageRepository.updateSabotage).mockResolvedValue({
        id: 'sabotage-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'COMPLETED',
        startedAt: startTime,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

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

      const result = await completeSabotage({ sabotageId: 'sabotage-1' });

      expect(result.sabotage.status).toBe('COMPLETED');
      expect(result.completion).toBeDefined();
    });

    it('should throw when delay not elapsed', async () => {
      const {
        sabotageRepository,
        objectiveRepository,
      } = await import('@crafted/database');

      const startTime = new Date(Date.now() - 5 * 60 * 1000);

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'sabotage-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: startTime,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const config: TimedSabotageConfig = {
        delayMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        id: 'obj-1',
        operationId: 'op-1',
        type: 'TIMED_SABOTAGE',
        title: 'Sabotage',
        config,
      } as any);

      await expect(
        completeSabotage({ sabotageId: 'sabotage-1' })
      ).rejects.toThrow("Le délai n'est pas encore écoulé");
    });

    it('should throw when sabotage not found', async () => {
      const { sabotageRepository } = await import('@crafted/database');

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue(null);

      await expect(
        completeSabotage({ sabotageId: 'invalid-id' })
      ).rejects.toThrow('Sabotage non trouvé');
    });

    it('should throw when sabotage not pending', async () => {
      const { sabotageRepository } = await import('@crafted/database');

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'sabotage-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        completeSabotage({ sabotageId: 'sabotage-1' })
      ).rejects.toThrow("Ce sabotage n'est plus en attente");
    });
  });
});
