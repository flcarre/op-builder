'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';
import { useParams, useRouter } from 'next/navigation';
import { DashboardNav, LoadingScreen, ObjectiveTypeSelector, ObjectiveConfigFields } from '@/components';
import { Button, Badge, Input, Label, Textarea } from '@crafted/ui';
import {
  PlusIcon,
  TrashIcon,
  CopyIcon,
  GripVerticalIcon,
  TargetIcon,
  MapPinIcon,
  ScanIcon,
  ShieldIcon,
  QrCodeIcon,
  KeyIcon,
  UserXIcon,
  BombIcon,
  PackageIcon,
  ListTreeIcon,
  RadioIcon,
  TowerControlIcon,
  HandshakeIcon,
  ShuffleIcon,
  TimerIcon,
  ZapIcon,
} from 'lucide-react';

const OBJECTIVE_TYPES = [
  {
    value: 'PHYSICAL_CODE',
    label: 'Code Physique',
    icon: KeyIcon,
    category: 'Code',
    description: 'Les joueurs doivent trouver et entrer un code secret avec tentatives limitées'
  },
  {
    value: 'QR_SIMPLE',
    label: 'QR Simple',
    icon: ScanIcon,
    category: 'Scan',
    description: 'Scanner un QR code pour valider l\'objectif instantanément'
  },
  {
    value: 'QR_ENIGMA',
    label: 'QR + Énigme',
    icon: ScanIcon,
    category: 'Énigme',
    description: 'Scanner un QR qui révèle une énigme à résoudre'
  },
  {
    value: 'GPS_CAPTURE',
    label: 'Capture de Zone GPS',
    icon: MapPinIcon,
    category: 'GPS',
    description: 'Rester dans une zone GPS pendant une durée définie'
  },
  {
    value: 'VIP_ELIMINATION',
    label: 'Élimination VIP',
    icon: UserXIcon,
    category: 'Combat',
    description: 'Scanner la cible VIP pour révéler des informations secrètes'
  },
  {
    value: 'TIMED_SABOTAGE',
    label: 'Sabotage Temporisé',
    icon: BombIcon,
    category: 'Stealth',
    description: 'Lancer un sabotage qui se complète après un délai'
  },
  {
    value: 'ITEM_COLLECTION',
    label: 'Collecte d\'Items',
    icon: PackageIcon,
    category: 'Scan',
    description: 'Collecter plusieurs objets en scannant leurs QR codes'
  },
  {
    value: 'MULTI_STEP_ENIGMA',
    label: 'Énigme Multi-Étapes',
    icon: ListTreeIcon,
    category: 'Énigme',
    description: 'Résoudre une série d\'énigmes dans un ordre précis'
  },
  {
    value: 'POINT_DEFENSE',
    label: 'Défense de Point',
    icon: ShieldIcon,
    category: 'Combat',
    description: 'Défendre un point contre les équipes adverses'
  },
  {
    value: 'MORSE_RADIO',
    label: 'Morse/Radio',
    icon: RadioIcon,
    category: 'Énigme',
    description: 'Décoder un message morse ou radio pour obtenir le code'
  },
  {
    value: 'ANTENNA_HACK',
    label: 'Piratage d\'Antenne',
    icon: TowerControlIcon,
    category: 'Énigme',
    description: 'Mini-jeu de piratage d\'antenne avec puzzle à résoudre'
  },
  {
    value: 'NEGOTIATION',
    label: 'Négociation',
    icon: HandshakeIcon,
    category: 'Dynamique',
    description: 'Négocier avec un arbitre pour obtenir des ressources'
  },
  {
    value: 'CONDITIONAL',
    label: 'Objectif Conditionnel',
    icon: TargetIcon,
    category: 'Dynamique',
    description: 'Objectif qui se débloque selon des conditions spécifiques'
  },
  {
    value: 'RANDOM_POOL',
    label: 'Pool Aléatoire',
    icon: ShuffleIcon,
    category: 'Dynamique',
    description: 'Un objectif aléatoire parmi plusieurs possibles'
  },
  {
    value: 'TIME_RACE',
    label: 'Course Contre la Montre',
    icon: TimerIcon,
    category: 'Dynamique',
    description: 'Compléter une série d\'objectifs le plus rapidement possible'
  },
  {
    value: 'LIVE_EVENT',
    label: 'Évènement Live',
    icon: ZapIcon,
    category: 'Dynamique',
    description: 'Objectif déclenché manuellement par les organisateurs'
  },
];

