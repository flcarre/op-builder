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
  Crosshair,
} from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/ThemeToggle';

type DominationSessionItem = NonNullable<RouterOutputs['domination']['getAllSessions']>[number];
type DominationState = NonNullable<RouterOutputs['domination']['getState']>;
type DominationStateTeam = DominationState['teams'][number];
type DominationStatePoint = DominationState['points'][number];
type DominationStateScore = DominationState['scores'][number];

const REFRESH_INTERVAL_MS = 5000;

function RefreshIndicator({ isFetching }: { isFetching: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-theme-muted text-xs font-mono">
      <ArrowsClockwise
        size={12}
        className={isFetching ? 'animate-spin text-alert-red' : ''}
      />
      <span className="uppercase tracking-wider">{isFetching ? 'Sync...' : '5s'}</span>
    </div>
  );
}

function AnimatedScore({ value, isFetching }: { value: number; isFetching: boolean }) {
  return (
    <span
      className={`text-3xl font-bold text-theme-primary tabular-nums font-mono transition-all duration-300 ${
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
    <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isFetching ? 'opacity-60' : 'opacity-100'
        }`}
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}60`,
        }}
      />
    </div>
  );
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endsAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('00:00');
        return;
      }

      setIsUrgent(diff < 60000);

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
    <span
      className={`font-mono text-2xl font-bold tracking-wider ${
        isExpired
          ? 'text-alert-red'
          : isUrgent
            ? 'text-alert-red animate-pulse'
            : 'text-theme-primary text-glow-red'
      }`}
    >
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
      <div className="min-h-screen bg-theme-primary safe-area-inset">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-theme-tertiary text-theme-primary active:opacity-80 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-theme-primary tracking-tight">SCOREBOARD</h1>
                <p className="text-xs text-theme-muted uppercase tracking-widest">Live Feed</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <p className="text-theme-muted text-sm mb-4 uppercase tracking-wider">
            Sélectionnez une opération :
          </p>

          <div className="space-y-3">
            {sessions
              ?.filter((s: DominationSessionItem) => s.status === 'ACTIVE' || s.status === 'PAUSED')
              .map((session: DominationSessionItem) => (
                <Link
                  key={session.id}
                  href={`/live?session=${session.id}`}
                  className="flex items-center justify-between glass rounded-xl p-4 active:opacity-80 transition-all border-l-4"
                  style={{ borderLeftColor: 'var(--accent-primary)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        session.status === 'ACTIVE'
                          ? 'status-active'
                          : 'status-paused'
                      }`}
                    />
                    <div>
                      <h3 className="text-base font-semibold text-theme-primary">
                        {session.name}
                      </h3>
                      <p className="text-xs text-theme-muted uppercase tracking-wider">
                        {session.status === 'ACTIVE' ? 'En cours' : 'En pause'}
                      </p>
                    </div>
                  </div>
                  <CaretRight size={20} style={{ color: 'var(--accent-primary)' }} />
                </Link>
              ))}

            {sessions?.filter(
              (s: DominationSessionItem) => s.status === 'ACTIVE' || s.status === 'PAUSED'
            ).length === 0 && (
              <div className="glass rounded-xl p-8 text-center border-theme-accent">
                <Crosshair size={48} className="text-theme-muted mx-auto mb-3" />
                <p className="text-theme-muted uppercase tracking-wider text-sm">Aucune opération active</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-alert-red mx-auto mb-3" />
          <p className="text-theme-muted text-sm uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  const sortedScores = [...state.scores].sort((a: DominationStateScore, b: DominationStateScore) => b.points - a.points);
  const maxScore = Math.max(...sortedScores.map((s: DominationStateScore) => s.points), 1);

  return (
    <div className="min-h-screen bg-theme-primary safe-area-inset flex flex-col">
      {/* Header TerraGroup Labs style */}
      <header className="sticky top-0 z-10 bg-theme-secondary/95 backdrop-blur-lg border-b border-theme-accent">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/live"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-tertiary text-theme-primary active:opacity-80 flex-shrink-0 transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      state.session.status === 'ACTIVE'
                        ? 'status-active'
                        : state.session.status === 'PAUSED'
                          ? 'status-paused'
                          : 'status-ended'
                    }`}
                  />
                  <h1 className="text-base font-bold text-theme-primary truncate uppercase tracking-wide">
                    {state.session.name}
                  </h1>
                </div>
                <p className="text-xs text-theme-muted uppercase tracking-widest">
                  {state.session.status === 'ACTIVE'
                    ? 'Opération en cours'
                    : state.session.status === 'PAUSED'
                      ? 'Opération suspendue'
                      : 'Opération terminée'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {state.session.status === 'ACTIVE' && <RefreshIndicator isFetching={isFetching} />}
              <ThemeToggle />
              <button
                onClick={() => refetch()}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-tertiary text-theme-primary active:opacity-80 transition-colors"
              >
                <ArrowsClockwise size={18} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Timer Banner - Alert Red style */}
        {state.session.endsAt && state.session.status === 'ACTIVE' && (
          <div className="px-4 pb-3">
            <div className="bg-alert-red/10 border border-alert-red/30 rounded-lg px-4 py-2 flex items-center justify-center gap-3">
              <Timer size={20} className="text-alert-red" />
              <CountdownTimer endsAt={new Date(state.session.endsAt)} />
            </div>
          </div>
        )}
      </header>

      {/* Tabs - TerraGroup style */}
      <div className="px-4 pt-4">
        <div className="flex bg-theme-tertiary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'scores'
                ? 'bg-alert-red text-white glow-red'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <Trophy size={16} className="inline mr-1.5 -mt-0.5" />
            Classement
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'points'
                ? 'bg-alert-red text-white glow-red'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            <MapPin size={16} className="inline mr-1.5 -mt-0.5" />
            Objectifs
          </button>
        </div>
      </div>

      {/* Content */}
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
                  className="glass rounded-xl p-4 transition-all hover:opacity-90"
                  style={{
                    borderLeft: `4px solid ${team.color}`,
                    boxShadow: index === 0 ? `0 0 20px ${team.color}20` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono ${
                          index === 0
                            ? 'bg-alert-yellow text-black'
                            : index === 1
                              ? 'bg-gray-400 text-black'
                              : index === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-theme-tertiary text-theme-muted'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-theme-primary font-semibold block">
                          {team.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-theme-muted">
                          <Flag size={10} weight="fill" style={{ color: team.color }} />
                          <span className="uppercase tracking-wider">{controlledCount} objectif{controlledCount !== 1 ? 's' : ''}</span>
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
              <div className="glass rounded-xl p-8 text-center border-theme-accent">
                <Trophy size={48} className="text-theme-muted mx-auto mb-3" />
                <p className="text-theme-muted uppercase tracking-wider">Aucun point enregistré</p>
                <p className="text-theme-muted text-sm mt-1">
                  Les équipes doivent capturer des objectifs
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {state.points.map((point: DominationStatePoint) => (
              <div
                key={point.id}
                className="glass rounded-xl p-4 transition-all hover:opacity-90"
                style={{
                  borderLeft: `4px solid ${point.controlledBy?.color || '#4b5563'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: point.controlledBy?.color
                          ? `${point.controlledBy.color}20`
                          : 'rgba(75, 85, 99, 0.2)',
                        boxShadow: point.controlledBy
                          ? `0 0 15px ${point.controlledBy.color}30`
                          : undefined,
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
                      <span className="text-theme-primary font-medium block">
                        {point.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {point.controlledBy ? (
                          <>
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: point.controlledBy.color,
                                boxShadow: `0 0 6px ${point.controlledBy.color}`,
                              }}
                            />
                            <span className="text-sm text-theme-muted">
                              {point.controlledBy.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-theme-muted uppercase tracking-wider">Non capturé</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {point.controlledBy && (
                    <div
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${point.controlledBy.color}20`,
                        color: point.controlledBy.color,
                        border: `1px solid ${point.controlledBy.color}40`,
                      }}
                    >
                      Contrôlé
                    </div>
                  )}
                </div>
              </div>
            ))}

            {state.points.length === 0 && (
              <div className="glass rounded-xl p-8 text-center border-theme-accent">
                <MapPin size={48} className="text-theme-muted mx-auto mb-3" />
                <p className="text-theme-muted uppercase tracking-wider">Aucun objectif configuré</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar - TerraGroup style */}
      <div className="sticky bottom-0 bg-theme-secondary/95 backdrop-blur-lg border-t border-theme-accent px-4 py-3">
        <div className="flex justify-around">
          {sortedScores.slice(0, 3).map((score: DominationStateScore, index: number) => {
            const team = state.teams.find((t: DominationStateTeam) => t.id === score.teamId);
            if (!team) return null;

            return (
              <div key={score.teamId} className="text-center">
                <div
                  className="w-9 h-9 rounded-lg mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm font-mono"
                  style={{
                    backgroundColor: team.color,
                    boxShadow: index === 0 ? `0 0 12px ${team.color}60` : undefined,
                  }}
                >
                  {index + 1}
                </div>
                <p className="text-theme-primary text-sm font-medium truncate max-w-[80px]">
                  {team.name}
                </p>
                <p className={`text-theme-muted text-xs tabular-nums font-mono transition-all duration-300 ${
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
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-alert-red mx-auto mb-3" />
            <p className="text-theme-muted text-xs uppercase tracking-widest">Initialisation...</p>
          </div>
        </div>
      }
    >
      <LiveScoreboardContent />
    </Suspense>
  );
}
