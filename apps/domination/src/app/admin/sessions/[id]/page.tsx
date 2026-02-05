'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/client';
import type { RouterOutputs } from '@crafted/api';
import {
  Flag,
  Users,
  Plus,
  Trash,
  QrCode,
  Copy,
  Check,
  Pencil,
  FloppyDisk,
  Gear,
  ArrowLeft,
  X,
  DownloadSimple,
  Trophy,
  Crown,
  Crosshair,
  Key,
  Lock,
  Eye,
  EyeSlash,
  Warning,
  Play,
  Pause,
  Target,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { ThemeToggle } from '@/components/ThemeToggle';

type DominationSession = NonNullable<RouterOutputs['domination']['getSession']>;
type DominationTeam = DominationSession['teams'][number];
type DominationPoint = DominationSession['points'][number];
type DominationScore = DominationSession['scores'][number];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const utils = api.useUtils();

  const [activeTab, setActiveTab] = useState<'teams' | 'points' | 'access' | 'config' | 'results'>('teams');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3b82f6');
  const [newPointName, setNewPointName] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [qrModalPoint, setQrModalPoint] = useState<{
    name: string;
    token: string;
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPointsPerTick, setEditPointsPerTick] = useState(1);
  const [editTickInterval, setEditTickInterval] = useState(1);
  const [editDuration, setEditDuration] = useState<number | ''>('');

  // Access states
  const [newAccessPointName, setNewAccessPointName] = useState('');
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelPassword, setNewLevelPassword] = useState('');
  const [expandedAccessPoint, setExpandedAccessPoint] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [accessQrModalLevel, setAccessQrModalLevel] = useState<{
    pointName: string;
    levelName: string;
    level: number;
    token: string;
  } | null>(null);
  const [accessQrDataUrl, setAccessQrDataUrl] = useState<string | null>(null);
  const [copiedAccessToken, setCopiedAccessToken] = useState<string | null>(null);

  // Simple Access states
  const [newSimpleAccessName, setNewSimpleAccessName] = useState('');
  const [newSimpleAccessPassword, setNewSimpleAccessPassword] = useState('');
  const [showSimplePasswords, setShowSimplePasswords] = useState<Record<string, boolean>>({});
  const [simpleAccessQrModal, setSimpleAccessQrModal] = useState<{
    name: string;
    token: string;
  } | null>(null);
  const [simpleAccessQrDataUrl, setSimpleAccessQrDataUrl] = useState<string | null>(null);
  const [copiedSimpleAccessToken, setCopiedSimpleAccessToken] = useState<string | null>(null);

  const { data: session, isLoading } = api.domination.getSession.useQuery({
    id,
  });

  const createTeam = api.domination.createTeam.useMutation({
    onSuccess: () => {
      utils.domination.getSession.invalidate({ id });
      setNewTeamName('');
    },
  });

  const deleteTeam = api.domination.deleteTeam.useMutation({
    onSuccess: () => utils.domination.getSession.invalidate({ id }),
  });

  const createPoint = api.domination.createPoint.useMutation({
    onSuccess: () => {
      utils.domination.getSession.invalidate({ id });
      setNewPointName('');
    },
  });

  const deletePoint = api.domination.deletePoint.useMutation({
    onSuccess: () => utils.domination.getSession.invalidate({ id }),
  });

  const updateSession = api.domination.updateSession.useMutation({
    onSuccess: () => {
      utils.domination.getSession.invalidate({ id });
      setIsEditingConfig(false);
    },
  });

  const deleteSession = api.domination.deleteSession.useMutation({
    onSuccess: () => {
      router.push('/admin');
    },
  });

  const setScoringEnabled = api.domination.setScoringEnabled.useMutation({
    onSuccess: () => utils.domination.getSession.invalidate({ id }),
  });

  const handleToggleScoring = () => {
    if (!session) return;
    setScoringEnabled.mutate({
      id,
      enabled: !session.scoringEnabled,
    });
  };

  const handleDeleteSession = () => {
    if (confirm('Supprimer définitivement cette opération ? Cette action est irréversible.')) {
      deleteSession.mutate({ id });
    }
  };

  // Access queries and mutations
  const { data: accessPoints } = api.access.getAccessPointsBySession.useQuery({
    sessionId: id,
  });

  const createAccessPoint = api.access.createAccessPoint.useMutation({
    onSuccess: () => {
      utils.access.getAccessPointsBySession.invalidate({ sessionId: id });
      setNewAccessPointName('');
    },
  });

  const deleteAccessPoint = api.access.deleteAccessPoint.useMutation({
    onSuccess: () => utils.access.getAccessPointsBySession.invalidate({ sessionId: id }),
  });

  const addAccessLevel = api.access.addAccessLevel.useMutation({
    onSuccess: () => {
      utils.access.getAccessPointsBySession.invalidate({ sessionId: id });
      setNewLevelName('');
      setNewLevelPassword('');
    },
  });

  const deleteAccessLevel = api.access.deleteAccessLevel.useMutation({
    onSuccess: () => utils.access.getAccessPointsBySession.invalidate({ sessionId: id }),
  });

  // Simple Access queries and mutations
  const { data: simpleAccesses } = api.access.getSimpleAccessesBySession.useQuery({
    sessionId: id,
  });

  const createSimpleAccess = api.access.createSimpleAccess.useMutation({
    onSuccess: () => {
      utils.access.getSimpleAccessesBySession.invalidate({ sessionId: id });
      setNewSimpleAccessName('');
      setNewSimpleAccessPassword('');
    },
  });

  const deleteSimpleAccess = api.access.deleteSimpleAccess.useMutation({
    onSuccess: () => utils.access.getSimpleAccessesBySession.invalidate({ sessionId: id }),
  });

  useEffect(() => {
    if (session) {
      setEditName(session.name);
      setEditPointsPerTick(session.pointsPerTick);
      setEditTickInterval(session.tickIntervalSec);
      setEditDuration(session.durationMinutes ?? '');
    }
  }, [session]);

  const handleSaveConfig = () => {
    updateSession.mutate({
      id,
      name: editName,
      pointsPerTick: editPointsPerTick,
      tickIntervalSec: editTickInterval,
      durationMinutes: editDuration || null,
    });
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      createTeam.mutate({
        sessionId: id,
        name: newTeamName.trim(),
        color: newTeamColor,
      });
    }
  };

  const handleCreatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPointName.trim()) {
      createPoint.mutate({
        sessionId: id,
        name: newPointName.trim(),
      });
    }
  };

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/capture/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const showQRCode = async (name: string, token: string) => {
    const url = `${window.location.origin}/capture/${token}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    setQrDataUrl(dataUrl);
    setQrModalPoint({ name, token });
  };

  const downloadQRCode = () => {
    if (!qrDataUrl || !qrModalPoint) return;
    const link = document.createElement('a');
    link.download = `qr-${qrModalPoint.name}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // Access handlers
  const handleCreateAccessPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccessPointName.trim()) {
      createAccessPoint.mutate({
        sessionId: id,
        name: newAccessPointName.trim(),
      });
    }
  };

  const handleAddLevel = (accessPointId: string) => {
    if (newLevelName.trim() && newLevelPassword.trim()) {
      addAccessLevel.mutate({
        accessPointId,
        name: newLevelName.trim(),
        password: newLevelPassword.trim(),
      });
    }
  };

  const showAccessQRCode = async (
    pointName: string,
    levelName: string,
    level: number,
    token: string
  ) => {
    const url = `${window.location.origin}/access/${token}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    setAccessQrDataUrl(dataUrl);
    setAccessQrModalLevel({ pointName, levelName, level, token });
  };

  const downloadAccessQRCode = () => {
    if (!accessQrDataUrl || !accessQrModalLevel) return;
    const link = document.createElement('a');
    link.download = `qr-${accessQrModalLevel.pointName}-niveau${accessQrModalLevel.level}.png`;
    link.href = accessQrDataUrl;
    link.click();
  };

  const copyAccessToClipboard = async (token: string) => {
    const url = `${window.location.origin}/access/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedAccessToken(token);
    setTimeout(() => setCopiedAccessToken(null), 2000);
  };

  const togglePasswordVisibility = (levelId: string) => {
    setShowPasswords((prev) => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  // Simple Access handlers
  const handleCreateSimpleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSimpleAccessName.trim() && newSimpleAccessPassword.trim()) {
      createSimpleAccess.mutate({
        sessionId: id,
        name: newSimpleAccessName.trim(),
        password: newSimpleAccessPassword.trim(),
      });
    }
  };

  const showSimpleAccessQRCode = async (name: string, token: string) => {
    const url = `${window.location.origin}/simple/${token}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    setSimpleAccessQrDataUrl(dataUrl);
    setSimpleAccessQrModal({ name, token });
  };

  const downloadSimpleAccessQRCode = () => {
    if (!simpleAccessQrDataUrl || !simpleAccessQrModal) return;
    const link = document.createElement('a');
    link.download = `qr-simple-${simpleAccessQrModal.name}.png`;
    link.href = simpleAccessQrDataUrl;
    link.click();
  };

  const copySimpleAccessToClipboard = async (token: string) => {
    const url = `${window.location.origin}/simple/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedSimpleAccessToken(token);
    setTimeout(() => setCopiedSimpleAccessToken(null), 2000);
  };

  const toggleSimplePasswordVisibility = (accessId: string) => {
    setShowSimplePasswords((prev) => ({ ...prev, [accessId]: !prev[accessId] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 spinner-accent mx-auto mb-3" />
          <p className="text-theme-muted text-sm uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <Flag size={48} className="text-theme-muted mx-auto mb-3" />
          <p className="text-theme-muted uppercase tracking-wide">Opération non trouvée</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-accent mt-4 uppercase tracking-wider text-sm"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  const teamColors = [
    '#ef4444',
    '#3b82f6',
    '#22c55e',
    '#eab308',
    '#a855f7',
    '#f97316',
  ];

  const getStatusBadge = () => {
    const statusConfig = {
      DRAFT: { color: 'bg-tactical-blue/20 text-tactical-blue', label: 'Brouillon' },
      ACTIVE: { color: 'bg-tactical-green/20 text-tactical-green', label: 'En cours' },
      PAUSED: { color: 'bg-alert-yellow/20 text-alert-yellow', label: 'En pause' },
      COMPLETED: { color: 'bg-gray-500/20 text-gray-400', label: 'Terminée' },
    };
    const config = statusConfig[session.status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs uppercase tracking-wider ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-theme-primary safe-area-inset flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-theme-secondary/90 backdrop-blur-lg border-b border-theme-accent">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-tertiary text-theme-primary active:opacity-80"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-theme-primary truncate uppercase tracking-wide">
                {session.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusBadge()}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex bg-theme-tertiary rounded-lg p-1">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'teams'
                  ? 'tab-active'
                  : 'text-theme-muted'
              }`}
            >
              <Users size={14} className="inline mr-1 -mt-0.5" />
              Équipes
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'points'
                  ? 'tab-active'
                  : 'text-theme-muted'
              }`}
            >
              <Crosshair size={14} className="inline mr-1 -mt-0.5" />
              Objectifs
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'access'
                  ? 'tab-active'
                  : 'text-theme-muted'
              }`}
            >
              <Key size={14} className="inline mr-1 -mt-0.5" />
              Accès
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'config'
                  ? 'tab-active'
                  : 'text-theme-muted'
              }`}
            >
              <Gear size={14} className="inline mr-1 -mt-0.5" />
              Config
            </button>
            {(session.status === 'ACTIVE' || session.status === 'PAUSED' || session.status === 'COMPLETED') && (
              <button
                onClick={() => setActiveTab('results')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'results'
                    ? 'tab-active'
                    : 'text-theme-muted'
                }`}
              >
                <Trophy size={14} className="inline mr-1 -mt-0.5" />
                Scores
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-auto">
        {/* Teams tab */}
        {activeTab === 'teams' && (
          <div>
            <form onSubmit={handleCreateTeam} className="mb-4">
              <div className="glass rounded-xl p-4 border-theme-accent">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nom de l'équipe..."
                  className="input-labs w-full px-4 py-3 mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {teamColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTeamColor(color)}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          newTeamColor === color
                            ? 'ring-2 ring-theme-primary ring-offset-2 ring-offset-theme-primary'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!newTeamName.trim() || createTeam.isPending}
                    className="btn-primary disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <Plus size={18} weight="bold" />
                    Ajouter
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              {session.teams.length === 0 && (
                <div className="glass rounded-xl p-8 text-center border-theme-accent">
                  <Users size={40} className="text-theme-muted mx-auto mb-2" />
                  <p className="text-theme-muted text-sm uppercase tracking-wide">Aucune équipe</p>
                </div>
              )}
              {session.teams.map((team: DominationTeam) => (
                <div
                  key={team.id}
                  className="glass rounded-xl p-4 flex items-center justify-between border-theme-accent"
                  style={{ borderLeft: `4px solid ${team.color}` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}40` }}
                    />
                    <span className="text-theme-primary font-semibold uppercase tracking-wide">{team.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette équipe ?')) {
                        deleteTeam.mutate({ id: team.id });
                      }
                    }}
                    className="p-2 text-theme-muted active:text-alert-red"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points tab */}
        {activeTab === 'points' && (
          <div>
            <form onSubmit={handleCreatePoint} className="mb-4">
              <div className="glass rounded-xl p-4 border-theme-accent">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPointName}
                    onChange={(e) => setNewPointName(e.target.value)}
                    placeholder="Nom de l'objectif (Alpha, Bravo...)"
                    className="input-labs flex-1 px-4 py-3"
                  />
                  <button
                    type="submit"
                    disabled={!newPointName.trim() || createPoint.isPending}
                    className="btn-primary disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    <Plus size={18} weight="bold" />
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              {session.points.length === 0 && (
                <div className="glass rounded-xl p-8 text-center border-theme-accent">
                  <Crosshair size={40} className="text-theme-muted mx-auto mb-2" />
                  <p className="text-theme-muted text-sm uppercase tracking-wide">Aucun objectif</p>
                </div>
              )}
              {session.points.map((point: DominationPoint) => (
                <div
                  key={point.id}
                  className="glass rounded-xl p-4 border-theme-accent"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-alert-red/20 rounded-lg flex items-center justify-center">
                        <Crosshair size={20} className="text-alert-red" />
                      </div>
                      <span className="text-theme-primary font-semibold uppercase tracking-wide">{point.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cet objectif ?')) {
                          deletePoint.mutate({ id: point.id });
                        }
                      }}
                      className="p-2 text-theme-muted active:text-alert-red"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showQRCode(point.name, point.qrToken)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-theme-tertiary active:opacity-80 rounded-lg text-sm text-theme-secondary uppercase tracking-wider font-semibold"
                    >
                      <QrCode size={16} />
                      QR Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(point.qrToken)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-theme-tertiary active:opacity-80 rounded-lg text-sm text-theme-secondary uppercase tracking-wider font-semibold"
                    >
                      {copiedToken === point.qrToken ? (
                        <>
                          <Check size={16} className="text-tactical-green" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Lien
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access tab */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            {/* Simple Access Section */}
            <div>
              <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lock size={14} />
                Accès simples
              </h3>

              <form onSubmit={handleCreateSimpleAccess} className="mb-4">
                <div className="glass rounded-xl p-4 border-theme-accent">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={newSimpleAccessName}
                      onChange={(e) => setNewSimpleAccessName(e.target.value)}
                      placeholder="Nom de l'accès"
                      className="input-labs w-full px-4 py-3"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSimpleAccessPassword}
                        onChange={(e) => setNewSimpleAccessPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="input-labs flex-1 px-4 py-3 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={
                          !newSimpleAccessName.trim() ||
                          !newSimpleAccessPassword.trim() ||
                          createSimpleAccess.isPending
                        }
                        className="btn-primary disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium"
                      >
                        <Plus size={18} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="space-y-2">
                {(!simpleAccesses || simpleAccesses.length === 0) ? (
                  <div className="glass rounded-xl p-6 text-center border-theme-accent">
                    <Lock size={32} className="text-theme-muted mx-auto mb-2" />
                    <p className="text-theme-muted text-sm uppercase tracking-wide">Aucun accès simple</p>
                  </div>
                ) : (
                  simpleAccesses.map((access) => (
                    <div
                      key={access.id}
                      className="glass rounded-xl p-4 border-theme-accent"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-tactical-green/20 rounded-lg flex items-center justify-center">
                            <Lock size={20} className="text-tactical-green" />
                          </div>
                          <div>
                            <span className="text-theme-primary font-semibold uppercase tracking-wide block">
                              {access.name}
                            </span>
                            {access.description && (
                              <span className="text-theme-muted text-xs">{access.description}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer cet accès ?')) {
                              deleteSimpleAccess.mutate({ id: access.id });
                            }
                          }}
                          className="p-2 text-theme-muted active:text-alert-red"
                        >
                          <Trash size={18} />
                        </button>
                      </div>

                      {/* Password display */}
                      <div className="flex items-center gap-2 mb-3">
                        <Lock size={12} className="text-theme-muted" />
                        <span className="text-theme-muted text-xs uppercase tracking-wider">
                          Mot de passe:
                        </span>
                        <code className="text-theme-primary text-xs font-mono bg-theme-primary/10 px-2 py-0.5 rounded">
                          {showSimplePasswords[access.id] ? access.password : '••••••'}
                        </code>
                        <button
                          onClick={() => toggleSimplePasswordVisibility(access.id)}
                          className="p-1 text-theme-muted hover:text-theme-primary"
                        >
                          {showSimplePasswords[access.id] ? (
                            <EyeSlash size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>

                      {/* QR & Link buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => showSimpleAccessQRCode(access.name, access.qrToken)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-theme-tertiary active:opacity-80 rounded-lg text-sm text-theme-secondary uppercase tracking-wider font-semibold"
                        >
                          <QrCode size={16} />
                          QR Code
                        </button>
                        <button
                          onClick={() => copySimpleAccessToClipboard(access.qrToken)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-theme-tertiary active:opacity-80 rounded-lg text-sm text-theme-secondary uppercase tracking-wider font-semibold"
                        >
                          {copiedSimpleAccessToken === access.qrToken ? (
                            <>
                              <Check size={16} className="text-tactical-green" />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Lien
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Access Points Section (Multi-level) */}
            <div>
              <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <Key size={14} />
                Accès multi-niveaux
              </h3>

              <form onSubmit={handleCreateAccessPoint} className="mb-4">
                <div className="glass rounded-xl p-4 border-theme-accent">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAccessPointName}
                      onChange={(e) => setNewAccessPointName(e.target.value)}
                      placeholder="Nom du point d'accès (Serveur, Coffre...)"
                      className="input-labs flex-1 px-4 py-3"
                    />
                    <button
                      type="submit"
                      disabled={!newAccessPointName.trim() || createAccessPoint.isPending}
                      className="btn-primary disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium"
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {(!accessPoints || accessPoints.length === 0) && (
                  <div className="glass rounded-xl p-6 text-center border-theme-accent">
                    <Key size={32} className="text-theme-muted mx-auto mb-2" />
                    <p className="text-theme-muted text-sm uppercase tracking-wide">Aucun point d&apos;accès multi-niveaux</p>
                  </div>
                )}

              {accessPoints?.map((accessPoint) => (
                <div
                  key={accessPoint.id}
                  className="glass rounded-xl border-theme-accent overflow-hidden"
                >
                  {/* Access Point Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedAccessPoint(
                        expandedAccessPoint === accessPoint.id ? null : accessPoint.id
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Key size={20} className="text-accent" />
                      </div>
                      <div>
                        <span className="text-theme-primary font-semibold uppercase tracking-wide block">
                          {accessPoint.name}
                        </span>
                        <span className="text-theme-muted text-xs">
                          {accessPoint.levels.length} niveau{accessPoint.levels.length !== 1 ? 'x' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Supprimer ce point d\'accès et tous ses niveaux ?')) {
                            deleteAccessPoint.mutate({ id: accessPoint.id });
                          }
                        }}
                        className="p-2 text-theme-muted active:text-alert-red"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedAccessPoint === accessPoint.id && (
                    <div className="border-t border-theme-accent p-4">
                      {/* Levels list */}
                      {accessPoint.levels.length === 0 ? (
                        <p className="text-theme-muted text-sm text-center py-4">
                          Aucun niveau configuré
                        </p>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {accessPoint.levels.map((level) => (
                            <div
                              key={level.id}
                              className="bg-theme-tertiary rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center text-white font-mono text-sm font-bold">
                                    {level.level}
                                  </div>
                                  <span className="text-theme-primary font-medium">
                                    {level.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm('Supprimer ce niveau ?')) {
                                      deleteAccessLevel.mutate({ id: level.id });
                                    }
                                  }}
                                  className="p-1 text-theme-muted active:text-alert-red"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>

                              {/* Password display */}
                              <div className="flex items-center gap-2 mb-2">
                                <Lock size={12} className="text-theme-muted" />
                                <span className="text-theme-muted text-xs uppercase tracking-wider">
                                  Mot de passe:
                                </span>
                                <code className="text-theme-primary text-xs font-mono bg-theme-primary/10 px-2 py-0.5 rounded">
                                  {showPasswords[level.id] ? level.password : '••••••'}
                                </code>
                                <button
                                  onClick={() => togglePasswordVisibility(level.id)}
                                  className="p-1 text-theme-muted hover:text-theme-primary"
                                >
                                  {showPasswords[level.id] ? (
                                    <EyeSlash size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                </button>
                              </div>

                              {/* QR & Link buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    showAccessQRCode(
                                      accessPoint.name,
                                      level.name,
                                      level.level,
                                      level.qrToken
                                    )
                                  }
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-theme-secondary active:opacity-80 rounded-md text-xs text-theme-secondary uppercase tracking-wider font-semibold"
                                >
                                  <QrCode size={14} />
                                  QR
                                </button>
                                <button
                                  onClick={() => copyAccessToClipboard(level.qrToken)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-theme-secondary active:opacity-80 rounded-md text-xs text-theme-secondary uppercase tracking-wider font-semibold"
                                >
                                  {copiedAccessToken === level.qrToken ? (
                                    <>
                                      <Check size={14} className="text-tactical-green" />
                                      Copié
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} />
                                      Lien
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add level form */}
                      <div className="border-t border-theme-accent pt-4">
                        <p className="text-xs text-theme-muted mb-2 uppercase tracking-widest">
                          Ajouter un niveau
                        </p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newLevelName}
                            onChange={(e) => setNewLevelName(e.target.value)}
                            placeholder="Nom du niveau"
                            className="input-labs w-full px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={newLevelPassword}
                            onChange={(e) => setNewLevelPassword(e.target.value)}
                            placeholder="Mot de passe"
                            className="input-labs w-full px-3 py-2 text-sm font-mono"
                          />
                          <button
                            onClick={() => handleAddLevel(accessPoint.id)}
                            disabled={
                              !newLevelName.trim() ||
                              !newLevelPassword.trim() ||
                              addAccessLevel.isPending
                            }
                            className="w-full btn-primary disabled:opacity-50 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                          >
                            <Plus size={16} />
                            Ajouter niveau {accessPoint.levels.length + 1}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Config tab */}
        {activeTab === 'config' && (
          <div className="glass rounded-xl p-4 border-theme-accent">
            {isEditingConfig ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-theme-muted mb-1.5 uppercase tracking-widest">
                    Nom de l&apos;opération
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-labs w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1.5 uppercase tracking-widest">
                    Points par tick
                  </label>
                  <input
                    type="number"
                    value={editPointsPerTick}
                    onChange={(e) => setEditPointsPerTick(parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                    className="input-labs w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1.5 uppercase tracking-widest">
                    Intervalle (secondes)
                  </label>
                  <input
                    type="number"
                    value={editTickInterval}
                    onChange={(e) => setEditTickInterval(parseInt(e.target.value) || 1)}
                    min={1}
                    max={300}
                    className="input-labs w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1.5 uppercase tracking-widest">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value ? parseInt(e.target.value) : '')}
                    min={1}
                    max={480}
                    placeholder="Illimitée"
                    className="input-labs w-full px-4 py-3"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsEditingConfig(false);
                      if (session) {
                        setEditName(session.name);
                        setEditPointsPerTick(session.pointsPerTick);
                        setEditTickInterval(session.tickIntervalSec);
                        setEditDuration(session.durationMinutes ?? '');
                      }
                    }}
                    className="flex-1 bg-theme-tertiary active:opacity-80 text-theme-primary py-3 rounded-xl font-semibold uppercase tracking-wider text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    disabled={updateSession.isPending || !editName.trim()}
                    className="flex-1 btn-primary disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                  >
                    <FloppyDisk size={18} />
                    Sauvegarder
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-theme-primary uppercase tracking-wide">Configuration</h3>
                  <button
                    onClick={() => setIsEditingConfig(true)}
                    className="p-2 bg-theme-tertiary active:opacity-80 text-theme-primary rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-theme-accent">
                    <span className="text-theme-muted text-xs uppercase tracking-widest">Nom</span>
                    <span className="text-theme-primary text-sm font-mono">{session.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-theme-accent">
                    <span className="text-theme-muted text-xs uppercase tracking-widest">Points/tick</span>
                    <span className="text-theme-primary text-sm font-mono">{session.pointsPerTick}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-theme-accent">
                    <span className="text-theme-muted text-xs uppercase tracking-widest">Intervalle</span>
                    <span className="text-theme-primary text-sm font-mono">{session.tickIntervalSec}s</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-theme-accent">
                    <span className="text-theme-muted text-xs uppercase tracking-widest">Durée</span>
                    <span className="text-theme-primary text-sm font-mono">
                      {session.durationMinutes ? `${session.durationMinutes} min` : 'Illimitée'}
                    </span>
                  </div>
                </div>

                {/* Scoring control */}
                {session.status !== 'COMPLETED' && (
                  <div className="mt-6 pt-4 border-t border-theme-accent">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target size={18} className="text-theme-muted" />
                        <span className="text-sm font-semibold text-theme-primary uppercase tracking-wide">
                          Scoring Domination
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs uppercase tracking-wider ${
                          session.scoringEnabled
                            ? 'bg-tactical-green/20 text-tactical-green'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {session.scoringEnabled ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-xs text-theme-muted mb-3">
                      Active ou désactive le scoring des objectifs Domination indépendamment du statut de la session.
                    </p>
                    <button
                      onClick={handleToggleScoring}
                      disabled={setScoringEnabled.isPending}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold uppercase tracking-wider text-sm active:opacity-80 disabled:opacity-50 ${
                        session.scoringEnabled
                          ? 'bg-alert-yellow/10 border border-alert-yellow/30 text-alert-yellow'
                          : 'btn-primary text-white'
                      }`}
                    >
                      {session.scoringEnabled ? (
                        <>
                          <Pause size={18} />
                          Désactiver le scoring
                        </>
                      ) : (
                        <>
                          <Play size={18} />
                          Activer le scoring
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Delete session */}
                <div className="mt-6 pt-4 border-t border-alert-red/30">
                  <button
                    onClick={handleDeleteSession}
                    disabled={deleteSession.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-alert-red/10 border border-alert-red/30 text-alert-red py-3 rounded-xl font-semibold uppercase tracking-wider text-sm active:bg-alert-red/20 disabled:opacity-50"
                  >
                    <Warning size={18} />
                    Supprimer l&apos;opération
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results tab */}
        {activeTab === 'results' && (
          <div>
            {session.status === 'COMPLETED' && (
              <div className="glass rounded-xl p-4 mb-4 bg-gradient-to-r from-alert-yellow/10 to-alert-orange/10 border border-alert-yellow/30">
                <div className="flex items-center gap-3">
                  <Trophy size={24} className="text-alert-yellow" />
                  <div>
                    <p className="text-theme-primary font-semibold uppercase tracking-wide">Opération terminée</p>
                    <p className="text-theme-muted text-sm">
                      {session.endedAt && `Terminée le ${new Date(session.endedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {session.scores.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center border-theme-accent">
                <Trophy size={40} className="text-theme-muted mx-auto mb-2" />
                <p className="text-theme-muted text-sm uppercase tracking-wide">Aucun score enregistré</p>
                <p className="text-theme-muted text-xs mt-1">
                  Les scores apparaîtront une fois l&apos;opération lancée
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...session.scores]
                  .sort((a: DominationScore, b: DominationScore) => b.points - a.points)
                  .map((score: DominationScore, index: number) => {
                    const team = session.teams.find((t: DominationTeam) => t.id === score.teamId);
                    if (!team) return null;

                    const maxScore = Math.max(...session.scores.map((s: DominationScore) => s.points), 1);
                    const percentage = (score.points / maxScore) * 100;
                    const isWinner = index === 0 && session.status === 'COMPLETED';

                    return (
                      <div
                        key={score.id}
                        className={`glass rounded-xl p-4 transition-all border-theme-accent ${
                          isWinner ? 'ring-2 ring-alert-yellow/50' : ''
                        }`}
                        style={{ borderLeft: `4px solid ${team.color}` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}40` }}
                              >
                                {index + 1}
                              </div>
                              {isWinner && (
                                <Crown
                                  size={16}
                                  weight="fill"
                                  className="absolute -top-2 -right-2 text-alert-yellow"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-theme-primary font-semibold uppercase tracking-wide">{team.name}</p>
                              {isWinner && (
                                <p className="text-alert-yellow text-xs font-semibold uppercase tracking-wider">Vainqueur</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-theme-primary font-mono">{score.points}</p>
                            <p className="text-theme-muted text-xs uppercase tracking-widest">pts</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: team.color,
                              boxShadow: `0 0 8px ${team.color}60`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModalPoint && qrDataUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setQrModalPoint(null)}
        >
          <div
            className="glass rounded-2xl w-full max-w-sm p-6 text-center border-theme-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-theme-primary uppercase tracking-wide">{qrModalPoint.name}</h3>
              <button
                onClick={() => setQrModalPoint(null)}
                className="p-2 text-theme-muted active:text-theme-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="text-theme-muted text-sm mb-4">
              Scannez ce QR code pour capturer l&apos;objectif
            </p>
            <button
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center gap-2 btn-primary text-white py-3 rounded-xl font-semibold uppercase tracking-wider"
            >
              <DownloadSimple size={18} />
              Télécharger
            </button>
          </div>
        </div>
      )}

      {/* Access QR Code Modal */}
      {accessQrModalLevel && accessQrDataUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setAccessQrModalLevel(null)}
        >
          <div
            className="glass rounded-2xl w-full max-w-sm p-6 text-center border-theme-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-theme-primary uppercase tracking-wide">
                  {accessQrModalLevel.pointName}
                </h3>
                <p className="text-theme-muted text-sm">
                  Niveau {accessQrModalLevel.level} - {accessQrModalLevel.levelName}
                </p>
              </div>
              <button
                onClick={() => setAccessQrModalLevel(null)}
                className="p-2 text-theme-muted active:text-theme-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={accessQrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="text-theme-muted text-sm mb-4">
              Scannez ce QR code pour déverrouiller l&apos;accès
            </p>
            <button
              onClick={downloadAccessQRCode}
              className="w-full flex items-center justify-center gap-2 btn-primary text-white py-3 rounded-xl font-semibold uppercase tracking-wider"
            >
              <DownloadSimple size={18} />
              Télécharger
            </button>
          </div>
        </div>
      )}

      {/* Simple Access QR Code Modal */}
      {simpleAccessQrModal && simpleAccessQrDataUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSimpleAccessQrModal(null)}
        >
          <div
            className="glass rounded-2xl w-full max-w-sm p-6 text-center border-theme-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-theme-primary uppercase tracking-wide">
                {simpleAccessQrModal.name}
              </h3>
              <button
                onClick={() => setSimpleAccessQrModal(null)}
                className="p-2 text-theme-muted active:text-theme-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={simpleAccessQrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="text-theme-muted text-sm mb-4">
              Scannez ce QR code pour valider l&apos;accès
            </p>
            <button
              onClick={downloadSimpleAccessQRCode}
              className="w-full flex items-center justify-center gap-2 btn-primary text-white py-3 rounded-xl font-semibold uppercase tracking-wider"
            >
              <DownloadSimple size={18} />
              Télécharger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