export default function ObjectivesPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [newObjective, setNewObjective] = useState({
    type: 'QR_SIMPLE',
    title: '',
    description: '',
    points: 100,
    campId: '',
  });
  const [objectiveConfig, setObjectiveConfig] = useState<Record<string, any>>({});

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

  const { data: operation, isLoading: operationLoading } = api.operation.getById.useQuery(
    { id: operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const { data: objectives, isLoading: objectivesLoading, refetch: refetchObjectives } = api.objective.getByOperation.useQuery(
    { operationId, teamId: selectedTeamId || userTeams?.[0]?.id || '' },
    { enabled: !!selectedTeamId || !!userTeams?.[0]?.id }
  );

  const createObjectiveMutation = api.objective.create.useMutation({
    onSuccess: () => {
      refetchObjectives();
      setShowCreateObjective(false);
      setSelectedType(null);
      setNewObjective({
        type: 'QR_SIMPLE',
        title: '',
        description: '',
        points: 100,
        campId: '',
      });
      setObjectiveConfig({});
    },
  });

  const deleteObjectiveMutation = api.objective.delete.useMutation({
    onSuccess: () => {
      refetchObjectives();
    },
  });

  const duplicateObjectiveMutation = api.objective.duplicate.useMutation({
    onSuccess: () => {
      refetchObjectives();
    },
  });

  if (operationLoading || objectivesLoading || !userTeams) return <LoadingScreen />;

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

  const handleCreateObjective = () => {
    if (!newObjective.title.trim()) return;

    const hasConfig = Object.keys(objectiveConfig).length > 0;

    createObjectiveMutation.mutate({
      operationId,
      teamId: selectedTeamId,
      type: newObjective.type as any,
      title: newObjective.title,
      description: newObjective.description || undefined,
      points: newObjective.points,
      campId: newObjective.campId || undefined,
      order: objectives?.length || 0,
      config: hasConfig ? objectiveConfig : undefined,
    });
  };

  const handleDeleteObjective = (objectiveId: string) => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      deleteObjectiveMutation.mutate({ id: objectiveId, teamId: selectedTeamId });
    }
  };

  const handleDuplicateObjective = (objectiveId: string) => {
    duplicateObjectiveMutation.mutate({ id: objectiveId, teamId: selectedTeamId });
  };

  const getObjectiveTypeInfo = (type: string) => {
    return OBJECTIVE_TYPES.find(t => t.value === type) || OBJECTIVE_TYPES[0];
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setNewObjective({ ...newObjective, type });
    setObjectiveConfig({});
  };

  const handleCancelCreate = () => {
    if (selectedType) {
      setSelectedType(null);
      setObjectiveConfig({});
    } else {
      setShowCreateObjective(false);
      setObjectiveConfig({});
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
                Mission Objectives
              </h1>
              <p className="text-gray-400 text-sm">
                Configure tactical objectives for {operation.name}
              </p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                {objectives && objectives.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/operations/${operationId}/objectives/qrcodes`)}
                    className="glow-border text-cyber-400 rounded-xl"
                  >
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    Print QR Codes
                  </Button>
                )}
                <Button
                  onClick={() => setShowCreateObjective(!showCreateObjective)}
                  className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Objective
                </Button>
              </div>
            )}
          </div>
        </div>

        {showCreateObjective && isAdmin && (
          <div className="mb-6 glass-strong rounded-2xl shadow-2xl p-8">
            {!selectedType ? (
              <ObjectiveTypeSelector
                types={OBJECTIVE_TYPES}
                onSelect={handleSelectType}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Nouvel Objectif : {getObjectiveTypeInfo(selectedType).label}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedType(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ← Changer de type
                  </Button>
                </div>
                <div className="space-y-4">

              <div className="space-y-3">
                <Label htmlFor="objective-title" className="text-sm font-medium text-gray-300">
                  Title *
                </Label>
                <Input
                  id="objective-title"
                  value={newObjective.title}
                  onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                  placeholder="e.g., Pirater l'antenne principale"
                  maxLength={200}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="objective-description" className="text-sm font-medium text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="objective-description"
                  value={newObjective.description}
                  onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                  placeholder="Detailed objective instructions..."
                  rows={3}
                  maxLength={2000}
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="objective-points" className="text-sm font-medium text-gray-300">
                    Points
                  </Label>
                  <Input
                    id="objective-points"
                    type="number"
                    value={newObjective.points}
                    onChange={(e) => setNewObjective({ ...newObjective, points: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={10000}
                    className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="objective-camp" className="text-sm font-medium text-gray-300">
                    Assign to Camp
                  </Label>
                  <select
                    id="objective-camp"
                    value={newObjective.campId}
                    onChange={(e) => setNewObjective({ ...newObjective, campId: e.target.value })}
                    className="w-full p-3 border-2 rounded-lg bg-white/5 border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 focus:outline-none"
                  >
                    <option value="">All Camps</option>
                    {operation.camps?.map((camp: any) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ObjectiveConfigFields
                type={selectedType}
                config={objectiveConfig}
                onChange={setObjectiveConfig}
              />

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateObjective}
                      disabled={!newObjective.title.trim() || createObjectiveMutation.isPending}
                      className="bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
                    >
                      {createObjectiveMutation.isPending ? 'Deploying...' : 'Deploy Objective'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelCreate}
                      className="glow-border text-cyber-400 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {objectives && objectives.length === 0 ? (
          <div className="text-center py-12 glass-strong rounded-2xl shadow-2xl">
            <TargetIcon className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-xl font-bold text-white">No Objectives Deployed</h3>
            <p className="mt-2 text-sm text-gray-400">
              Create your first objective to start building your operation scenario
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowCreateObjective(true)}
                className="mt-6 bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Deploy First Objective
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {objectives?.map((objective) => {
              const typeInfo = getObjectiveTypeInfo(objective.type);
              const Icon = typeInfo.icon;

              return (
                <div
                  key={objective.id}
                  className="glass rounded-2xl shadow-xl p-6 hover:shadow-glow-md transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start gap-4 relative">
                    <div className="flex items-center gap-3">
                      <GripVerticalIcon className="h-5 w-5 text-gray-500 cursor-grab hover:text-olive-400 transition-colors" />
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-tactical border-2"
                        style={{
                          backgroundColor: objective.camp?.color || '#6b7280',
                          borderColor: objective.camp?.color || '#6b7280',
                          filter: 'brightness(0.9)'
                        }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-white">{objective.title}</h3>
                            <Badge
                              variant="outline"
                              className="text-xs font-mono uppercase border border-cyber-500/50 text-cyber-300 bg-cyber-900/20"
                            >
                              {typeInfo.category}
                            </Badge>
                            {objective.camp && (
                              <Badge
                                className="text-xs font-mono uppercase border-2"
                                style={{
                                  backgroundColor: objective.camp.color,
                                  borderColor: objective.camp.color,
                                  filter: 'brightness(0.9)'
                                }}
                              >
                                {objective.camp.name}
                              </Badge>
                            )}
                          </div>
                          {objective.description && (
                            <p className="text-sm text-gray-400 mt-2">
                              {objective.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm font-bold text-cyber-400 uppercase tracking-wider">
                              {objective.points} pts
                            </span>
                            {objective.parentObjective && (
                              <span className="text-xs text-gray-500">
                                Depends on: {objective.parentObjective.title}
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateObjective(objective.id)}
                              disabled={duplicateObjectiveMutation.isPending}
                              className="text-cyber-400 hover:text-cyber-300 hover:bg-white/5 rounded-lg"
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteObjective(objective.id)}
                              disabled={deleteObjectiveMutation.isPending}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
