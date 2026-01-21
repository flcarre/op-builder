import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentStep, answerStep } from '../objective.service';
import type { MultiStepEnigmaConfig } from '@crafted/validators';

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

describe('Multi-Step Enigma Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentStep', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'MULTI_STEP_ENIGMA',
      title: 'Multi Step Enigma',
      description: 'Solve all enigmas',
      points: 300,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return first step when no steps completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 3,
        enigmasData:
          'Question 1 | Answer 1\nQuestion 2 | Answer 2\nQuestion 3 | Answer 3',
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);
      vi.mocked(attemptRepository.findAttemptsByOperationTeam).mockResolvedValue(
        []
      );

      const result = await getCurrentStep({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.currentStep).toBe(1);
      expect(result.totalSteps).toBe(3);
      expect(result.enigma).toBe('Question 1');
    });

    it('should return second step when first completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 3,
        enigmasData:
          'Question 1 | Answer 1\nQuestion 2 | Answer 2\nQuestion 3 | Answer 3',
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
          attemptedCode: 'Answer 1',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      const result = await getCurrentStep({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
      });

      expect(result.currentStep).toBe(2);
      expect(result.totalSteps).toBe(3);
      expect(result.enigma).toBe('Question 2');
    });

    it('should throw when all steps completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 2,
        enigmasData: 'Question 1 | Answer 1\nQuestion 2 | Answer 2',
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
          attemptedCode: 'Answer 1',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'att-2',
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          attemptedCode: 'Answer 2',
          success: true,
          attemptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      await expect(
        getCurrentStep({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Toutes les etapes sont deja completees');
    });

    it('should throw when objective already completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 2,
        enigmasData: 'Question 1 | Answer 1\nQuestion 2 | Answer 2',
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
        getCurrentStep({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Enigme multi-etapes deja completee');
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(
        getCurrentStep({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow('Objectif non trouve');
    });

    it('should throw when objective is not MULTI_STEP_ENIGMA type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(
        getCurrentStep({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
        })
      ).rejects.toThrow("Cet objectif n'est pas de type Enigme Multi-Etapes");
    });
  });

  describe('answerStep', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'MULTI_STEP_ENIGMA',
      title: 'Multi Step Enigma',
      description: 'Solve all enigmas',
      points: 300,
      campId: null,
      order: 0,
      qrCodeToken: null,
      parentObjectiveId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should accept correct answer for first step', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 3,
        enigmasData:
          'Question 1 | Answer 1\nQuestion 2 | Answer 2\nQuestion 3 | Answer 3',
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

      const result = await answerStep({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        answer: 'Answer 1',
      });

      expect(result.correct).toBe(true);
      expect(result.currentStep).toBe(1);
      expect(result.completedSteps).toBe(1);
      expect(result.totalSteps).toBe(3);
      expect(result.completed).toBe(false);
      expect(result.completion).toBeNull();
      expect(result.points).toBe(0);
    });

    it('should complete objective on final correct answer', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 2,
        enigmasData: 'Question 1 | Answer 1\nQuestion 2 | Answer 2',
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
          attemptedCode: 'Answer 1',
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

      const result = await answerStep({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        answer: 'Answer 2',
      });

      expect(result.correct).toBe(true);
      expect(result.currentStep).toBe(2);
      expect(result.completedSteps).toBe(2);
      expect(result.totalSteps).toBe(2);
      expect(result.completed).toBe(true);
      expect(result.completion).toBeDefined();
      expect(result.points).toBe(300);
    });

    it('should reject incorrect answer (case insensitive)', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 2,
        enigmasData: 'Question 1 | Answer 1\nQuestion 2 | Answer 2',
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

      await expect(
        answerStep({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          answer: 'Wrong Answer',
        })
      ).rejects.toThrow('Reponse incorrecte');

      expect(attemptRepository.createAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should accept answer with different case', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 2,
        enigmasData: 'Question 1 | Answer 1\nQuestion 2 | Answer 2',
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

      const result = await answerStep({
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        answer: 'ANSWER 1',
      });

      expect(result.correct).toBe(true);
    });

    it('should throw when objective already completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: MultiStepEnigmaConfig = {
        stepsCount: 2,
        enigmasData: 'Question 1 | Answer 1\nQuestion 2 | Answer 2',
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
        answerStep({
          objectiveId: 'obj-1',
          operationTeamId: 'team-1',
          answer: 'Answer 1',
        })
      ).rejects.toThrow('Enigme multi-etapes deja completee');
    });
  });
});
