'use client';

import { useEffect } from 'react';
import { api } from '@/trpc/client';
import { DashboardNav, LoadingScreen } from '@/components';
import { Button, Badge } from '@crafted/ui';
import {
  PlusIcon,
  TargetIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  TrophyIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const STATUS_COLORS = {
  DRAFT: 'bg-tactical-700 text-tactical-100 border border-tactical-600',
  PUBLISHED: 'bg-amber-700 text-amber-100 border border-amber-600',
  ACTIVE: 'bg-green-700 text-green-100 border border-green-600 animate-pulse',
  COMPLETED: 'bg-indigo-700 text-indigo-100 border border-indigo-600',
  CANCELLED: 'bg-red-800 text-red-100 border border-red-700',
};

export default function HomePage() {
  const router = useRouter();

  const { data: user, isLoading: isLoadingUser } = api.auth.me.useQuery();
  const { data: userTeams, isLoading: isLoadingTeams } = api.team.getUserTeams.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: operations, isLoading: isLoadingOps } = api.operation.getByTeam.useQuery(
    { teamId: userTeams?.[0]?.id || '' },
    { enabled: !!userTeams?.[0]?.id }
  );

  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login');
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser) return <LoadingScreen />;

  if (!user) {
    return <LoadingScreen />;
  }

  if (isLoadingTeams || isLoadingOps || !userTeams) return <LoadingScreen />;

  const activeOperations = operations?.filter((op) => op.status === 'ACTIVE').length || 0;
  const draftOperations = operations?.filter((op) => op.status === 'DRAFT').length || 0;
  const completedOperations = operations?.filter((op) => op.status === 'COMPLETED').length || 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 201, 160, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 201, 160, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <DashboardNav
        userName={user?.name || undefined}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                Command Center
              </h1>
              <p className="text-gray-400 text-sm">
                Operations Management System
              </p>
            </div>
            <Button
              onClick={() => router.push('/operations/new')}
              size="lg"
              className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md hover:shadow-glow-lg transition-all duration-200"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              New Operation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass p-6 rounded-2xl shadow-xl hover:shadow-glow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-500/10 rounded-full blur-2xl group-hover:bg-cyber-500/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Total Operations
                  </div>
                  <TargetIcon className="h-5 w-5 text-cyber-400" />
                </div>
                <div className="text-4xl font-bold text-white">
                  {operations?.length || 0}
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover:shadow-glow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Active
                  </div>
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-glow-sm" />
                </div>
                <div className="text-4xl font-bold text-green-400">
                  {activeOperations}
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover:shadow-glow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Draft
                  </div>
                  <CalendarIcon className="h-5 w-5 text-amber-400" />
                </div>
                <div className="text-4xl font-bold text-amber-400">
                  {draftOperations}
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl shadow-xl hover:shadow-glow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Completed
                  </div>
                  <TrophyIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-4xl font-bold text-indigo-400">
                  {completedOperations}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <TargetIcon className="h-6 w-6 text-cyber-400" />
            <h2 className="text-2xl font-bold text-white">
              Operations
            </h2>
          </div>

          {!operations || operations.length === 0 ? (
            <div className="glass-strong rounded-2xl p-12 text-center">
              <TargetIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold mb-2 text-white">
                No Operations Yet
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                Create your first operation to get started
              </p>
              <Button
                onClick={() => router.push('/operations/new')}
                className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Operation
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {operations.map((operation) => (
                <div
                  key={operation.id}
                  onClick={() => router.push(`/operations/${operation.id}`)}
                  className="glass rounded-2xl shadow-xl hover:shadow-glow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2 text-white group-hover:text-cyber-300 transition-colors">
                          {operation.name}
                        </h3>
                        {operation.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {operation.description}
                          </p>
                        )}
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-cyber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{format(new Date(operation.date), 'PPP')}</span>
                      </div>
                      {operation.latitude && operation.longitude && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPinIcon className="h-4 w-4" />
                          <span>
                            {operation.latitude.toFixed(4)}°N, {operation.longitude.toFixed(4)}°E
                          </span>
                        </div>
                      )}
                      {operation.operationTeams && operation.operationTeams.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <UsersIcon className="h-4 w-4" />
                          <span>{operation.operationTeams.length} Teams</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <Badge className={`${STATUS_COLORS[operation.status]} text-xs uppercase tracking-wider px-3 py-1`}>
                        {operation.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
