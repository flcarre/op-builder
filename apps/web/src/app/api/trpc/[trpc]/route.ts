import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@crafted/api';
import { getUserFromToken } from '@crafted/auth';
import { db } from '@crafted/database';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const authHeader = req.headers.get('authorization');

      console.log('[tRPC] Request received, auth header:', authHeader ? 'Present' : 'Missing');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[tRPC] No valid auth header, returning empty context');
        return {};
      }

      const token = authHeader.substring(7);
      console.log('[tRPC] Token extracted, length:', token.length);

      try {
        const supabaseUser = await getUserFromToken(token);

        if (supabaseUser) {
          console.log('[tRPC] Supabase user authenticated:', supabaseUser.email);

          const dbUser = await db.user.findUnique({
            where: { supabaseId: supabaseUser.id },
          });

          if (dbUser) {
            console.log('[tRPC] DB user found:', dbUser.email);
            return {
              userId: dbUser.id,
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name || undefined,
              },
            };
          } else {
            console.log('[tRPC] DB user not found for supabaseId:', supabaseUser.id);
          }
        } else {
          console.log('[tRPC] getUserFromToken returned null');
        }
      } catch (error) {
        console.error('[tRPC] Failed to get user from token:', error);
      }

      return {};
    },
  });

export { handler as GET, handler as POST };
