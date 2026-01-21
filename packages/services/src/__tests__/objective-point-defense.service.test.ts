import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startDefense, completeDefense } from '../objective.service';
import type { PointDefenseConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
  gpsRepository: {
    findActiveCapture: vi.fn(),
    createCapture: vi.fn(),
    findCaptureById: vi.fn(),
    updateCapture: vi.fn(),
  },
}));

describe('Point Defense Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startDefense', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'POINT_DEFENSE',
      title: 'Defend the Point',
      description: 'Hold the position',
      points: 250,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should start defense successfully', async () => {
      const { objectiveRepository, completionRepository, gpsRepository } =
        await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
        defenseRules: 'Stay within the area',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(gpsRepository.findActiveCapture).mockResolvedValue(null);

      const mockDefense = {
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(gpsRepository.createCapture).mockResolvedValue(
        mockDefense as any
      );

      const result = await startDefense({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(result.defenseId).toBe('def-1');
      expect(result.durationMinutes).toBe(15);
      expect(result.radiusMeters).toBe(50);
      expect(result.defenseRules).toBe('Stay within the area');
    });

    it('should throw when defense already completed', async () => {
      const { objectiveRepository, completionRepository } =
        await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
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
        startDefense({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Defense deja completee par cette equipe');
    });

    it('should throw when defense already in progress', async () => {
      const { objectiveRepository, completionRepository, gpsRepository } =
        await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(gpsRepository.findActiveCapture).mockResolvedValue({
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt: new Date(),
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        startDefense({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Defense deja en cours pour cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        startDefense({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not POINT_DEFENSE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        startDefense({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Defense de Point");
    });
  });

  describe('completeDefense', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'POINT_DEFENSE',
      title: 'Defend the Point',
      description: 'Hold the position',
      points: 250,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should complete defense successfully', async () => {
      const {
        objectiveRepository,
        completionRepository,
        gpsRepository,
      } = await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 16 * 60 * 1000);

      const mockDefense = {
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue(
        mockDefense as any
      );

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(gpsRepository.updateCapture).mockResolvedValue({
        ...mockDefense,
        status: 'COMPLETED',
        completedAt: new Date(),
      } as any);

      vi.mocked(completionRepository.createCompletion).mockResolvedValue({
        id: 'completion-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        completedBy: null,
        latitude: 48.8566,
        longitude: 2.3522,
        deviceInfo: null,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await completeDefense({
        defenseId: 'def-1',
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(result.completion).toBeDefined();
      expect(result.points).toBe(250);
      expect(result.durationMinutes).toBeGreaterThanOrEqual(15);
    });

    it('should throw when defense not found', async () => {
      const { gpsRepository } = await import('@crafted/database');

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue(null);

      await expect(
        completeDefense({
          defenseId: 'def-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Defense non trouvee');
    });

    it('should throw when defense not in progress', async () => {
      const { gpsRepository } = await import('@crafted/database');

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'COMPLETED',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        completeDefense({
          defenseId: 'def-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Cette defense n est pas en cours');
    });

    it('should throw when duration not reached', async () => {
      const {
        objectiveRepository,
        gpsRepository,
      } = await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 5 * 60 * 1000);

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        completeDefense({
          defenseId: 'def-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Duree de defense non atteinte');
    });

    it('should throw when position too far', async () => {
      const {
        objectiveRepository,
        completionRepository,
        gpsRepository,
      } = await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 16 * 60 * 1000);

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      await expect(
        completeDefense({
          defenseId: 'def-1',
          latitude: 48.9566,
          longitude: 2.4522,
        })
      ).rejects.toThrow('Position trop eloignee du point de defense');
    });

    it('should throw when objective already completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
        gpsRepository,
      } = await import('@crafted/database');

      const config: PointDefenseConfig = {
        durationMinutes: 15,
        radiusMeters: 50,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      const startedAt = new Date(Date.now() - 16 * 60 * 1000);

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'def-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
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
        completeDefense({
          defenseId: 'def-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Defense deja completee par cette equipe');
    });
  });
});
