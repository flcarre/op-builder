import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dominationRepository } from '@crafted/database';
import {
  createDominationSession,
  getDominationSessionById,
  getAllDominationSessions,
  updateDominationSession,
  deleteDominationSession,
  startDominationSession,
  pauseDominationSession,
  resumeDominationSession,
  endDominationSession,
  createDominationTeam,
  updateDominationTeam,
  deleteDominationTeam,
  createDominationPoint,
  updateDominationPoint,
  deleteDominationPoint,
  getDominationPointByToken,
  captureDominationPoint,
  getDominationSessionScores,
  getDominationSessionState,
  calculateAndUpdateDominationScores,
} from './domination.service';

vi.mock('@crafted/database', () => ({
  dominationRepository: {
    createSession: vi.fn(),
    findSessionById: vi.fn(),
    findAllSessions: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    createTeam: vi.fn(),
    findTeamById: vi.fn(),
    updateTeam: vi.fn(),
    deleteTeam: vi.fn(),
    createPoint: vi.fn(),
    findPointById: vi.fn(),
    findPointByToken: vi.fn(),
    updatePoint: vi.fn(),
    deletePoint: vi.fn(),
    createCapture: vi.fn(),
    findLastCaptureForPoint: vi.fn(),
    getScoresBySession: vi.fn(),
    getPointsWithLastCapture: vi.fn(),
    getAllCapturesForSession: vi.fn(),
    incrementScore: vi.fn(),
    upsertScore: vi.fn(),
  },
}));

