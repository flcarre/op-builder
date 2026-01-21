'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';
import { useParams, useRouter } from 'next/navigation';
import { DashboardNav, LoadingScreen } from '@/components';
import { Button, Input, Label, Badge, Textarea } from '@crafted/ui';
import { PlusIcon, TrashIcon, UsersIcon } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
];

export default function CampsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [showCreateCamp, setShowCreateCamp] = useState(false);
  const [newCamp, setNewCamp] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

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

  const { data: operation, isLoading: operationLoading, refetch: refetchOperation } = api.operation.getById.useQuery(
    { id: operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const { data: camps, isLoading: campsLoading, refetch: refetchCamps } = api.camp.getByOperation.useQuery(
    { operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const createCampMutation = api.camp.create.useMutation({
    onSuccess: () => {
      refetchCamps();
      setShowCreateCamp(false);
      setNewCamp({ name: '', description: '', color: '#3b82f6' });
    },
  });

  const deleteCampMutation = api.camp.delete.useMutation({
    onSuccess: () => {
      refetchCamps();
    },
  });

  const assignTeamMutation = api.camp.assignTeam.useMutation({
    onSuccess: () => {
      refetchCamps();
      refetchOperation();
    },
  });

  const removeTeamMutation = api.camp.removeTeam.useMutation({
    onSuccess: () => {
      refetchCamps();
      refetchOperation();
    },
  });

  if (operationLoading || campsLoading || !userTeams) return <LoadingScreen />;

  if (!selectedTeamId && userTeams.length > 0) {
    setSelectedTeamId(userTeams[0].id);
    return <LoadingScreen />;
  }

  if (!operation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Operation not found</h2>
          <Button onClick={() => router.push('/')} className="mt-4">
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

  const handleCreateCamp = () => {
    if (!newCamp.name.trim()) return;

    createCampMutation.mutate({
      operationId,
      teamId: selectedTeamId,
      name: newCamp.name,
      description: newCamp.description || undefined,
      color: newCamp.color,
      order: camps?.length || 0,
    });
  };

  const handleDeleteCamp = (campId: string) => {
    if (window.confirm('Are you sure you want to delete this camp?')) {
      deleteCampMutation.mutate({ id: campId, teamId: selectedTeamId });
    }
  };

  const handleAssignTeam = (campId: string, operationTeamId: string) => {
    assignTeamMutation.mutate({
      campId,
      operationTeamId,
      teamId: selectedTeamId,
    });
  };

  const handleRemoveTeam = (campTeamId: string) => {
    removeTeamMutation.mutate({
      campTeamId,
      teamId: selectedTeamId,
    });
  };

  const unassignedTeams = operation.operationTeams?.filter(
    (ot: any) => !camps?.some((camp) =>
      camp.campTeams.some((ct) => ct.operationTeamId === ot.id)
    )
  ) || [];

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
          <Button
            variant="ghost"
            onClick={() => router.push(`/operations/${operationId}`)}
            className="mb-6 text-cyber-400 hover:text-cyber-300 hover:bg-white/5"
          >
            ← Back to Operation
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                [ Camps Management ]
              </h1>
              <p className="text-gray-400 text-sm">
                ORGANIZE SQUADS INTO 2-4 FACTIONS FOR {operation.name.toUpperCase()}
              </p>
            </div>
            {isAdmin && camps && camps.length < 4 && (
              <Button
                onClick={() => setShowCreateCamp(!showCreateCamp)}
                className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Camp
              </Button>
            )}
          </div>
        </div>

        {showCreateCamp && isAdmin && (
          <div className="mb-6 glass-strong rounded-2xl shadow-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Deploy New Camp</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="camp-name" className="text-sm font-medium text-gray-300">
                  Camp Name *
                </Label>
                <Input
                  id="camp-name"
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  placeholder="OTAN, OPFOR, Rebels..."
                  maxLength={100}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="camp-description" className="text-sm font-medium text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="camp-description"
                  value={newCamp.description}
                  onChange={(e) => setNewCamp({ ...newCamp, description: e.target.value })}
                  placeholder="Camp description..."
                  rows={2}
                  maxLength={500}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Camp Color</Label>
                <div className="flex gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewCamp({ ...newCamp, color: color.value })}
                      className={`w-12 h-12 rounded-lg border-2 transition-all shadow-tactical ${
                        newCamp.color === color.value
                          ? 'border-white scale-110 ring-2 ring-olive-500'
                          : 'border-tactical-600 hover:border-olive-500'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateCamp}
                  disabled={!newCamp.name.trim() || createCampMutation.isPending}
                  className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
                >
                  {createCampMutation.isPending ? 'Deploying...' : 'Deploy Camp'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateCamp(false)}
                  className="glow-border text-cyber-400 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {camps && camps.length < 2 && (
          <div className="mb-6 p-4 bg-amber-900/40 backdrop-blur-sm border-2 border-amber-700/50 rounded-lg flex items-start gap-3">
            <span className="text-amber-400 text-xl">⚠️</span>
            <p className="text-amber-300 text-sm flex-1">
              MINIMUM 2 CAMPS REQUIRED TO DEPLOY OPERATION. CREATE MORE CAMPS TO PROCEED.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {camps?.map((camp) => (
            <div
              key={camp.id}
              className="bg-tactical-950/90 backdrop-blur-sm rounded-lg shadow-elevated overflow-hidden border-2 border-tactical-700/50 hover:shadow-glow-md transition-all"
            >
              <div
                className="h-2 relative"
                style={{ backgroundColor: camp.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-tactical-900/20" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{camp.name}</h3>
                    {camp.description && (
                      <p className="text-sm text-olive-300/80 font-mono mt-2">
                        {camp.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-2 border-olive-600/50 text-olive-300 bg-tactical-900/60 font-mono"
                    >
                      <UsersIcon className="mr-1 h-3 w-3" />
                      {camp.campTeams.length}
                    </Badge>
                    {isAdmin && camps.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCamp(camp.id)}
                        disabled={camp.campTeams.length > 0}
                        title={camp.campTeams.length > 0 ? "Cannot delete camp with assigned teams" : "Delete camp"}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-olive-300 font-mono uppercase tracking-wider">Assigned Squads</h4>

                  {camp.campTeams.length === 0 ? (
                    <p className="text-sm text-olive-400/60 font-mono italic">No squads assigned yet</p>
                  ) : (
                    <div className="space-y-2">
                      {camp.campTeams.map((ct) => (
                        <div
                          key={ct.id}
                          className="flex items-center justify-between p-3 bg-tactical-900/70 backdrop-blur-sm rounded-lg border border-tactical-700/50 hover:border-olive-600/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-tactical border-2"
                              style={{
                                backgroundColor: ct.operationTeam.team.color,
                                borderColor: ct.operationTeam.team.color,
                                filter: 'brightness(0.9)'
                              }}
                            >
                              {ct.operationTeam.team.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white font-mono">{ct.operationTeam.team.name}</p>
                              <p className="text-xs text-olive-400 font-mono uppercase">{ct.operationTeam.role}</p>
                            </div>
                          </div>

                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTeam(ct.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && unassignedTeams.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-tactical-700/50">
                      <Label className="text-sm font-medium text-gray-300">Assign Squad</Label>
                      <select
                        className="mt-2 w-full p-3 border-2 rounded-lg bg-tactical-900 border-olive-700 text-white text-sm focus:border-olive-500 focus:outline-none"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignTeam(camp.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Select a squad...</option>
                        {unassignedTeams.map((ot: any) => (
                          <option key={ot.id} value={ot.id}>
                            {ot.team.name} ({ot.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {camps && camps.length === 0 && (
          <div className="text-center py-12 glass-strong rounded-2xl shadow-2xl">
            <UsersIcon className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-xl font-bold text-white">No Camps Deployed</h3>
            <p className="mt-2 text-sm text-gray-400 font-mono">
              Create 2-4 camps to organize squads for this operation
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowCreateCamp(true)}
                className="mt-6 bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Deploy First Camp
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
