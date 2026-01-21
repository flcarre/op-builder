import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scanQrSimple } from '../objective.service';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

describe('QR Simple Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scanQrSimple', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'QR_SIMPLE',
      title: 'Scan QR Code',
      description: 'Simple QR code scan',
      points: 100,
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

    it('should scan QR code and create completion', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(
        mockObjective as any
      );

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

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

      const result = await scanQrSimple(mockInput);

      expect(result.completion).toBeDefined();
      expect(result.points).toBe(100);
    });

    it('should throw when QR code already scanned', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(
        mockObjective as any
      );

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

      await expect(scanQrSimple(mockInput)).rejects.toThrow(
        'QR code deja scanne par cette equipe'
      );
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(scanQrSimple(mockInput)).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not QR_SIMPLE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_ENIGMA',
      } as any);

      await expect(scanQrSimple(mockInput)).rejects.toThrow(
        "Cet objectif n'est pas de type QR Simple"
      );
    });
  });
});
