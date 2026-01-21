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
} from '@phosphor-icons/react';
import Link from 'next/link';

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

  const { data: point, isLoading, error } = api.domination.getPointByToken.useQuery(
    { qrToken: token },
    { retry: false }
  );

  const { data: session } = api.domination.getSession.useQuery(
    { id: point?.sessionId ?? '' },
    { enabled: !!point?.sessionId }
  );

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-domination-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center safe-area-inset p-4">
        <div className="glass p-8 rounded-2xl text-center max-w-sm w-full">
          <WarningCircle size={56} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">
            Point non trouvé
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Ce QR code n&apos;est pas valide ou le point n&apos;existe plus.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 active:bg-white/20 text-white px-5 py-3 rounded-xl transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center safe-area-inset p-4">
        <div className="glass p-8 rounded-2xl text-center max-w-sm w-full">
          <Flag size={56} className="text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">{point.name}</h1>
          <p className="text-gray-400 text-sm mb-6">
            {session?.status === 'DRAFT'
              ? 'La session n\'a pas encore commencé.'
              : session?.status === 'PAUSED'
                ? 'La session est en pause.'
                : 'La session est terminée.'}
          </p>
          <Link
            href={`/live?session=${session?.id}`}
            className="inline-flex items-center justify-center gap-2 bg-domination-500 active:bg-domination-600 text-white px-5 py-3 rounded-xl transition-colors w-full"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center safe-area-inset p-4">
        <div className="glass p-8 rounded-2xl text-center max-w-sm w-full animate-capture">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: capturedTeam?.color || '#22c55e' }}
          >
            <CheckCircle size={48} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Point capturé !
          </h1>
          <p className="text-lg text-gray-300 mb-3">{point.name}</p>
          {capturedTeam && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-6">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: capturedTeam.color }}
              />
              <span className="text-white font-medium">
                {capturedTeam.name}
              </span>
            </div>
          )}
          <div className="space-y-3">
            <Link
              href={`/live?session=${session?.id}`}
              className="flex items-center justify-center gap-2 bg-domination-500 active:bg-domination-600 text-white px-5 py-4 rounded-xl transition-colors w-full font-medium"
            >
              <Trophy size={20} />
              Voir le scoreboard
            </Link>
            <button
              onClick={() => {
                setCaptureSuccess(false);
                setSelectedTeamId(null);
              }}
              className="w-full bg-white/10 active:bg-white/20 text-white px-5 py-4 rounded-xl transition-colors font-medium"
            >
              Capturer à nouveau
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 safe-area-inset flex flex-col">
      {/* Header */}
      <header className="px-4 py-4">
        <Link
          href={`/live?session=${session?.id}`}
          className="inline-flex items-center gap-2 text-gray-400 active:text-white text-sm"
        >
          <ArrowLeft size={16} />
          Scoreboard
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col">
        {/* Point info */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              backgroundColor: currentController?.color
                ? `${currentController.color}30`
                : 'rgba(168, 85, 247, 0.2)'
            }}
          >
            <Flag
              size={32}
              weight="fill"
              style={{ color: currentController?.color || '#a855f7' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{point.name}</h1>
          {point.description && (
            <p className="text-gray-400 text-sm">{point.description}</p>
          )}
        </div>

        {/* Current controller */}
        {currentController && (
          <div className="glass rounded-xl p-4 mb-6 text-center">
            <p className="text-xs text-gray-500 mb-2">Actuellement contrôlé par</p>
            <div className="inline-flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentController.color }}
              />
              <span className="text-white font-semibold">
                {currentController.name}
              </span>
            </div>
          </div>
        )}

        {/* Team selection */}
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-3 text-center">
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
                  className={`relative p-5 rounded-xl text-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-[1.02]'
                      : isCurrentController
                        ? 'opacity-40'
                        : 'active:scale-[0.98]'
                  }`}
                  style={{ backgroundColor: team.color }}
                >
                  <span className="text-white font-bold text-lg block">
                    {team.name}
                  </span>
                  {isCurrentController && (
                    <span className="text-white/80 text-xs mt-1 block">
                      Contrôle déjà
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <CheckCircle size={16} weight="fill" className="text-green-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {captureError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {captureError}
          </div>
        )}

        {/* Capture button */}
        <div className="mt-6 pb-2">
          <button
            onClick={handleCapture}
            disabled={!selectedTeamId || capturePoint.isPending}
            className="w-full bg-domination-500 active:bg-domination-600 disabled:opacity-50 disabled:active:bg-domination-500 text-white py-4 rounded-xl font-bold text-lg transition-colors"
          >
            {capturePoint.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                Capture...
              </span>
            ) : (
              'CAPTURER'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
