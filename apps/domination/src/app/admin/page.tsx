'use client';

import Link from 'next/link';
import { api } from '@/trpc/client';
import type { RouterOutputs } from '@crafted/api';
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
  ShieldCheck,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

type DominationSessionItem = NonNullable<RouterOutputs['domination']['getAllSessions']>[number];

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
        return 'status-active';
      case 'PAUSED':
        return 'status-paused';
      case 'COMPLETED':
        return 'status-ended';
      default:
        return 'bg-tactical-blue';
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
    <div className="min-h-screen bg-theme-primary safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-theme-secondary/90 backdrop-blur-lg border-b border-theme-accent">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-tertiary text-theme-primary active:opacity-80"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-lg font-bold text-theme-primary flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck size={20} weight="fill" className="text-accent" />
              Centre de Commande
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg btn-primary"
            >
              <Plus size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Create form modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center p-4">
            <div
              className="glass rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 border-theme-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-theme-primary mb-4 uppercase tracking-wide">
                Nouvelle Opération
              </h2>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs text-theme-muted mb-1.5 uppercase tracking-widest">
                    Nom de l&apos;opération
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Ex: Op. Tempête Rouge"
                    autoFocus
                    className="input-labs w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-muted mb-1.5 uppercase tracking-widest">
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
                      className="input-labs flex-1 px-4 py-3"
                    />
                    <span className="text-theme-muted text-sm uppercase">min</span>
                  </div>
                  <p className="text-theme-muted text-xs mt-1.5">
                    Laissez vide pour une durée illimitée
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-theme-tertiary active:opacity-80 text-theme-primary py-3 rounded-xl font-semibold uppercase tracking-wider text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!newSessionName.trim() || createSession.isPending}
                    className="flex-1 btn-primary disabled:opacity-50 text-white py-3 rounded-xl font-semibold uppercase tracking-wider text-sm"
                  >
                    Déployer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sessions list */}
        {isLoading && (
          <div className="glass p-8 rounded-xl text-center text-theme-muted border-theme-accent">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 spinner-accent mx-auto mb-3" />
            <p className="text-sm uppercase tracking-widest">Chargement...</p>
          </div>
        )}

        {sessions?.length === 0 && !isLoading && (
          <div className="glass p-8 rounded-xl text-center border-theme-accent">
            <Flag size={48} className="text-theme-muted mx-auto mb-3" />
            <p className="text-theme-muted mb-1 uppercase tracking-wide">Aucune opération</p>
            <p className="text-theme-muted text-sm">
              Déployez votre première opération pour commencer
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sessions?.map((session: DominationSessionItem) => (
            <div key={session.id} className="glass rounded-xl overflow-hidden border-theme-accent">
              <Link
                href={`/admin/sessions/${session.id}`}
                className="flex items-center justify-between p-4 active:opacity-80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(session.status)} ${
                      session.status === 'ACTIVE' ? 'animate-pulse' : ''
                    }`}
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-theme-primary truncate uppercase tracking-wide">
                      {session.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-theme-muted uppercase tracking-wider">
                      <span>{getStatusLabel(session.status)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Timer size={12} />
                        {formatDuration(session.durationMinutes)}
                      </span>
                    </div>
                  </div>
                </div>
                <CaretRight size={18} className="text-theme-muted flex-shrink-0" />
              </Link>

              {/* Action buttons */}
              <div className="flex border-t border-theme-accent">
                {session.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => startSession.mutate({ id: session.id })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-tactical-green active:bg-tactical-green/10 border-r border-theme-accent uppercase text-xs tracking-wider font-semibold"
                    >
                      <PlayCircle size={18} weight="fill" />
                      <span>Lancer</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cette opération ?')) {
                          deleteSession.mutate({ id: session.id });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-alert-red active:bg-alert-red/10 uppercase text-xs tracking-wider font-semibold"
                    >
                      <Trash size={18} />
                      <span>Supprimer</span>
                    </button>
                  </>
                )}

                {session.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => pauseSession.mutate({ id: session.id })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-alert-yellow active:bg-alert-yellow/10 border-r border-theme-accent uppercase text-xs tracking-wider font-semibold"
                    >
                      <Pause size={18} weight="fill" />
                      <span>Pause</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Terminer cette opération ?')) {
                          endSession.mutate({ id: session.id });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-alert-red active:bg-alert-red/10 uppercase text-xs tracking-wider font-semibold"
                    >
                      <Stop size={18} weight="fill" />
                      <span>Terminer</span>
                    </button>
                  </>
                )}

                {session.status === 'PAUSED' && (
                  <>
                    <button
                      onClick={() => resumeSession.mutate({ id: session.id })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-tactical-green active:bg-tactical-green/10 border-r border-theme-accent uppercase text-xs tracking-wider font-semibold"
                    >
                      <Play size={18} weight="fill" />
                      <span>Reprendre</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Terminer cette opération ?')) {
                          endSession.mutate({ id: session.id });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-alert-red active:bg-alert-red/10 uppercase text-xs tracking-wider font-semibold"
                    >
                      <Stop size={18} weight="fill" />
                      <span>Terminer</span>
                    </button>
                  </>
                )}

                {session.status === 'COMPLETED' && (
                  <div className="flex-1 flex items-center justify-center py-3 text-theme-muted uppercase text-xs tracking-wider">
                    <span>Opération terminée</span>
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
