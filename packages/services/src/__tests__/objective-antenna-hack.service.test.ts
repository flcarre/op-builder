import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startAntennaHack, completeAntennaHack } from '../objective.service';
import type { AntennaHackConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
  sabotageRepository: {
    findActiveSabotage: vi.fn(),
    createSabotage: vi.fn(),
    findSabotageById: vi.fn(),
    updateSabotage: vi.fn(),
  },
}));

describe('Antenna Hack Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startAntennaHack', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'ANTENNA_HACK',
      title: 'Hack Communications Antenna',
      description: 'Infiltrate enemy communications',
      points: 250,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should start antenna hack successfully', async () => {
      const { objectiveRepository, completionRepository, sabotageRepository } =
        await import('@crafted/database');

      const config: AntennaHackConfig = {
        hackDurationMinutes: 15,
        hackInstructions: 'Connect to terminal and run exploit',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue(null);

      const mockHack = {
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(sabotageRepository.createSabotage).mockResolvedValue(
        mockHack as any
      );

      const result = await startAntennaHack({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.hackId).toBe('hack-1');
      expect(result.hackDurationMinutes).toBe(15);
      expect(result.startedAt).toBeDefined();
      expect(result.mustCompleteBy).toBeDefined();
      expect(result.hackInstructions).toBe('Connect to terminal and run exploit');
    });

    it('should throw when hack already completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: AntennaHackConfig = {
        hackDurationMinutes: 15,
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
        startAntennaHack({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Piratage deja complete par cette equipe');
    });

    it('should throw when hack already in progress', async () => {
      const { objectiveRepository, completionRepository, sabotageRepository } =
        await import('@crafted/database');

      const config: AntennaHackConfig = {
        hackDurationMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        startAntennaHack({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Piratage deja en cours pour cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        startAntennaHack({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not ANTENNA_HACK type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        startAntennaHack({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Piratage d'Antenne");
    });
  });

  describe('completeAntennaHack', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'ANTENNA_HACK',
      title: 'Hack Communications Antenna',
      description: 'Infiltrate enemy communications',
      points: 250,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should complete hack successfully', async () => {
      const {
        objectiveRepository,
        completionRepository,
        sabotageRepository,
      } = await import('@crafted/database');

      const config: AntennaHackConfig = {
        hackDurationMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 16 * 60 * 1000);

      const mockHack = {
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue(
        mockHack as any
      );

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(sabotageRepository.updateSabotage).mockResolvedValue({
        ...mockHack,
        status: 'COMPLETED',
        completedAt: new Date(),
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

      const result = await completeAntennaHack({
        hackId: 'hack-1',
      });

      expect(result.completion).toBeDefined();
      expect(result.points).toBe(250);
      expect(result.hackDurationMinutes).toBeGreaterThanOrEqual(15);
    });

    it('should throw when hack not found', async () => {
      const { sabotageRepository } = await import('@crafted/database');

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue(null);

      await expect(
        completeAntennaHack({
          hackId: 'hack-1',
        })
      ).rejects.toThrow('Piratage non trouve');
    });

    it('should throw when hack not in pending status', async () => {
      const { sabotageRepository } = await import('@crafted/database');

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        completeAntennaHack({
          hackId: 'hack-1',
        })
      ).rejects.toThrow('Ce piratage n est plus en attente');
    });

    it('should throw when duration not reached', async () => {
      const { objectiveRepository, sabotageRepository } =
        await import('@crafted/database');

      const config: AntennaHackConfig = {
        hackDurationMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 5 * 60 * 1000);

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        completeAntennaHack({
          hackId: 'hack-1',
        })
      ).rejects.toThrow("Le piratage n'est pas encore termine");
    });

    it('should throw when objective already completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
        sabotageRepository,
      } = await import('@crafted/database');

      const config: AntennaHackConfig = {
        hackDurationMinutes: 15,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 16 * 60 * 1000);

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        completeAntennaHack({
          hackId: 'hack-1',
        })
      ).rejects.toThrow('Piratage deja complete par cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository, sabotageRepository } =
        await import('@crafted/database');

      vi.mocked(sabotageRepository.findSabotageById).mockResolvedValue({
        id: 'hack-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        completeAntennaHack({
          hackId: 'hack-1',
        })
      ).rejects.toThrow('Objectif non trouve');
    });
  });
});
