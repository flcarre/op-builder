'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';
import { useParams, useRouter } from 'next/navigation';
import { DashboardNav, LoadingScreen } from '@/components';
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@crafted/ui';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  SettingsIcon,
  CheckCircleIcon,
  TrophyIcon,
  PlayIcon,
  FlagIcon,
  XCircleIcon,
  RotateCcwIcon,
  ListChecksIcon,
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-700 text-gray-100 border border-gray-600 uppercase tracking-wider',
  PUBLISHED: 'bg-amber-700 text-amber-100 border border-amber-600 uppercase tracking-wider',
  ACTIVE: 'bg-green-700 text-green-100 border border-green-600 uppercase tracking-wider animate-pulse',
  COMPLETED: 'bg-indigo-700 text-indigo-100 border border-indigo-600 uppercase tracking-wider',
  CANCELLED: 'bg-red-800 text-red-100 border border-red-700 uppercase tracking-wider',
};

const ROLE_COLORS = {
  CREATOR: 'bg-cyber-600 text-cyber-100 border border-cyber-500 text-xs uppercase',
  CO_ADMIN: 'bg-amber-700 text-amber-100 border border-amber-600 text-xs uppercase',
  VIEWER: 'bg-gray-700 text-gray-100 border border-gray-600 text-xs uppercase',
};

