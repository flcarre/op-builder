import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEnigma, answerEnigma } from '../objective.service';
import type { QrEnigmaConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

describe('QR Enigma Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEnigma', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'QR_ENIGMA',
      title: 'Enigme du Sphinx',
      description: 'Resolvez l enigme',
      points: 150,
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

    it('should return the enigma text', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Quelle creature marche a quatre pattes le matin, deux a midi, et trois le soir ?',
        answer: 'Homme',
        caseSensitive: false,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      const result = await getEnigma(mockInput);

      expect(result.enigma).toBe(config.enigma);
      expect(result.objectiveId).toBe('obj-1');
    });

    it('should throw when enigma already completed', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Question',
        answer: 'Réponse',
        caseSensitive: false,
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

      await expect(getEnigma(mockInput)).rejects.toThrow(
        'Enigme deja resolue par cette equipe'
      );
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(getEnigma(mockInput)).rejects.toThrow('Objectif non trouvé');
    });

    it('should throw when objective is not QR_ENIGMA type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(getEnigma(mockInput)).rejects.toThrow(
        "Cet objectif n'est pas de type QR Énigme"
      );
    });
  });

  describe('answerEnigma', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'QR_ENIGMA',
      title: 'Enigme du Sphinx',
      description: 'Resolvez l enigme',
      points: 150,
      campId: null,
      order: 0,
      qrCodeToken: 'token-123',
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should accept correct answer (case insensitive)', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Quelle est la capitale de la France ?',
        answer: 'Paris',
        caseSensitive: false,
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

      const result = await answerEnigma({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        answer: 'paris',
      });

      expect(result.correct).toBe(true);
      expect(result.completion).toBeDefined();
    });

    it('should accept correct answer (case sensitive)', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Code secret',
        answer: 'ALPHA123',
        caseSensitive: true,
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

      const result = await answerEnigma({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        answer: 'ALPHA123',
      });

      expect(result.correct).toBe(true);
      expect(result.completion).toBeDefined();
    });

    it('should reject incorrect answer (case insensitive)', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Quelle est la capitale de la France ?',
        answer: 'Paris',
        caseSensitive: false,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      await expect(
        answerEnigma({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          answer: 'Lyon',
        })
      ).rejects.toThrow('Réponse incorrecte');
    });

    it('should reject incorrect case (case sensitive)', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Code secret',
        answer: 'ALPHA123',
        caseSensitive: true,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      await expect(
        answerEnigma({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          answer: 'alpha123',
        })
      ).rejects.toThrow('Réponse incorrecte');
    });

    it('should throw when enigma already completed', async () => {
      const { objectiveRepository, completionRepository } = await import('@crafted/database');

      const config: QrEnigmaConfig = {
        enigma: 'Question',
        answer: 'Réponse',
        caseSensitive: false,
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
        answerEnigma({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          answer: 'Reponse',
        })
      ).rejects.toThrow('Enigme deja resolue par cette equipe');
    });
  });
});
