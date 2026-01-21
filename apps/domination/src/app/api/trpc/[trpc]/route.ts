import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@crafted/api';
import { getUserFromToken } from '@crafted/auth';
import { db } from '@crafted/database';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    onError: ({ error, path }) => {
      console.error(`[tRPC Error] ${path}:`, error.message, error.cause);
    },
    createContext: async () => {
      const authHeader = req.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {};
      }

      const token = authHeader.substring(7);

      try {
        const supabaseUser = await getUserFromToken(token);

        if (supabaseUser) {
          const dbUser = await db.user.findUnique({
            where: { supabaseId: supabaseUser.id },
          });

          if (dbUser) {
            return {
              userId: dbUser.id,
              user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name || undefined,
              },
            };
          }
        }
      } catch (error) {
        console.error('[tRPC] Failed to get user from token:', error);
      }

      return {};
    },
  });

export { handler as GET, handler as POST };
