import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startGPSCapture, completeGPSCapture } from '../objective.service';
import type { GPSCaptureConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  operationRepository: {
    findOperationById: vi.fn(),
  },
  gpsRepository: {
    findActiveCapture: vi.fn(),
    createCapture: vi.fn(),
    findCaptureById: vi.fn(),
    updateCapture: vi.fn(),
  },
  completionRepository: {
    createCompletion: vi.fn(),
  },
}));

describe('GPS Capture Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startGPSCapture', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'GPS_CAPTURE',
      title: 'Zone Alpha',
      description: 'Capturer la zone principale',
      points: 200,
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
      latitude: 48.8566,
      longitude: 2.3522,
    };

    it('should start GPS capture when in range', async () => {
      const {
        objectiveRepository,
        gpsRepository,
      } = await import('@crafted/database');

      const config: GPSCaptureConfig = {
        latitude: 48.8566,
        longitude: 2.3522,
        radiusMeters: 100,
        durationMinutes: 10,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(gpsRepository.findActiveCapture).mockResolvedValue(null);

      vi.mocked(gpsRepository.createCapture).mockResolvedValue({
        id: 'capture-1',
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

      const result = await startGPSCapture(mockInput);

      expect(result.capture).toBeDefined();
      expect(result.durationMinutes).toBe(10);
      expect(result.radiusMeters).toBe(100);
    });

    it('should throw when too far from zone', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      const config: GPSCaptureConfig = {
        latitude: 48.8566,
        longitude: 2.3522,
        radiusMeters: 50,
        durationMinutes: 10,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      await expect(
        startGPSCapture({
          ...mockInput,
          latitude: 49.0000,
          longitude: 2.5000,
        })
      ).rejects.toThrow('Vous êtes trop loin de la zone');
    });

    it('should throw when capture already in progress', async () => {
      const {
        objectiveRepository,
        gpsRepository,
      } = await import('@crafted/database');

      const config: GPSCaptureConfig = {
        latitude: 48.8566,
        longitude: 2.3522,
        radiusMeters: 100,
        durationMinutes: 10,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(gpsRepository.findActiveCapture).mockResolvedValue({
        id: 'capture-1',
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

      await expect(startGPSCapture(mockInput)).rejects.toThrow(
        'Une capture est déjà en cours pour cette équipe'
      );
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(startGPSCapture(mockInput)).rejects.toThrow(
        'Objectif non trouvé'
      );
    });

    it('should throw when objective is not GPS_CAPTURE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(startGPSCapture(mockInput)).rejects.toThrow(
        "Cet objectif n'est pas de type Capture GPS"
      );
    });
  });

  describe('completeGPSCapture', () => {
    it('should complete GPS capture after required duration', async () => {
      const {
        gpsRepository,
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const startTime = new Date(Date.now() - 15 * 60 * 1000);

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'capture-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt: startTime,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const config: GPSCaptureConfig = {
        latitude: 48.8566,
        longitude: 2.3522,
        radiusMeters: 100,
        durationMinutes: 10,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        id: 'obj-1',
        type: 'GPS_CAPTURE',
        config,
      } as any);

      vi.mocked(gpsRepository.updateCapture).mockResolvedValue({
        id: 'capture-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'COMPLETED',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
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

      const result = await completeGPSCapture({
        captureId: 'capture-1',
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(result.capture.status).toBe('COMPLETED');
      expect(result.completion).toBeDefined();
    });

    it('should throw when duration not elapsed', async () => {
      const {
        gpsRepository,
        objectiveRepository,
      } = await import('@crafted/database');

      const startTime = new Date(Date.now() - 5 * 60 * 1000);

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'capture-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt: startTime,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const config: GPSCaptureConfig = {
        latitude: 48.8566,
        longitude: 2.3522,
        radiusMeters: 100,
        durationMinutes: 10,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        id: 'obj-1',
        type: 'GPS_CAPTURE',
        config,
      } as any);

      await expect(
        completeGPSCapture({
          captureId: 'capture-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow("La durée requise n'est pas atteinte");
    });

    it('should throw when moved out of zone', async () => {
      const {
        gpsRepository,
        objectiveRepository,
      } = await import('@crafted/database');

      const startTime = new Date(Date.now() - 15 * 60 * 1000);

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'capture-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        status: 'IN_PROGRESS',
        startLatitude: 48.8566,
        startLongitude: 2.3522,
        startedAt: startTime,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const config: GPSCaptureConfig = {
        latitude: 48.8566,
        longitude: 2.3522,
        radiusMeters: 100,
        durationMinutes: 10,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        id: 'obj-1',
        type: 'GPS_CAPTURE',
        config,
      } as any);

      await expect(
        completeGPSCapture({
          captureId: 'capture-1',
          latitude: 49.0000,
          longitude: 2.5000,
        })
      ).rejects.toThrow('Vous êtes sorti de la zone');
    });

    it('should throw when capture not found', async () => {
      const { gpsRepository } = await import('@crafted/database');

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue(null);

      await expect(
        completeGPSCapture({
          captureId: 'invalid-id',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow('Capture non trouvée');
    });

    it('should throw when capture not in progress', async () => {
      const { gpsRepository } = await import('@crafted/database');

      vi.mocked(gpsRepository.findCaptureById).mockResolvedValue({
        id: 'capture-1',
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
        completeGPSCapture({
          captureId: 'capture-1',
          latitude: 48.8566,
          longitude: 2.3522,
        })
      ).rejects.toThrow("Cette capture n'est plus en cours");
    });
  });
});
