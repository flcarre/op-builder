'use client';

import { use, useState } from 'react';
import { api } from '@/trpc/client';
import type { RouterOutputs } from '@crafted/api';
import {
  Flag,
  CheckCircle,
  WarningCircle,
  Trophy,
  ArrowLeft,
  Crosshair,
  ShieldCheck,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

type DominationSession = NonNullable<RouterOutputs['domination']['getSession']>;
type DominationTeam = DominationSession['teams'][number];

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function CapturePage({ params }: PageProps) {
  const { token } = use(params);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const { data: point, isLoading: isLoadingPoint, error } = api.domination.getPointByToken.useQuery(
    { qrToken: token },
    { retry: false }
  );

  const { data: session, isLoading: isLoadingSession } = api.domination.getSession.useQuery(
    { id: point?.sessionId ?? '' },
    { enabled: !!point?.sessionId }
  );

  const isLoading = isLoadingPoint || (!!point?.sessionId && isLoadingSession);

  const capturePoint = api.domination.capturePoint.useMutation({
    onSuccess: () => {
      setCaptureSuccess(true);
      setCaptureError(null);
    },
    onError: (err) => {
      setCaptureError(err.message);
    },
  });

  const handleCapture = () => {
    if (!selectedTeamId) return;
    capturePoint.mutate({
      qrToken: token,
      teamId: selectedTeamId,
    });
  };

  const lastCaptureTeamId = point?.captures?.[0]?.teamId;
  const currentController = lastCaptureTeamId
    ? session?.teams.find((t: DominationTeam) => t.id === lastCaptureTeamId)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 spinner-accent mx-auto mb-4" />
          <p className="text-theme-muted text-sm uppercase tracking-widest">Identification...</p>
        </div>
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm w-full border border-alert-red/30">
          <div className="w-16 h-16 rounded-xl bg-alert-red/20 mx-auto mb-4 flex items-center justify-center">
            <WarningCircle size={40} className="text-alert-red" />
          </div>
          <h1 className="text-xl font-bold text-theme-primary mb-2 uppercase tracking-wide">
            Objectif non trouvé
          </h1>
          <p className="text-theme-muted text-sm mb-6">
            Ce QR code n&apos;est pas valide ou l&apos;objectif n&apos;existe plus.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-theme-tertiary active:opacity-80 text-theme-primary px-5 py-3 rounded-xl transition-colors uppercase tracking-wider text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  if (session?.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm w-full border border-alert-yellow/30">
          <div className="w-16 h-16 rounded-xl bg-alert-yellow/20 mx-auto mb-4 flex items-center justify-center">
            <Flag size={40} className="text-alert-yellow" />
          </div>
          <h1 className="text-xl font-bold text-theme-primary mb-2 uppercase tracking-wide">{point.name}</h1>
          <p className="text-theme-muted text-sm mb-6">
            {session?.status === 'DRAFT'
              ? 'L\'opération n\'a pas encore commencé.'
              : session?.status === 'PAUSED'
                ? 'L\'opération est suspendue.'
                : 'L\'opération est terminée.'}
          </p>
          <Link
            href={`/live?session=${session?.id}`}
            className="inline-flex items-center justify-center gap-2 btn-primary text-white px-5 py-3 rounded-xl w-full"
          >
            <Trophy size={18} />
            Voir le scoreboard
          </Link>
        </div>
      </div>
    );
  }

  if (captureSuccess) {
    const capturedTeam = session?.teams.find((t: DominationTeam) => t.id === selectedTeamId);
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm w-full animate-capture border-2"
          style={{ borderColor: capturedTeam?.color || '#22c55e' }}
        >
          <div
            className="w-20 h-20 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{
              backgroundColor: capturedTeam?.color || '#22c55e',
              boxShadow: `0 0 30px ${capturedTeam?.color || '#22c55e'}60`,
            }}
          >
            <ShieldCheck size={48} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary mb-1 uppercase tracking-wide">
            Objectif capturé
          </h1>
          <p className="text-lg text-theme-secondary mb-4">{point.name}</p>
          {capturedTeam && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6"
              style={{
                backgroundColor: `${capturedTeam.color}20`,
                border: `1px solid ${capturedTeam.color}40`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: capturedTeam.color,
                  boxShadow: `0 0 8px ${capturedTeam.color}`,
                }}
              />
              <span className="text-theme-primary font-semibold">
                {capturedTeam.name}
              </span>
            </div>
          )}
          <div className="space-y-3">
            <Link
              href={`/live?session=${session?.id}`}
              className="flex items-center justify-center gap-2 btn-primary text-white px-5 py-4 rounded-xl w-full"
            >
              <Trophy size={20} />
              Voir le scoreboard
            </Link>
            <button
              onClick={() => {
                setCaptureSuccess(false);
                setSelectedTeamId(null);
              }}
              className="w-full bg-theme-tertiary active:opacity-80 text-theme-primary px-5 py-4 rounded-xl transition-colors font-semibold uppercase tracking-wider text-sm"
            >
              Capturer à nouveau
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary safe-area-inset flex flex-col">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 bg-theme-secondary/80 backdrop-blur-lg border-b border-theme-accent">
        <div className="flex items-center justify-between">
          <Link
            href={`/live?session=${session?.id}`}
            className="inline-flex items-center gap-2 text-theme-muted active:text-theme-primary text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            Scoreboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 px-4 py-6 overflow-auto">
        {/* Point info */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{
              backgroundColor: currentController?.color
                ? `${currentController.color}20`
                : 'rgba(220, 38, 38, 0.2)',
              boxShadow: currentController?.color
                ? `0 0 20px ${currentController.color}30`
                : '0 0 20px rgba(220, 38, 38, 0.2)',
            }}
          >
            <Crosshair
              size={32}
              weight="bold"
              style={{ color: currentController?.color || '#dc2626' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary mb-1 uppercase tracking-wide">{point.name}</h1>
          {point.description && (
            <p className="text-theme-muted text-sm">{point.description}</p>
          )}
        </div>

        {/* Current controller */}
        {currentController && (
          <div
            className="glass rounded-xl p-4 mb-6 text-center border-l-4"
            style={{ borderLeftColor: currentController.color }}
          >
            <p className="text-xs text-theme-muted mb-2 uppercase tracking-widest">Contrôlé par</p>
            <div className="inline-flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: currentController.color,
                  boxShadow: `0 0 8px ${currentController.color}`,
                }}
              />
              <span className="text-theme-primary font-bold text-lg">
                {currentController.name}
              </span>
            </div>
          </div>
        )}

        {/* Team selection */}
        <div>
          <p className="text-sm text-theme-muted mb-4 text-center uppercase tracking-widest">
            Sélectionnez votre équipe
          </p>
          <div className="grid grid-cols-2 gap-3">
            {session?.teams.map((team: DominationTeam) => {
              const isCurrentController = currentController?.id === team.id;
              const isSelected = selectedTeamId === team.id;

              return (
                <button
                  key={team.id}
                  onClick={() => !isCurrentController && setSelectedTeamId(team.id)}
                  disabled={isCurrentController}
                  className={`relative p-4 rounded-xl text-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-theme-primary ring-offset-2 ring-offset-theme-primary scale-[1.02]'
                      : isCurrentController
                        ? 'opacity-40 cursor-not-allowed'
                        : 'active:scale-[0.98]'
                  }`}
                  style={{
                    backgroundColor: team.color,
                    boxShadow: isSelected ? `0 0 20px ${team.color}60` : undefined,
                  }}
                >
                  <span className="text-white font-bold text-base block uppercase tracking-wide">
                    {team.name}
                  </span>
                  {isCurrentController && (
                    <span className="text-white/70 text-xs mt-1 block uppercase tracking-wider">
                      Contrôle actif
                    </span>
                  )}
                  {isSelected && (
                    <div
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: team.color,
                        boxShadow: `0 0 10px ${team.color}`,
                      }}
                    >
                      <CheckCircle size={18} weight="fill" className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {captureError && (
          <div className="mt-4 p-4 bg-alert-red/10 border border-alert-red/30 rounded-xl text-alert-red text-sm text-center">
            <WarningCircle size={20} className="inline mr-2 -mt-0.5" />
            {captureError}
          </div>
        )}
      </div>

      {/* Sticky Capture button */}
      <div className="sticky bottom-0 px-4 py-4 bg-gradient-to-t from-theme-primary via-theme-primary/95 to-transparent">
        <button
          onClick={handleCapture}
          disabled={!selectedTeamId || capturePoint.isPending}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg uppercase tracking-widest"
        >
          {capturePoint.isPending ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
              Capture en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Crosshair size={22} weight="bold" />
              Capturer
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