describe('DominationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDominationSession', () => {
    it('should create a new session', async () => {
      const input = { name: 'Test Session' };
      const mockSession = { id: '1', ...input, status: 'DRAFT' };
      vi.mocked(dominationRepository.createSession).mockResolvedValue(
        mockSession as never
      );

      const result = await createDominationSession(input);

      expect(result).toEqual(mockSession);
      expect(dominationRepository.createSession).toHaveBeenCalledWith(input);
    });
  });

  describe('getDominationSessionById', () => {
    it('should return session when found', async () => {
      const mockSession = {
        id: '1',
        name: 'Test',
        status: 'DRAFT',
        teams: [],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );

      const result = await getDominationSessionById('1');

      expect(result).toEqual(mockSession);
    });

    it('should throw when session not found', async () => {
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(null);

      await expect(getDominationSessionById('invalid')).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('startDominationSession', () => {
    it('should start a draft session', async () => {
      const mockSession = {
        id: '1',
        status: 'DRAFT',
        teams: [],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.updateSession).mockResolvedValue({
        ...mockSession,
        status: 'ACTIVE',
      } as never);

      await startDominationSession('1');

      expect(dominationRepository.updateSession).toHaveBeenCalledWith('1', {
        status: 'ACTIVE',
        startedAt: expect.any(Date),
      });
    });

    it('should throw if session already active', async () => {
      const mockSession = {
        id: '1',
        status: 'ACTIVE',
        teams: [],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );

      await expect(startDominationSession('1')).rejects.toThrow(
        'Session already active'
      );
    });

    it('should throw if session completed', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        teams: [],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );

      await expect(startDominationSession('1')).rejects.toThrow(
        'Session already completed'
      );
    });
  });

  describe('pauseDominationSession', () => {
    it('should pause an active session', async () => {
      const mockSession = {
        id: '1',
        status: 'ACTIVE',
        teams: [],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.updateSession).mockResolvedValue({
        ...mockSession,
        status: 'PAUSED',
      } as never);

      await pauseDominationSession('1');

      expect(dominationRepository.updateSession).toHaveBeenCalledWith('1', {
        status: 'PAUSED',
      });
    });

    it('should throw if session not active', async () => {
      const mockSession = {
        id: '1',
        status: 'DRAFT',
        teams: [],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );

      await expect(pauseDominationSession('1')).rejects.toThrow(
        'Session is not active'
      );
    });
  });

  describe('createDominationTeam', () => {
    it('should create a team with correct order', async () => {
      const mockSession = {
        id: '1',
        status: 'DRAFT',
        teams: [
          { id: 't1', order: 0 },
          { id: 't2', order: 1 },
        ],
        points: [],
        scores: [],
      };
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.createTeam).mockResolvedValue({
        id: 't3',
        name: 'New Team',
        order: 2,
      } as never);

      const input = { sessionId: '1', name: 'New Team', color: '#ff0000' };
      await createDominationTeam(input);

      expect(dominationRepository.createTeam).toHaveBeenCalledWith({
        name: 'New Team',
        color: '#ff0000',
        order: 2,
        session: { connect: { id: '1' } },
      });
    });
  });

  describe('captureDominationPoint', () => {
    it('should capture a point for a team', async () => {
      const mockPoint = { id: 'p1', sessionId: 's1', captures: [] };
      const mockSession = {
        id: 's1',
        status: 'ACTIVE',
        teams: [],
        points: [],
        scores: [],
      };
      const mockTeam = { id: 't1', sessionId: 's1' };

      vi.mocked(dominationRepository.findPointByToken).mockResolvedValue(
        mockPoint as never
      );
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.findTeamById).mockResolvedValue(
        mockTeam as never
      );
      vi.mocked(dominationRepository.findLastCaptureForPoint).mockResolvedValue(
        null
      );
      vi.mocked(dominationRepository.createCapture).mockResolvedValue({
        id: 'c1',
      } as never);

      const input = { qrToken: 'token123', teamId: 't1' };
      await captureDominationPoint(input);

      expect(dominationRepository.createCapture).toHaveBeenCalledWith({
        point: { connect: { id: 'p1' } },
        team: { connect: { id: 't1' } },
        session: { connect: { id: 's1' } },
        capturedBy: undefined,
      });
    });

    it('should throw if session not active', async () => {
      const mockPoint = { id: 'p1', sessionId: 's1', captures: [] };
      const mockSession = {
        id: 's1',
        status: 'DRAFT',
        teams: [],
        points: [],
        scores: [],
      };

      vi.mocked(dominationRepository.findPointByToken).mockResolvedValue(
        mockPoint as never
      );
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );

      await expect(
        captureDominationPoint({ qrToken: 'token123', teamId: 't1' })
      ).rejects.toThrow('Session is not active');
    });

    it('should throw if point already captured by same team', async () => {
      const mockPoint = { id: 'p1', sessionId: 's1', captures: [] };
      const mockSession = {
        id: 's1',
        status: 'ACTIVE',
        teams: [],
        points: [],
        scores: [],
      };
      const mockTeam = { id: 't1', sessionId: 's1' };
      const mockLastCapture = { teamId: 't1' };

      vi.mocked(dominationRepository.findPointByToken).mockResolvedValue(
        mockPoint as never
      );
      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.findTeamById).mockResolvedValue(
        mockTeam as never
      );
      vi.mocked(dominationRepository.findLastCaptureForPoint).mockResolvedValue(
        mockLastCapture as never
      );

      await expect(
        captureDominationPoint({ qrToken: 'token123', teamId: 't1' })
      ).rejects.toThrow('Point already captured by this team');
    });
  });

  describe('getDominationSessionState', () => {
    it('should return complete session state', async () => {
      const mockSession = {
        id: 's1',
        name: 'Test Session',
        status: 'ACTIVE',
        startedAt: new Date(),
        teams: [{ id: 't1', name: 'Team 1', color: '#ff0000' }],
        points: [],
        scores: [],
      };
      const mockPoints = [
        {
          id: 'p1',
          name: 'Point A',
          captures: [
            { team: { id: 't1', name: 'Team 1' }, capturedAt: new Date() },
          ],
        },
      ];
      const mockScores = [{ teamId: 't1', points: 100 }];

      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.getPointsWithLastCapture).mockResolvedValue(
        mockPoints as never
      );
      vi.mocked(dominationRepository.getScoresBySession).mockResolvedValue(
        mockScores as never
      );

      const result = await getDominationSessionState('s1');

      expect(result.session.id).toBe('s1');
      expect(result.teams).toHaveLength(1);
      expect(result.points).toHaveLength(1);
      expect(result.points[0].controlledBy).toEqual(
        mockPoints[0].captures[0].team
      );
      expect(result.scores).toHaveLength(1);
    });
  });

  describe('calculateAndUpdateDominationScores', () => {
    it('should calculate scores based on control duration', async () => {
      const startedAt = new Date(Date.now() - 60000);
      const capturedAt = new Date(Date.now() - 30000);
      const mockSession = {
        id: 's1',
        status: 'ACTIVE',
        pointsPerTick: 1,
        tickIntervalSec: 1,
        startedAt,
        durationMinutes: null,
        teams: [{ id: 't1' }, { id: 't2' }],
        points: [],
        scores: [],
      };
      const mockPoints = [
        { id: 'p1', captures: [{ teamId: 't1', capturedAt }] },
      ];
      const mockCaptures = [
        { id: 'c1', pointId: 'p1', teamId: 't1', capturedAt, point: { id: 'p1' } },
      ];

      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );
      vi.mocked(dominationRepository.getPointsWithLastCapture).mockResolvedValue(
        mockPoints as never
      );
      vi.mocked(dominationRepository.getAllCapturesForSession).mockResolvedValue(
        mockCaptures as never
      );
      vi.mocked(dominationRepository.upsertScore).mockResolvedValue(
        {} as never
      );

      await calculateAndUpdateDominationScores('s1');

      expect(dominationRepository.upsertScore).toHaveBeenCalled();
    });

    it('should return null if session not active', async () => {
      const mockSession = {
        id: 's1',
        status: 'PAUSED',
        teams: [],
        points: [],
        scores: [],
      };

      vi.mocked(dominationRepository.findSessionById).mockResolvedValue(
        mockSession as never
      );

      const result = await calculateAndUpdateDominationScores('s1');

      expect(result).toBeNull();
      expect(dominationRepository.upsertScore).not.toHaveBeenCalled();
    });
  });
});
