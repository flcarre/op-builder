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
} from '@phosphor-icons/react';
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
  const utils = api.useUtils();

  const [activeTab, setActiveTab] = useState<'teams' | 'points' | 'config' | 'results'>('teams');
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
            {session.status === 'DRAFT' && (
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
            )}

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
                  {session.status === 'DRAFT' && (
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
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points tab */}
        {activeTab === 'points' && (
          <div>
            {session.status === 'DRAFT' && (
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
            )}

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
                    {session.status === 'DRAFT' && (
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
                    )}
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
                  {session.status === 'DRAFT' && (
                    <button
                      onClick={() => setIsEditingConfig(true)}
                      className="p-2 bg-theme-tertiary active:opacity-80 text-theme-primary rounded-lg"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
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
                  <div className="flex justify-between py-2">
                    <span className="text-theme-muted text-xs uppercase tracking-widest">Durée</span>
                    <span className="text-theme-primary text-sm font-mono">
                      {session.durationMinutes ? `${session.durationMinutes} min` : 'Illimitée'}
                    </span>
                  </div>
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
    </div>
  );
}
