import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scanVip } from '../objective.service';
import type { VipEliminationConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  operationRepository: {
    findOperationById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

describe('VIP Elimination Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scanVip', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'VIP_ELIMINATION',
      title: 'Capitaine Alpha',
      description: 'Commandant de l\'équipe Rouge',
      points: 500,
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

    it('should scan VIP and reveal secret info', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: VipEliminationConfig = {
        secretInfo: 'La cible se trouve aux coordonnées GPS: 48.8566, 2.3522',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

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

      const result = await scanVip(mockInput);

      expect(result.completion).toBeDefined();
      expect(result.secretInfo).toBe(config.secretInfo);
      expect(completionRepository.createCompletion).toHaveBeenCalledWith({
        objective: { connect: { id: 'obj-1' } },
        operationTeam: { connect: { id: 'team-1' } },
      });
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(scanVip(mockInput)).rejects.toThrow('Objectif non trouvé');
    });

    it('should throw when objective is not VIP_ELIMINATION type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(scanVip(mockInput)).rejects.toThrow(
        "Cet objectif n'est pas de type VIP"
      );
    });

    it('should throw when config is invalid', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config: null,
      } as any);

      await expect(scanVip(mockInput)).rejects.toThrow(
        'Configuration de l\'objectif invalide'
      );
    });

    it('should throw when VIP already scanned', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: VipEliminationConfig = {
        secretInfo: 'Informations secrètes',
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

      await expect(scanVip(mockInput)).rejects.toThrow(
        'VIP déjà scanné par cette équipe'
      );
    });
  });
});
