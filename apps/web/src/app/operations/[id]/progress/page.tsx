'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';
import { useParams, useRouter } from 'next/navigation';
import { DashboardNav, LoadingScreen } from '@/components';
import { Button, Badge } from '@crafted/ui';
import {
  CheckCircleIcon,
  LockIcon,
  UnlockIcon,
  TrophyIcon,
  TargetIcon,
  ChevronLeftIcon,
} from 'lucide-react';

export default function TeamProgressPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const { data: user } = api.auth.me.useQuery();

  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  const { data: userTeams } = api.team.getUserTeams.useQuery();

  const { data: progress, isLoading } = api.completion.getTeamProgress.useQuery(
    { operationId, teamId: selectedTeamId },
    { enabled: !!selectedTeamId }
  );

  if (isLoading || !userTeams) return <LoadingScreen />;

  if (!selectedTeamId && userTeams.length > 0) {
    setSelectedTeamId(userTeams[0].id);
    return <LoadingScreen />;
  }

  if (!progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No progress data available</h2>
          <Button onClick={() => router.push(`/operations/${operationId}`)} className="mt-4">
            Back to Operation
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/operations/${operationId}`)}
            className="mb-4 text-olive-300 hover:text-olive-100 hover:bg-tactical-900/60"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Back to Operation
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                [ Team Progress ]
              </h1>
              <p className="text-gray-400 text-sm">
                OPERATION: {progress.operation.name.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-olive-300/60 font-mono uppercase tracking-wider mb-1">
                Your Squad
              </div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded border-2 text-white font-mono font-bold uppercase tracking-wider shadow-tactical"
                style={{
                  backgroundColor: progress.team.color,
                  borderColor: progress.team.color,
                  filter: 'brightness(0.9)'
                }}
              >
                {progress.team.name}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-tactical-950/90 backdrop-blur-sm p-6 rounded-lg shadow-command border-2 border-olive-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-olive-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-olive-300/80 font-mono uppercase tracking-wider">Progress</div>
                <TrophyIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-4xl font-bold font-mono text-white mb-2">
                {progress.stats.progressPercentage}
                <span className="text-xl text-olive-400">%</span>
              </div>
              <div className="mt-3 h-3 bg-tactical-800 rounded-full overflow-hidden border border-tactical-700">
                <div
                  className="h-full bg-gradient-to-r from-olive-500 to-green-500 transition-all duration-500"
                  style={{ width: `${progress.stats.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-tactical-950/90 backdrop-blur-sm p-6 rounded-lg shadow-command border-2 border-green-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-green-300/80 font-mono uppercase tracking-wider">Completed</div>
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-4xl font-bold font-mono text-green-400">
                {progress.stats.completedObjectives}
              </div>
              <div className="text-xs text-green-300/60 font-mono mt-1">
                OF {progress.stats.totalObjectives} OBJECTIVES
              </div>
            </div>
          </div>

          <div className="bg-tactical-950/90 backdrop-blur-sm p-6 rounded-lg shadow-command border-2 border-blue-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-blue-300/80 font-mono uppercase tracking-wider">Available</div>
                <UnlockIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-4xl font-bold font-mono text-blue-400">
                {progress.stats.availableObjectives}
              </div>
              <div className="text-xs text-blue-300/60 font-mono mt-1">
                READY TO COMPLETE
              </div>
            </div>
          </div>

          <div className="bg-tactical-950/90 backdrop-blur-sm p-6 rounded-lg shadow-command border-2 border-amber-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-amber-300/80 font-mono uppercase tracking-wider">Score</div>
                <TargetIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-4xl font-bold font-mono text-amber-400">
                {progress.stats.earnedPoints}
              </div>
              <div className="text-xs text-amber-300/60 font-mono mt-1">
                OF {progress.stats.totalPoints} POINTS
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {progress.objectives.completed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white tracking-wider">Completed Objectives</h2>
                <Badge className="bg-green-700/50 text-green-100 border border-green-600 font-mono">{progress.objectives.completed.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {progress.objectives.completed.map((obj) => (
                  <div
                    key={obj.id}
                    className="bg-tactical-950/90 backdrop-blur-sm p-6 rounded-lg shadow-tactical border-l-4 border-green-500 hover:border-green-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-2">{obj.title}</h3>
                        {obj.description && (
                          <p className="text-sm text-olive-300/80 font-mono">
                            {obj.description}
                          </p>
                        )}
                      </div>
                      {obj.camp && (
                        <Badge
                          className="ml-2 text-xs font-mono uppercase border-2"
                          style={{
                            backgroundColor: obj.camp.color,
                            borderColor: obj.camp.color,
                            filter: 'brightness(0.9)'
                          }}
                        >
                          {obj.camp.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-green-700/30">
                      <Badge className="bg-tactical-900/60 text-olive-300 border border-olive-700 text-xs font-mono uppercase">
                        {obj.type}
                      </Badge>
                      <div className="flex items-center gap-4">
                        <span className="text-green-400 font-bold font-mono">
                          +{obj.points} PTS
                        </span>
                        {obj.completedAt && (
                          <span className="text-xs text-olive-400/60 font-mono">
                            {new Date(obj.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {progress.objectives.available.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UnlockIcon className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white tracking-wider">Available Objectives</h2>
                <Badge className="bg-blue-700/50 text-blue-100 border border-blue-600 font-mono">{progress.objectives.available.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {progress.objectives.available.map((obj) => (
                  <div
                    key={obj.id}
                    className="bg-tactical-950/90 backdrop-blur-sm p-6 rounded-lg shadow-tactical border-l-4 border-blue-500 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-2">{obj.title}</h3>
                        {obj.description && (
                          <p className="text-sm text-olive-300/80 font-mono">
                            {obj.description}
                          </p>
                        )}
                      </div>
                      {obj.camp && (
                        <Badge
                          className="ml-2 text-xs font-mono uppercase border-2"
                          style={{
                            backgroundColor: obj.camp.color,
                            borderColor: obj.camp.color,
                            filter: 'brightness(0.9)'
                          }}
                        >
                          {obj.camp.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-700/30">
                      <Badge className="bg-tactical-900/60 text-olive-300 border border-olive-700 text-xs font-mono uppercase">
                        {obj.type}
                      </Badge>
                      <span className="text-blue-400 font-bold font-mono">
                        +{obj.points} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {progress.objectives.locked.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LockIcon className="h-6 w-6 text-tactical-400" />
                <h2 className="text-2xl font-bold text-white tracking-wider">Locked Objectives</h2>
                <Badge className="bg-tactical-700/50 text-tactical-200 border border-tactical-600 font-mono">{progress.objectives.locked.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {progress.objectives.locked.map((obj) => (
                  <div
                    key={obj.id}
                    className="bg-tactical-950/80 backdrop-blur-sm p-6 rounded-lg shadow-tactical border-l-4 border-tactical-600 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-tactical-300 mb-2">{obj.title}</h3>
                        {obj.description && (
                          <p className="text-sm text-tactical-400/80 font-mono">
                            {obj.description}
                          </p>
                        )}
                        {obj.parentObjective && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded px-2 py-1.5 font-mono">
                            <LockIcon className="h-3 w-3" />
                            <span>REQUIRES: {obj.parentObjective.title}</span>
                          </div>
                        )}
                      </div>
                      {obj.camp && (
                        <Badge
                          className="ml-2 text-xs font-mono uppercase border-2 opacity-60"
                          style={{
                            backgroundColor: obj.camp.color,
                            borderColor: obj.camp.color,
                            filter: 'brightness(0.7)'
                          }}
                        >
                          {obj.camp.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-tactical-700/30">
                      <Badge className="bg-tactical-900/60 text-tactical-400 border border-tactical-700 text-xs font-mono uppercase">
                        {obj.type}
                      </Badge>
                      <span className="text-tactical-400 font-bold font-mono">
                        +{obj.points} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