export default function OperationDetailPage() {
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

  const { data: operation, isLoading, refetch } = api.operation.getById.useQuery(
    { id: operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const { data: leaderboard } = api.leaderboard.getOperationLeaderboard.useQuery(
    { operationId, teamId: selectedTeamId },
    { enabled: !!selectedTeamId }
  );

  const publishMutation = api.operation.publish.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const startMutation = api.operation.start.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const completeMutation = api.operation.complete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const cancelMutation = api.operation.cancel.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const reopenMutation = api.operation.reopen.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading || !userTeams) return <LoadingScreen />;

  if (!selectedTeamId && userTeams.length > 0) {
    setSelectedTeamId(userTeams[0].id);
    return <LoadingScreen />;
  }

  if (!operation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Operation not found</h2>
          <Button
            onClick={() => router.push('/')}
            className="mt-4 bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
          >
            Back to Command Center
          </Button>
        </div>
      </div>
    );
  }

  const currentTeamRole = operation.operationTeams?.find(
    (ot: any) => ot.teamId === selectedTeamId
  )?.role;

  const isAdmin = currentTeamRole === 'CREATOR' || currentTeamRole === 'CO_ADMIN';

  const handlePublish = () => {
    if (window.confirm('Are you sure you want to publish this operation?')) {
      publishMutation.mutate({ id: operationId, teamId: selectedTeamId });
    }
  };

  const handleStart = () => {
    if (window.confirm('Are you sure you want to start this operation? Teams will be able to scan objectives.')) {
      startMutation.mutate({ id: operationId, teamId: selectedTeamId });
    }
  };

  const handleComplete = () => {
    if (window.confirm('Are you sure you want to mark this operation as completed?')) {
      completeMutation.mutate({ id: operationId, teamId: selectedTeamId });
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this operation? This action cannot be undone.')) {
      cancelMutation.mutate({ id: operationId, teamId: selectedTeamId });
    }
  };

  const handleReopen = () => {
    if (window.confirm('Are you sure you want to reopen this operation?')) {
      reopenMutation.mutate({ id: operationId, teamId: selectedTeamId });
    }
  };

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
        {operation.coverImageUrl && (
          <div className="mb-6 h-64 rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <img
              src={operation.coverImageUrl}
              alt={operation.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">{operation.name}</h1>
                <Badge className={STATUS_COLORS[operation.status as keyof typeof STATUS_COLORS]}>
                  {operation.status}
                </Badge>
              </div>
              {operation.description && (
                <p className="text-gray-400">
                  {operation.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {(operation.status === 'ACTIVE' || operation.status === 'COMPLETED') && (
                <Button
                  onClick={() => router.push(`/operations/${operationId}/progress`)}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg"
                >
                  <ListChecksIcon className="mr-2 h-4 w-4" />
                  My Progress
                </Button>
              )}

              {operation.status === 'DRAFT' && isAdmin && (
                <Button
                  onClick={handlePublish}
                  disabled={publishMutation.isPending}
                  className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
                >
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}

              {operation.status === 'PUBLISHED' && isAdmin && (
                <Button
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                  className="bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg"
                >
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Start Operation
                </Button>
              )}

              {operation.status === 'ACTIVE' && isAdmin && (
                <Button
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg"
                >
                  <FlagIcon className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              )}

              {operation.status === 'COMPLETED' && isAdmin && (
                <Button
                  onClick={handleReopen}
                  disabled={reopenMutation.isPending}
                  variant="outline"
                  className="glow-border hover:glow-border-strong text-cyber-400 rounded-xl"
                >
                  <RotateCcwIcon className="mr-2 h-4 w-4" />
                  Reopen
                </Button>
              )}

              {operation.status !== 'CANCELLED' && currentTeamRole === 'CREATOR' && (
                <Button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  variant="destructive"
                  className="rounded-xl"
                >
                  <XCircleIcon className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}

              {isAdmin && (
                <Button variant="outline" className="glow-border text-cyber-400 rounded-xl">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-cyber-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-white">{format(new Date(operation.date), 'PPP')}</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(operation.date), 'p')}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-cyber-400" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">End Date</p>
                  <p className="font-semibold text-white">{format(new Date(operation.endDate), 'PPP')}</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(operation.endDate), 'p')}
                  </p>
                </div>
              </div>
            </div>

            {operation.latitude && operation.longitude && (
              <div className="glass p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-cyber-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Coordinates</p>
                    <p className="font-mono text-white text-sm font-semibold">
                      {operation.latitude.toFixed(6)}°N
                    </p>
                    <p className="font-mono text-white text-sm font-semibold">
                      {operation.longitude.toFixed(6)}°E
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams">
              <UsersIcon className="mr-2 h-4 w-4" />
              Teams ({operation.operationTeams?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="camps">Camps</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="leaderboard">
              <TrophyIcon className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="briefing">Briefing</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Participating Teams</h2>
              {isAdmin && operation.status === 'DRAFT' && (
                <Button className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md">
                  Invite Team
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {operation.operationTeams?.map((ot: any) => (
                <div
                  key={ot.id}
                  className="glass p-4 rounded-2xl shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: ot.team.color }}
                      >
                        {ot.team.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{ot.team.name}</h3>
                        <p className="text-sm text-gray-400">/{ot.team.slug}</p>
                      </div>
                    </div>

                    <Badge className={ROLE_COLORS[ot.role as keyof typeof ROLE_COLORS]}>
                      {ot.role}
                    </Badge>
                  </div>

                  {!ot.acceptedAt && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-amber-400">
                        Invitation pending
                      </p>
                    </div>
                  )}

                  {ot.acceptedAt && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-green-400">
                        Accepted {format(new Date(ot.acceptedAt), 'PPp')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="camps">
            <div className="glass-strong rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Camps</h2>
                <Button
                  onClick={() => router.push(`/operations/${operationId}/camps`)}
                  className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
                >
                  Manage Camps
                </Button>
              </div>
              <p className="text-gray-400">
                Organize participating teams into 2-4 camps to structure the operation.
                Click "Manage Camps" to create camps and assign teams.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="objectives">
            <div className="glass-strong rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Objectives</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/operations/${operationId}/objectives/qrcodes`)}
                    className="glow-border text-cyber-400 rounded-xl"
                  >
                    QR Codes
                  </Button>
                  <Button
                    onClick={() => router.push(`/operations/${operationId}/objectives`)}
                    className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
                  >
                    Build Objectives
                  </Button>
                </div>
              </div>
              <p className="text-gray-400">
                Create and organize objectives for the operation. Build your scenario
                like assembling building blocks with our drag & drop builder. Generate
                QR codes for objective scanning at field locations.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Team Rankings</h2>
                {leaderboard && (
                  <Badge variant="outline" className="glow-border text-cyber-400">
                    {leaderboard.leaderboard.length} teams competing
                  </Badge>
                )}
              </div>

              {!leaderboard ? (
                <div className="glass-strong rounded-2xl shadow-2xl p-6 text-center">
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              ) : leaderboard.leaderboard.length === 0 ? (
                <div className="glass-strong rounded-2xl shadow-2xl p-6 text-center">
                  <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No Results Yet</h3>
                  <p className="text-gray-400">
                    Teams will appear here once they start completing objectives
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.leaderboard.map((entry) => (
                    <div
                      key={entry.operationTeamId}
                      className="glass rounded-2xl shadow-xl p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl ${
                              entry.rank === 1
                                ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500'
                                : entry.rank === 2
                                ? 'bg-gray-500/20 text-gray-300 border-2 border-gray-400'
                                : entry.rank === 3
                                ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500'
                                : 'bg-gray-700/20 text-gray-400 border border-gray-600'
                            }`}
                          >
                            {entry.rank}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-white">{entry.teamName}</h3>
                            {entry.camp && (
                              <Badge
                                className="text-xs"
                                style={{ backgroundColor: entry.camp.color }}
                              >
                                {entry.camp.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{entry.completedObjectives} objectives completed</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-400">
                            {entry.totalPoints}
                          </div>
                          <div className="text-sm text-gray-400">points</div>
                        </div>
                      </div>

                      {entry.completions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-2">Recent completions:</p>
                          <div className="space-y-1">
                            {entry.completions.slice(0, 3).map((completion) => (
                              <div
                                key={completion.id}
                                className="text-xs flex items-center justify-between text-gray-300"
                              >
                                <span>{completion.objectiveTitle}</span>
                                <span className="text-green-400">
                                  +{completion.points}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="glass-strong rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Operation Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-400">Status</dt>
                  <dd className="mt-1 text-white">{operation.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-400">Created</dt>
                  <dd className="mt-1 text-white">{format(new Date(operation.createdAt), 'PPp')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-white">{format(new Date(operation.updatedAt), 'PPp')}</dd>
                </div>
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="briefing">
            <div className="glass-strong rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Operation Briefing</h2>
              <p className="text-gray-400">Briefing content coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
