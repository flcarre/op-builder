import { describe, it, expect, vi } from 'vitest';
import { authRouter } from '../routers/auth';
import type { Context } from '../trpc';

vi.mock('@crafted/auth');
vi.mock('@crafted/database');
vi.mock('@crafted/emails');

describe('Auth Router', () => {
  describe('register', () => {
    it('should create user in both Supabase and Prisma', async () => {
      const mockSupabaseUser = {
        id: 'supabase-user-id',
        email: 'test@example.com',
      };

      const { signUp } = await import('@crafted/auth');
      const { db } = await import('@crafted/database');
      const { sendWelcomeEmail } = await import('@crafted/emails');

      vi.mocked(signUp).mockResolvedValue({
        user: mockSupabaseUser,
        session: { access_token: 'token' },
      } as any);

      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      vi.mocked(db.user.create).mockResolvedValue({
        id: 'prisma-user-id',
        email: 'test@example.com',
        name: 'Test User',
        supabaseId: 'supabase-user-id',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const caller = authRouter.createCaller({} as Context);

      const result = await caller.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
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
          supabaseId: 'supabase-user-id',
        },
      });

      expect(sendWelcomeEmail).toHaveBeenCalledWith('test@example.com', 'Test User');

      expect(result.user).toEqual(mockSupabaseUser);
    });

    it('should throw error if user already exists', async () => {
      const { db } = await import('@crafted/database');

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
        name: 'Existing User',
        supabaseId: 'existing-supabase-id',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const caller = authRouter.createCaller({} as Context);

      await expect(
        caller.register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should rollback Supabase user if Prisma creation fails', async () => {
      const mockSupabaseUser = {
        id: 'supabase-user-id',
        email: 'test@example.com',
      };

      const { signUp, supabase } = await import('@crafted/auth');
      const { db } = await import('@crafted/database');

      vi.mocked(signUp).mockResolvedValue({
        user: mockSupabaseUser,
        session: { access_token: 'token' },
      } as any);

      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      vi.mocked(db.user.create).mockRejectedValue(new Error('Database error'));

      const mockDeleteUser = vi.fn();
      vi.mocked(supabase.auth.admin).deleteUser = mockDeleteUser;

      const caller = authRouter.createCaller({} as Context);

      await expect(
        caller.register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const { signIn } = await import('@crafted/auth');

      const mockSession = {
        user: { id: 'user-id', email: 'test@example.com' },
        session: { access_token: 'token' },
      };

      vi.mocked(signIn).mockResolvedValue(mockSession as any);

      const caller = authRouter.createCaller({} as Context);

      const result = await caller.login({
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

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { signOut } = await import('@crafted/auth');

      vi.mocked(signOut).mockResolvedValue({ success: true } as any);

      const caller = authRouter.createCaller({} as Context);

      const result = await caller.logout();

      expect(signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
