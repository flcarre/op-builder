'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/client';
import type { RouterOutputs } from '@crafted/api';
import {
  Flag,
  Users,
  MapPin,
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
} from '@phosphor-icons/react';
import QRCode from 'qrcode';

type DominationSession = NonNullable<RouterOutputs['domination']['getSession']>;
type DominationTeam = DominationSession['teams'][number];
type DominationPoint = DominationSession['points'][number];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const utils = api.useUtils();

  const [activeTab, setActiveTab] = useState<'teams' | 'points' | 'config'>('teams');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-domination-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <Flag size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Session non trouvée</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-domination-400 mt-4"
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
      DRAFT: { color: 'bg-blue-500/20 text-blue-400', label: 'Brouillon' },
      ACTIVE: { color: 'bg-green-500/20 text-green-400', label: 'En cours' },
      PAUSED: { color: 'bg-yellow-500/20 text-yellow-400', label: 'En pause' },
      COMPLETED: { color: 'bg-gray-500/20 text-gray-400', label: 'Terminée' },
    };
    const config = statusConfig[session.status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 safe-area-inset flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-white/5">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-white truncate">
                {session.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'teams'
                  ? 'bg-domination-500 text-white'
                  : 'text-gray-400'
              }`}
            >
              <Users size={16} className="inline mr-1.5 -mt-0.5" />
              Équipes
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'points'
                  ? 'bg-domination-500 text-white'
                  : 'text-gray-400'
              }`}
            >
              <MapPin size={16} className="inline mr-1.5 -mt-0.5" />
              Points
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'config'
                  ? 'bg-domination-500 text-white'
                  : 'text-gray-400'
              }`}
            >
              <Gear size={16} className="inline mr-1.5 -mt-0.5" />
              Config
            </button>
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
                <div className="glass rounded-xl p-4">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Nom de l'équipe..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-domination-500 mb-3"
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
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                              : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={!newTeamName.trim() || createTeam.isPending}
                      className="bg-domination-500 active:bg-domination-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
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
                <div className="glass rounded-xl p-8 text-center">
                  <Users size={40} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucune équipe</p>
                </div>
              )}
              {session.teams.map((team: DominationTeam) => (
                <div
                  key={team.id}
                  className="glass rounded-xl p-4 flex items-center justify-between"
                  style={{ borderLeft: `4px solid ${team.color}` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="text-white font-medium">{team.name}</span>
                  </div>
                  {session.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cette équipe ?')) {
                          deleteTeam.mutate({ id: team.id });
                        }
                      }}
                      className="p-2 text-gray-400 active:text-red-400"
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
                <div className="glass rounded-xl p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPointName}
                      onChange={(e) => setNewPointName(e.target.value)}
                      placeholder="Nom du point (Alpha, Bravo...)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-domination-500"
                    />
                    <button
                      type="submit"
                      disabled={!newPointName.trim() || createPoint.isPending}
                      className="bg-domination-500 active:bg-domination-600 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium"
                    >
                      <Plus size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {session.points.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                  <MapPin size={40} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucun point</p>
                </div>
              )}
              {session.points.map((point: DominationPoint) => (
                <div
                  key={point.id}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-domination-500/20 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-domination-500" />
                      </div>
                      <span className="text-white font-medium">{point.name}</span>
                    </div>
                    {session.status === 'DRAFT' && (
                      <button
                        onClick={() => {
                          if (confirm('Supprimer ce point ?')) {
                            deletePoint.mutate({ id: point.id });
                          }
                        }}
                        className="p-2 text-gray-400 active:text-red-400"
                      >
                        <Trash size={18} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showQRCode(point.name, point.qrToken)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 active:bg-white/10 rounded-lg text-sm text-gray-300"
                    >
                      <QrCode size={16} />
                      QR Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(point.qrToken)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 active:bg-white/10 rounded-lg text-sm text-gray-300"
                    >
                      {copiedToken === point.qrToken ? (
                        <>
                          <Check size={16} className="text-green-400" />
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
          <div className="glass rounded-xl p-4">
            {isEditingConfig ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Nom de la session
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-domination-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Points par tick
                  </label>
                  <input
                    type="number"
                    value={editPointsPerTick}
                    onChange={(e) => setEditPointsPerTick(parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-domination-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Intervalle (secondes)
                  </label>
                  <input
                    type="number"
                    value={editTickInterval}
                    onChange={(e) => setEditTickInterval(parseInt(e.target.value) || 1)}
                    min={1}
                    max={300}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-domination-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value ? parseInt(e.target.value) : '')}
                    min={1}
                    max={480}
                    placeholder="Illimitée"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-domination-500"
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
                    className="flex-1 bg-white/10 active:bg-white/20 text-white py-3 rounded-xl font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    disabled={updateSession.isPending || !editName.trim()}
                    className="flex-1 bg-domination-500 active:bg-domination-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <FloppyDisk size={18} />
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Configuration</h3>
                  {session.status === 'DRAFT' && (
                    <button
                      onClick={() => setIsEditingConfig(true)}
                      className="p-2 bg-white/10 active:bg-white/20 text-white rounded-lg"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Nom</span>
                    <span className="text-white text-sm">{session.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Points par tick</span>
                    <span className="text-white text-sm">{session.pointsPerTick}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Intervalle</span>
                    <span className="text-white text-sm">{session.tickIntervalSec}s</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400 text-sm">Durée</span>
                    <span className="text-white text-sm">
                      {session.durationMinutes ? `${session.durationMinutes} min` : 'Illimitée'}
                    </span>
                  </div>
                </div>
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
            className="glass rounded-2xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{qrModalPoint.name}</h3>
              <button
                onClick={() => setQrModalPoint(null)}
                className="p-2 text-gray-400 active:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Scannez ce QR code pour capturer le point
            </p>
            <button
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center gap-2 bg-domination-500 active:bg-domination-600 text-white py-3 rounded-xl font-medium"
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
