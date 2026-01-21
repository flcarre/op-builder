'use client';

import Link from 'next/link';
import { api } from '@/trpc/client';
import {
  Plus,
  Flag,
  Play,
  Pause,
  Stop,
  Trash,
  CaretRight,
  Timer,
  ArrowLeft,
  PlayCircle,
} from '@phosphor-icons/react';
import { useState } from 'react';

export default function AdminPage() {
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState<number | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const utils = api.useUtils();

  const { data: sessions, isLoading } =
    api.domination.getAllSessions.useQuery();

  const createSession = api.domination.createSession.useMutation({
    onSuccess: () => {
      utils.domination.getAllSessions.invalidate();
      setNewSessionName('');
      setNewSessionDuration('');
      setShowCreateForm(false);
    },
  });

  const deleteSession = api.domination.deleteSession.useMutation({
    onSuccess: () => utils.domination.getAllSessions.invalidate(),
  });

  const startSession = api.domination.startSession.useMutation({
    onSuccess: () => utils.domination.getAllSessions.invalidate(),
  });

  const pauseSession = api.domination.pauseSession.useMutation({
    onSuccess: () => utils.domination.getAllSessions.invalidate(),
  });

  const resumeSession = api.domination.resumeSession.useMutation({
    onSuccess: () => utils.domination.getAllSessions.invalidate(),
  });

  const endSession = api.domination.endSession.useMutation({
    onSuccess: () => utils.domination.getAllSessions.invalidate(),
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      createSession.mutate({
        name: newSessionName.trim(),
        durationMinutes: newSessionDuration || undefined,
      });
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Illimitée';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
    }
    return `${mins}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'PAUSED':
        return 'bg-yellow-500';
      case 'COMPLETED':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon';
      case 'ACTIVE':
        return 'En cours';
      case 'PAUSED':
        return 'En pause';
      case 'COMPLETED':
        return 'Terminée';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-white/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Flag size={20} weight="fill" className="text-domination-500" />
              Administration
            </h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-domination-500 text-white active:bg-domination-600"
          >
            <Plus size={20} weight="bold" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Create form modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
            <div
              className="glass rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Nouvelle session
              </h2>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Nom de la session
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Ex: Partie du samedi"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-domination-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Durée (optionnel)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newSessionDuration}
                      onChange={(e) => setNewSessionDuration(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="30"
                      min={1}
                      max={480}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-domination-500"
                    />
                    <span className="text-gray-400">minutes</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1.5">
                    Laissez vide pour une durée illimitée
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-white/10 active:bg-white/20 text-white py-3 rounded-xl font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!newSessionName.trim() || createSession.isPending}
                    className="flex-1 bg-domination-500 active:bg-domination-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sessions list */}
        {isLoading && (
          <div className="glass p-8 rounded-xl text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-domination-500 mx-auto mb-3" />
            Chargement...
          </div>
        )}

        {sessions?.length === 0 && !isLoading && (
          <div className="glass p-8 rounded-xl text-center">
            <Flag size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-1">Aucune session</p>
            <p className="text-gray-500 text-sm">
              Créez votre première session pour commencer
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sessions?.map((session) => (
            <div key={session.id} className="glass rounded-xl overflow-hidden">
              <Link
                href={`/admin/sessions/${session.id}`}
                className="flex items-center justify-between p-4 active:bg-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(session.status)} ${
                      session.status === 'ACTIVE' ? 'animate-pulse' : ''
                    }`}
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {session.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getStatusLabel(session.status)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Timer size={12} />
                        {formatDuration(session.durationMinutes)}
                      </span>
                    </div>
                  </div>
                </div>
                <CaretRight size={18} className="text-gray-500 flex-shrink-0" />
              </Link>

              {/* Action buttons */}
              <div className="flex border-t border-white/5">
                {session.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => startSession.mutate({ id: session.id })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-green-400 active:bg-green-500/10 border-r border-white/5"
                    >
                      <PlayCircle size={18} weight="fill" />
                      <span className="text-sm">Démarrer</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cette session ?')) {
                          deleteSession.mutate({ id: session.id });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-400 active:bg-red-500/10"
                    >
                      <Trash size={18} />
                      <span className="text-sm">Supprimer</span>
                    </button>
                  </>
                )}

                {session.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => pauseSession.mutate({ id: session.id })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-yellow-400 active:bg-yellow-500/10 border-r border-white/5"
                    >
                      <Pause size={18} weight="fill" />
                      <span className="text-sm">Pause</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Terminer cette session ?')) {
                          endSession.mutate({ id: session.id });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-400 active:bg-red-500/10"
                    >
                      <Stop size={18} weight="fill" />
                      <span className="text-sm">Terminer</span>
                    </button>
                  </>
                )}

                {session.status === 'PAUSED' && (
                  <>
                    <button
                      onClick={() => resumeSession.mutate({ id: session.id })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-green-400 active:bg-green-500/10 border-r border-white/5"
                    >
                      <Play size={18} weight="fill" />
                      <span className="text-sm">Reprendre</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Terminer cette session ?')) {
                          endSession.mutate({ id: session.id });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-400 active:bg-red-500/10"
                    >
                      <Stop size={18} weight="fill" />
                      <span className="text-sm">Terminer</span>
                    </button>
                  </>
                )}

                {session.status === 'COMPLETED' && (
                  <div className="flex-1 flex items-center justify-center py-3 text-gray-500">
                    <span className="text-sm">Session terminée</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
