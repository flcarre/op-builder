'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@crafted/auth';
import { api } from '@/trpc/client';

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);

  const { data: user } = api.auth.me.useQuery();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionInfo(session);

      // List all localStorage keys
      const keys = Object.keys(localStorage);
      setLocalStorageKeys(keys);
    }

    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Session Debug</h1>

      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Supabase Session</h2>
          <pre className="bg-slate-950 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">tRPC User (auth.me)</h2>
          <pre className="bg-slate-950 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">LocalStorage Keys</h2>
          <ul className="list-disc list-inside">
            {localStorageKeys.map((key) => (
              <li key={key} className="text-sm font-mono">{key}</li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <pre className="bg-slate-950 p-4 rounded overflow-auto text-xs">
            {JSON.stringify({
              SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
              HAS_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
