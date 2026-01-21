import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerUser, loginUser, logoutUser, getUser, requestPasswordReset } from '../auth.service';

vi.mock('@crafted/auth');
vi.mock('@crafted/database');
vi.mock('@crafted/emails');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should create user in both Supabase and Prisma', async () => {
      const { signUp } = await import('@crafted/auth');
      const { db } = await import('@crafted/database');
      const { sendWelcomeEmail } = await import('@crafted/emails');

      const mockSupabaseUser = {
        id: 'supabase-123',
        email: 'test@example.com',
      };

      const mockDbUser = {
        id: 'db-123',
        email: 'test@example.com',
        name: 'Test User',
        supabaseId: 'supabase-123',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      vi.mocked(signUp).mockResolvedValue({
        user: mockSupabaseUser,
        session: { access_token: 'token' },
      } as any);
      vi.mocked(db.user.create).mockResolvedValue(mockDbUser);
      vi.mocked(sendWelcomeEmail).mockResolvedValue(undefined as any);

      const result = await registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          supabaseId: 'supabase-123',
        },
      });

      expect(sendWelcomeEmail).toHaveBeenCalledWith('test@example.com', 'Test User');

      expect(result.user).toEqual(mockSupabaseUser);
      expect(result.dbUser).toEqual(mockDbUser);
    });

    it('should throw error if user already exists', async () => {
      const { db } = await import('@crafted/database');

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
        name: 'Existing User',
        supabaseId: 'existing-supabase-id',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        registerUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should rollback Supabase user if Prisma creation fails', async () => {
      const { signUp } = await import('@crafted/auth');
      const { db } = await import('@crafted/database');

      const mockSupabaseUser = {
        id: 'supabase-123',
        email: 'test@example.com',
      };

      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      vi.mocked(signUp).mockResolvedValue({
        user: mockSupabaseUser,
        session: { access_token: 'token' },
      } as any);
      vi.mocked(db.user.create).mockRejectedValue(new Error('Database error'));

      const mockCreateClient = vi.fn().mockReturnValue({
        auth: {
          admin: {
            deleteUser: vi.fn().mockResolvedValue({}),
          },
        },
      });

      vi.doMock('@supabase/supabase-js', () => ({
        createClient: mockCreateClient,
      }));

      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

      await expect(
        registerUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Database error');
    });

    it('should not fail if welcome email fails', async () => {
      const { signUp } = await import('@crafted/auth');
      const { db } = await import('@crafted/database');
      const { sendWelcomeEmail } = await import('@crafted/emails');

      const mockSupabaseUser = {
        id: 'supabase-123',
        email: 'test@example.com',
      };

      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      vi.mocked(signUp).mockResolvedValue({
        user: mockSupabaseUser,
        session: { access_token: 'token' },
      } as any);
      vi.mocked(db.user.create).mockResolvedValue({
        id: 'db-123',
        email: 'test@example.com',
        name: 'Test User',
        supabaseId: 'supabase-123',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(sendWelcomeEmail).mockRejectedValue(new Error('Email service down'));

      const result = await registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user).toBeDefined();
      expect(result.dbUser).toBeDefined();
    });
  });

  describe('loginUser', () => {
    it('should login with valid credentials', async () => {
      const { signIn } = await import('@crafted/auth');

      const mockSession = {
        user: { id: 'user-id', email: 'test@example.com' },
        session: { access_token: 'token' },
      };

      vi.mocked(signIn).mockResolvedValue(mockSession as any);

      const result = await loginUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual(mockSession.user);
    });
  });

  describe('logoutUser', () => {
    it('should logout successfully', async () => {
      const { signOut } = await import('@crafted/auth');

      vi.mocked(signOut).mockResolvedValue({ success: true } as any);

      const result = await logoutUser();

      expect(signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('getUser', () => {
    it('should return current user', async () => {
      const { getCurrentUser } = await import('@crafted/auth');

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);

      const result = await getUser();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      const { resetPassword } = await import('@crafted/auth');

      vi.mocked(resetPassword).mockResolvedValue({ success: true } as any);

      const result = await requestPasswordReset('test@example.com');

      expect(resetPassword).toHaveBeenCalledWith('test@example.com');
      expect(result.success).toBe(true);
    });
  });
});
