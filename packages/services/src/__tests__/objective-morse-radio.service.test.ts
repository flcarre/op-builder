import { describe, it, expect, beforeEach, vi } from 'vitest';
import { decodeMorse } from '../objective.service';
import type { MorseRadioConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

describe('Morse Radio Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decodeMorse', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'MORSE_RADIO',
      title: 'Decode Morse Message',
      description: 'Decode the morse code',
      points: 150,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should accept correct decoded message', async () => {
      const { objectiveRepository, completionRepository } = await import(
        '@crafted/database'
      );

      const config: MorseRadioConfig = {
        message: 'HELLO',
        encodedMessage: '.... . .-.. .-.. ---',
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

      const result = await decodeMorse({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        decodedMessage: 'HELLO',
      });

      expect(result.correct).toBe(true);
      expect(result.message).toBe('HELLO');
      expect(result.completion).toBeDefined();
      expect(result.points).toBe(150);
    });

    it('should accept correct message (case insensitive)', async () => {
      const { objectiveRepository, completionRepository } = await import(
        '@crafted/database'
      );

      const config: MorseRadioConfig = {
        message: 'HELLO',
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

      const result = await decodeMorse({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        decodedMessage: 'hello',
      });

      expect(result.correct).toBe(true);
    });

    it('should reject incorrect decoded message', async () => {
      const { objectiveRepository, completionRepository } = await import(
        '@crafted/database'
      );

      const config: MorseRadioConfig = {
        message: 'HELLO',
        encodedMessage: '.... . .-.. .-.. ---',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      await expect(
        decodeMorse({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          decodedMessage: 'WORLD',
        })
      ).rejects.toThrow('Message decode incorrect');
    });

    it('should throw when message already decoded', async () => {
      const { objectiveRepository, completionRepository } = await import(
        '@crafted/database'
      );

      const config: MorseRadioConfig = {
        message: 'HELLO',
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
        decodeMorse({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          decodedMessage: 'HELLO',
        })
      ).rejects.toThrow('Message morse deja decode par cette equipe');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        decodeMorse({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          decodedMessage: 'HELLO',
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not MORSE_RADIO type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        decodeMorse({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          decodedMessage: 'HELLO',
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Morse/Radio");
    });
  });
});
