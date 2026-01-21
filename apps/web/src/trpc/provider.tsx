'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { api } from './client';
import { supabase } from '@crafted/auth';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => {
    return api.createClient({
      links: [
        loggerLink({
          enabled: () => process.env.NODE_ENV === 'development',
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers: async () => {
            // IMPORTANT: This function is called for EACH request
            if (typeof window === 'undefined') return {};

            try {
              const { data: { session } } = await supabase.auth.getSession();

              console.log('[tRPC Client] Getting headers, session exists:', !!session);
              console.log('[tRPC Client] Token length:', session?.access_token?.length || 0);

              if (session?.access_token) {
                return {
                  authorization: `Bearer ${session.access_token}`,
                };
              }
            } catch (error) {
              console.error('[tRPC Client] Failed to get auth token:', error);
            }

            return {};
          },
        }),
      ],
    });
  });

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
