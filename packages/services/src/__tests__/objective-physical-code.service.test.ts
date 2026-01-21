import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attemptPhysicalCode } from '../objective.service';
import type { PhysicalCodeConfig } from '@crafted/validators';

vi.mock('@crafted/database', () => ({
  objectiveRepository: {
    findObjectiveById: vi.fn(),
  },
  operationRepository: {
    findOperationById: vi.fn(),
  },
  attemptRepository: {
    createAttempt: vi.fn(),
    countAttemptsByOperationTeam: vi.fn(),
  },
  completionRepository: {
    checkCompletion: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

describe('Physical Code Objective Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('attemptPhysicalCode', () => {
    const mockObjective = {
      id: 'obj-1',
      operationId: 'op-1',
      type: 'PHYSICAL_CODE',
      title: 'Secret Code',
      description: 'Enter the secret code',
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
      attemptedCode: 'SECRET123',
    };

    it('should succeed with correct code (case insensitive)', async () => {
      const {
        objectiveRepository,
        attemptRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
        caseSensitive: false,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: 'SECRET123',
        success: true,
        attemptedAt: new Date(),
        createdAt: new Date(),
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

      const result = await attemptPhysicalCode(mockInput);

      expect(result.success).toBe(true);
      expect(result.attempt).toBeDefined();
      expect(result.completion).toBeDefined();
      expect(attemptRepository.createAttempt).toHaveBeenCalledWith({
        objective: { connect: { id: 'obj-1' } },
        operationTeam: { connect: { id: 'team-1' } },
        attemptedCode: 'SECRET123',
        success: true,
      });
    });

    it('should succeed with lowercase when case insensitive', async () => {
      const {
        objectiveRepository,
        attemptRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
        caseSensitive: false,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: 'secret123',
        success: true,
        attemptedAt: new Date(),
        createdAt: new Date(),
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

      const result = await attemptPhysicalCode({
        ...mockInput,
        attemptedCode: 'secret123',
      });

      expect(result.success).toBe(true);
    });

    it('should fail with wrong case when case sensitive', async () => {
      const {
        objectiveRepository,
        attemptRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
        caseSensitive: true,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: 'secret123',
        success: false,
        attemptedAt: new Date(),
        createdAt: new Date(),
      } as any);

      const result = await attemptPhysicalCode({
        ...mockInput,
        attemptedCode: 'secret123',
      });

      expect(result.success).toBe(false);
      expect(result.completion).toBeNull();
    });

    it('should fail with incorrect code', async () => {
      const {
        objectiveRepository,
        attemptRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
        caseSensitive: false,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: 'WRONG',
        success: false,
        attemptedAt: new Date(),
        createdAt: new Date(),
      } as any);

      const result = await attemptPhysicalCode({
        ...mockInput,
        attemptedCode: 'WRONG',
      });

      expect(result.success).toBe(false);
      expect(result.completion).toBeNull();
    });

    it('should throw when objective not found', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue(null);

      await expect(attemptPhysicalCode(mockInput)).rejects.toThrow(
        'Objectif non trouvé'
      );
    });

    it('should throw when objective is not PHYSICAL_CODE type', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        type: 'QR_SIMPLE',
      } as any);

      await expect(attemptPhysicalCode(mockInput)).rejects.toThrow(
        "Cet objectif n'est pas de type Code Physique"
      );
    });

    it('should throw when config is invalid', async () => {
      const { objectiveRepository } = await import('@crafted/database');

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config: null,
      } as any);

      await expect(attemptPhysicalCode(mockInput)).rejects.toThrow(
        'Configuration de l\'objectif invalide'
      );
    });

    it('should throw when objective already completed', async () => {
      const {
        objectiveRepository,
        completionRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
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

      await expect(attemptPhysicalCode(mockInput)).rejects.toThrow(
        'Objectif déjà complété'
      );
    });

    it('should throw when max attempts reached', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
        caseSensitive: false,
        maxAttempts: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(
        attemptRepository.countAttemptsByOperationTeam
      ).mockResolvedValue(3);

      await expect(attemptPhysicalCode(mockInput)).rejects.toThrow(
        'Nombre maximum de tentatives atteint'
      );
    });

    it('should allow attempt when under max attempts', async () => {
      const {
        objectiveRepository,
        completionRepository,
        attemptRepository,
      } = await import('@crafted/database');

      const config: PhysicalCodeConfig = {
        secretCode: 'SECRET123',
        caseSensitive: false,
        maxAttempts: 3,
      };

      vi.mocked(objectiveRepository.findObjectiveById).mockResolvedValue({
        ...mockObjective,
        config,
      } as any);

      vi.mocked(completionRepository.checkCompletion).mockResolvedValue(null);

      vi.mocked(
        attemptRepository.countAttemptsByOperationTeam
      ).mockResolvedValue(2);

      vi.mocked(attemptRepository.createAttempt).mockResolvedValue({
        id: 'attempt-1',
        objectiveId: 'obj-1',
        operationTeamId: 'team-1',
        attemptedCode: 'SECRET123',
        success: true,
        attemptedAt: new Date(),
        createdAt: new Date(),
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

      const result = await attemptPhysicalCode(mockInput);

      expect(result.success).toBe(true);
      expect(attemptRepository.countAttemptsByOperationTeam).toHaveBeenCalledWith(
        'obj-1',
        'team-1'
      );
    });
  });
});
