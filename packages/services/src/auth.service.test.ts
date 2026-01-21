import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser, resetPassword } from '@crafted/auth';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUserProfile,
  sendPasswordReset,
} from './auth.service';

vi.mock('@crafted/auth');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockSession = { id: 'session-1', userId: '1' };
      vi.mocked(signUp).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const result = await registerUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      });
      expect(signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('loginUser', () => {
    it('should login an existing user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockSession = { id: 'session-1', userId: '1' };
      vi.mocked(signIn).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const result = await loginUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      });
    });
  });

  describe('logoutUser', () => {
    it('should logout the current user', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined);

      const result = await logoutUser();

      expect(result).toEqual({ success: true });
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('getCurrentUserProfile', () => {
    it('should return current user profile', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const result = await getCurrentUserProfile();

      expect(result).toEqual(mockUser);
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      vi.mocked(resetPassword).mockResolvedValue(undefined);

      const result = await sendPasswordReset({
        email: 'test@example.com',
      });

      expect(result).toEqual({ success: true });
      expect(resetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });
});
