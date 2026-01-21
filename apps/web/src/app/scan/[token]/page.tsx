'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/client';
import { useParams } from 'next/navigation';
import { LoadingScreen } from '@/components';
import { Button, Badge } from '@crafted/ui';
import { CheckCircleIcon, MapPinIcon, TargetIcon, ShieldIcon, AlertCircleIcon } from 'lucide-react';

export default function ScanObjectivePage() {
  const params = useParams();
  const token = params.token as string;

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [completed, setCompleted] = useState(false);

  const { data: objective, isLoading, error } = api.completion.getObjectiveByToken.useQuery({ token });
  const { data: userTeams } = api.team.getUserTeams.useQuery();

  const completeMutation = api.completion.complete.useMutation({
    onSuccess: () => {
      setCompleted(true);
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceInfo(navigator.userAgent);
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    }
  }, []);

  if (isLoading || !userTeams) return <LoadingScreen />;

  if (!selectedTeamId && userTeams.length > 0) {
    setSelectedTeamId(userTeams[0].id);
    return <LoadingScreen />;
  }

  if (error || !objective) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/40 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ShieldIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Invalid QR Code</h2>
          <p className="text-muted-foreground">
            This objective QR code is not valid or the operation is not active.
          </p>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    completeMutation.mutate({
      token,
      teamId: selectedTeamId,
      latitude: location?.latitude,
      longitude: location?.longitude,
      deviceInfo,
    });
  };

  if (completed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tactical-950 via-green-950 to-tactical-900 p-4"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      >
        <div className="text-center max-w-md">
          <div className="relative">
            <div className="bg-green-900/60 backdrop-blur rounded-lg w-24 h-24 flex items-center justify-center mx-auto mb-6 border-4 border-green-500 shadow-elevated animate-pulse">
              <CheckCircleIcon className="h-16 w-16 text-green-400" />
            </div>
            <div className="absolute -top-2 -left-2 w-28 h-28 border-2 border-green-500/30 rounded-lg" />
          </div>

          <h2 className="text-4xl font-bold mb-2 text-white font-mono uppercase tracking-wider">
            [ Mission Success ]
          </h2>
          <p className="text-green-400 font-mono text-sm mb-6">OBJECTIVE SECURED</p>

          <div className="bg-tactical-950/95 backdrop-blur-sm rounded-lg p-6 shadow-elevated border-2 border-green-700/50 mb-6">
            <h3 className="text-2xl font-bold mb-2 text-white">{objective.title}</h3>
            <p className="text-xs text-olive-300/80 font-mono uppercase tracking-wider mb-4">
              TYPE: {objective.type}
            </p>
            <div className="flex items-center justify-center gap-3 mb-4 py-4 border-y border-green-700/50">
              <div className="text-5xl font-bold font-mono text-green-400">
                +{objective.points}
              </div>
              <span className="text-olive-300 font-mono uppercase">pts</span>
            </div>
            {objective.camp && (
              <Badge
                className="text-sm font-mono uppercase border-2"
                style={{
                  backgroundColor: objective.camp.color,
                  borderColor: objective.camp.color,
                }}
              >
                {objective.camp.name}
              </Badge>
            )}
          </div>

          {location && (
            <p className="text-xs text-olive-300/60 font-mono mb-4">
              COORDINATES: {location.latitude.toFixed(6)}°N, {location.longitude.toFixed(6)}°E
            </p>
          )}
          <p className="text-sm text-green-400 font-mono uppercase tracking-wide">
            Continue mission. Complete more objectives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-tactical-950 to-olive-950 p-4"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
      }}
    >
      <div className="max-w-md w-full">
        <div className="bg-tactical-950/95 backdrop-blur-sm rounded-lg shadow-elevated p-8 border-2 border-olive-700/50">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <TargetIcon className="h-16 w-16 mx-auto mb-4 text-amber-400" />
              <div className="absolute inset-0 animate-ping">
                <TargetIcon className="h-16 w-16 text-amber-400 opacity-30" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white font-mono uppercase tracking-wider">
              [ Objective Scan ]
            </h1>
            <p className="text-olive-300/80 font-mono text-sm">CONFIRM MISSION COMPLETION</p>
          </div>

          {userTeams.length > 1 && (
            <div className="mb-6">
              <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-olive-300">
                Select Squad
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-3 border-2 border-olive-700 rounded-lg bg-tactical-800 text-white font-mono shadow-tactical"
              >
                {userTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-tactical-800/80 backdrop-blur-sm rounded-lg p-6 mb-6 border-2 border-olive-700/50 shadow-tactical">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-bold flex-1 text-white">{objective.title}</h2>
                {objective.camp && (
                  <Badge
                    className="text-xs font-mono uppercase border-2"
                    style={{
                      backgroundColor: objective.camp.color,
                      borderColor: objective.camp.color,
                    }}
                  >
                    {objective.camp.name}
                  </Badge>
                )}
              </div>
              {objective.description && (
                <p className="text-sm text-olive-300/80 mb-3">
                  {objective.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-mono font-bold text-amber-400">
                  +{objective.points} PTS
                </span>
                <Badge variant="outline" className="text-xs font-mono bg-tactical-900/50 border-olive-600 text-olive-300">
                  {objective.type}
                </Badge>
              </div>
            </div>

            {objective.parentObjective && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircleIcon className="h-4 w-4" />
                  <span>
                    Requires: <strong>{objective.parentObjective.title}</strong>
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <div className="text-sm text-muted-foreground">
                <strong>Operation:</strong> {objective.operation.name}
              </div>
            </div>
          </div>

          {location ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-6">
              <MapPinIcon className="h-4 w-4" />
              <span>Location acquired</span>
            </div>
          ) : locationError ? (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-6">
              <MapPinIcon className="h-4 w-4" />
              <span>Location unavailable (continuing without location)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <MapPinIcon className="h-4 w-4 animate-pulse" />
              <span>Acquiring location...</span>
            </div>
          )}

          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {completeMutation.isPending ? 'Completing...' : 'Complete Objective'}
          </Button>

          {completeMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {completeMutation.error.message || 'Failed to complete objective. Please try again.'}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your completion will be recorded with timestamp and location (if available)
        </p>
      </div>
    </div>
  );
}
