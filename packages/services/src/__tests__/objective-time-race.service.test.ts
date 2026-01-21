import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startTimeRace, validateCheckpoint } from '../objective.service';
import type { TimeRaceConfig } from '@crafted/validators';

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
    updateSabotage: vi.fn(),
  },
  attemptRepository: {
    findAttemptsByOperationTeam: vi.fn(),
    createAttempt: vi.fn(),
  },
}));

describe('Time Race Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startTimeRace', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'TIME_RACE',
      title: 'Checkpoint Race',
      description: 'Complete all checkpoints in time',
      points: 300,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should start race successfully', async () => {
      const { objectiveRepository, completionRepository, sabotageRepository } =
        await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 5,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue(null);

      const mockRace = {
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(sabotageRepository.createSabotage).mockResolvedValue(
        mockRace as any
      );

      const result = await startTimeRace({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.raceId).toBe('race-1');
      expect(result.timeLimit).toBe(30);
      expect(result.checkpointsCount).toBe(5);
      expect(result.startedAt).toBeDefined();
      expect(result.deadline).toBeDefined();
    });

    it('should throw when race already completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 5,
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
        startTimeRace({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Course deja completee par cette equipe');
    });

    it('should throw when race already in progress', async () => {
      const { objectiveRepository, completionRepository, sabotageRepository } =
        await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 5,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        startTimeRace({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Course deja en cours pour cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        startTimeRace({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not TIME_RACE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        startTimeRace({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Course Contre la Montre");
    });
  });

  describe('validateCheckpoint', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'TIME_RACE',
      title: 'Checkpoint Race',
      description: 'Complete all checkpoints in time',
      points: 300,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate first checkpoint successfully', async () => {
      const {
        objectiveRepository,
        completionRepository,
        sabotageRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      const startedAt = new Date(Date.now() - 5 * 60 * 1000);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(attemptRepository.findAttemptsByOperationTeam).mockResolvedValue(
        []
      );

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: '1',
        success: true,
        attemptedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await validateCheckpoint({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        checkpointNumber: 1,
      });

      expect(result.checkpointValidated).toBe(1);
      expect(result.totalValidated).toBe(1);
      expect(result.totalCheckpoints).toBe(3);
      expect(result.completed).toBe(false);
      expect(result.completion).toBeNull();
      expect(result.points).toBe(0);
    });

    it('should complete race when all checkpoints validated', async () => {
      const {
        objectiveRepository,
        completionRepository,
        sabotageRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      const startedAt = new Date(Date.now() - 10 * 60 * 1000);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(
        attemptRepository.findAttemptsByOperationTeam
      ).mockResolvedValue([
        {
          id: 'attempt-1',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: '1',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'attempt-2',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: '2',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-3',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: '3',
        success: true,
        attemptedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(sabotageRepository.updateSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'COMPLETED',
        startedAt,
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

      const result = await validateCheckpoint({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        checkpointNumber: 3,
      });

      expect(result.checkpointValidated).toBe(3);
      expect(result.totalValidated).toBe(3);
      expect(result.totalCheckpoints).toBe(3);
      expect(result.completed).toBe(true);
      expect(result.completion).toBeDefined();
      expect(result.points).toBe(300);
    });

    it('should throw when race not started', async () => {
      const { objectiveRepository, completionRepository, sabotageRepository } =
        await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue(null);

      await expect(
        validateCheckpoint({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          checkpointNumber: 1,
        })
      ).rejects.toThrow('Course non demarree');
    });

    it('should throw when time limit exceeded', async () => {
      const {
        objectiveRepository,
        completionRepository,
        sabotageRepository,
      } = await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      const startedAt = new Date(Date.now() - 35 * 60 * 1000);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(sabotageRepository.updateSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'DEFUSED',
        startedAt,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        validateCheckpoint({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          checkpointNumber: 1,
        })
      ).rejects.toThrow('Temps ecoule');
    });

    it('should throw when checkpoint out of order', async () => {
      const {
        objectiveRepository,
        completionRepository,
        sabotageRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      const startedAt = new Date(Date.now() - 5 * 60 * 1000);

      vi.mocked(sabotageRepository.findActiveSabotage).mockResolvedValue({
        id: 'race-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'PENDING',
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(
        attemptRepository.findAttemptsByOperationTeam
      ).mockResolvedValue([
        {
          id: 'attempt-1',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: '1',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      await expect(
        validateCheckpoint({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          checkpointNumber: 3,
        })
      ).rejects.toThrow('Checkpoint invalide, validez dans l ordre');
    });

    it('should throw when race already completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: TimeRaceConfig = {
        timeLimit: 30,
        checkpointsCount: 3,
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
        validateCheckpoint({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          checkpointNumber: 1,
        })
      ).rejects.toThrow('Course deja completee par cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        validateCheckpoint({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          checkpointNumber: 1,
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not TIME_RACE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        validateCheckpoint({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          checkpointNumber: 1,
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Course Contre la Montre");
    });
  });
});
