'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/client';
import type { RouterOutputs } from '@crafted/api';
import {
  Trophy,
  Flag,
  MapPin,
  ArrowLeft,
  Timer,
  ArrowsClockwise,
  CaretRight,
} from '@phosphor-icons/react';

type DominationSessionItem = NonNullable<RouterOutputs['domination']['getAllSessions']>[number];
type DominationState = NonNullable<RouterOutputs['domination']['getState']>;
type DominationStateTeam = DominationState['teams'][number];
type DominationStatePoint = DominationState['points'][number];
type DominationStateScore = DominationState['scores'][number];

const REFRESH_INTERVAL_MS = 5000;

function RefreshIndicator({ isFetching }: { isFetching: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
      <ArrowsClockwise
        size={12}
        className={isFetching ? 'animate-spin text-domination-400' : ''}
      />
      <span>{isFetching ? 'Mise à jour...' : '5s'}</span>
    </div>
  );
}

function AnimatedScore({ value, isFetching }: { value: number; isFetching: boolean }) {
  return (
    <span
      className={`text-3xl font-bold text-white tabular-nums transition-all duration-300 ${
        isFetching ? 'blur-[2px] opacity-70' : 'blur-0 opacity-100'
      }`}
    >
      {value}
    </span>
  );
}

function AnimatedBar({
  percentage,
  color,
  isFetching,
}: {
  percentage: number;
  color: string;
  isFetching: boolean;
}) {
  return (
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isFetching ? 'opacity-60' : 'opacity-100'
        }`}
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Terminé');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <span className={`font-mono text-2xl font-bold ${isExpired ? 'text-red-400' : 'text-white'}`}>
      {timeLeft}
    </span>
  );
}

function LiveScoreboardContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [activeTab, setActiveTab] = useState<'scores' | 'points'>('scores');

  const { data: sessions } = api.domination.getAllSessions.useQuery(undefined, {
    enabled: !sessionId,
  });

  const { data: state, refetch, isFetching } = api.domination.getState.useQuery(
    { id: sessionId ?? '' },
    {
      enabled: !!sessionId,
      staleTime: REFRESH_INTERVAL_MS - 1000,
      refetchInterval: (query) => {
        const data = query.state.data;
        return data?.session.status === 'ACTIVE' ? REFRESH_INTERVAL_MS : false;
      },
    }
  );

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 safe-area-inset">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-white">Scoreboard Live</h1>
          </div>

          <p className="text-gray-400 text-sm mb-4">
            Sélectionnez une session :
          </p>

          <div className="space-y-3">
            {sessions
              ?.filter((s: DominationSessionItem) => s.status === 'ACTIVE' || s.status === 'PAUSED')
              .map((session: DominationSessionItem) => (
                <Link
                  key={session.id}
                  href={`/live?session=${session.id}`}
                  className="flex items-center justify-between glass p-4 rounded-xl active:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        session.status === 'ACTIVE'
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {session.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {session.status === 'ACTIVE' ? 'En cours' : 'En pause'}
                      </p>
                    </div>
                  </div>
                  <CaretRight size={20} className="text-gray-500" />
                </Link>
              ))}

            {sessions?.filter(
              (s: DominationSessionItem) => s.status === 'ACTIVE' || s.status === 'PAUSED'
            ).length === 0 && (
              <div className="glass p-8 rounded-xl text-center text-gray-400">
                Aucune session active
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-domination-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  const sortedScores = [...state.scores].sort((a: DominationStateScore, b: DominationStateScore) => b.points - a.points);
  const maxScore = Math.max(...sortedScores.map((s: DominationStateScore) => s.points), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 safe-area-inset flex flex-col">
      {/* Header compact pour mobile */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-lg border-b border-white/5">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/live"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      state.session.status === 'ACTIVE'
                        ? 'bg-green-500 animate-pulse'
                        : state.session.status === 'PAUSED'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                    }`}
                  />
                  <h1 className="text-base font-bold text-white truncate">
                    {state.session.name}
                  </h1>
                </div>
                <p className="text-xs text-gray-500">
                  {state.session.status === 'ACTIVE'
                    ? 'En cours'
                    : state.session.status === 'PAUSED'
                      ? 'En pause'
                      : 'Terminée'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {state.session.status === 'ACTIVE' && <RefreshIndicator isFetching={isFetching} />}
              <button
                onClick={() => refetch()}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20"
              >
                <ArrowsClockwise size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Timer en bannière si session active avec durée */}
        {state.session.endsAt && state.session.status === 'ACTIVE' && (
          <div className="px-4 pb-3">
            <div className="bg-domination-500/20 rounded-lg px-4 py-2 flex items-center justify-center gap-2">
              <Timer size={18} className="text-domination-400" />
              <CountdownTimer endsAt={new Date(state.session.endsAt)} />
            </div>
          </div>
        )}
      </header>

      {/* Tabs pour mobile */}
      <div className="px-4 pt-4">
        <div className="flex bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scores'
                ? 'bg-domination-500 text-white'
                : 'text-gray-400'
            }`}
          >
            <Trophy size={16} className="inline mr-1.5 -mt-0.5" />
            Classement
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'points'
                ? 'bg-domination-500 text-white'
                : 'text-gray-400'
            }`}
          >
            <MapPin size={16} className="inline mr-1.5 -mt-0.5" />
            Points
          </button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 px-4 py-4 overflow-auto">
        {activeTab === 'scores' ? (
          <div className="space-y-3">
            {sortedScores.map((score: DominationStateScore, index: number) => {
              const team = state.teams.find((t: DominationStateTeam) => t.id === score.teamId);
              if (!team) return null;

              const percentage = (score.points / maxScore) * 100;
              const controlledCount = state.points.filter(
                (p: DominationStatePoint) => p.controlledBy?.id === team.id
              ).length;

              return (
                <div
                  key={score.teamId}
                  className="glass rounded-xl p-4 transition-all"
                  style={{
                    borderLeft: `4px solid ${team.color}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-2xl font-bold w-8 ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                              ? 'text-gray-400'
                              : index === 2
                                ? 'text-amber-600'
                                : 'text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-white font-semibold">
                          {team.name}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Flag size={10} />
                          <span>{controlledCount} point{controlledCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <AnimatedScore value={score.points} isFetching={isFetching} />
                  </div>
                  <AnimatedBar percentage={percentage} color={team.color} isFetching={isFetching} />
                </div>
              );
            })}

            {sortedScores.length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <Trophy size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucun point marqué</p>
                <p className="text-gray-500 text-sm mt-1">
                  Les équipes doivent capturer des points
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {state.points.map((point: DominationStatePoint) => (
              <div
                key={point.id}
                className="glass rounded-xl p-4 transition-all"
                style={{
                  borderLeft: `4px solid ${point.controlledBy?.color || '#6b7280'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: point.controlledBy?.color
                          ? `${point.controlledBy.color}20`
                          : 'rgba(107, 114, 128, 0.2)'
                      }}
                    >
                      <Flag
                        size={20}
                        weight="fill"
                        style={{
                          color: point.controlledBy?.color || '#6b7280',
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-white font-medium">
                        {point.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {point.controlledBy ? (
                          <>
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: point.controlledBy.color }}
                            />
                            <span className="text-sm text-gray-400">
                              {point.controlledBy.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Non capturé</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {point.controlledBy && (
                    <div
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${point.controlledBy.color}30`,
                        color: point.controlledBy.color
                      }}
                    >
                      Contrôlé
                    </div>
                  )}
                </div>
              </div>
            ))}

            {state.points.length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <MapPin size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Aucun point configuré</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Résumé sticky en bas sur mobile */}
      <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 px-4 py-3">
        <div className="flex justify-around">
          {sortedScores.slice(0, 3).map((score: DominationStateScore, index: number) => {
            const team = state.teams.find((t: DominationStateTeam) => t.id === score.teamId);
            if (!team) return null;

            return (
              <div key={score.teamId} className="text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: team.color }}
                >
                  {index + 1}
                </div>
                <p className="text-white text-sm font-medium truncate max-w-[80px]">
                  {team.name}
                </p>
                <p className={`text-gray-400 text-xs tabular-nums transition-all duration-300 ${
                  isFetching ? 'blur-[1px] opacity-70' : 'blur-0 opacity-100'
                }`}>{score.points} pts</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LiveScoreboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-domination-500" />
        </div>
      }
    >
      <LiveScoreboardContent />
    </Suspense>
  );
}
