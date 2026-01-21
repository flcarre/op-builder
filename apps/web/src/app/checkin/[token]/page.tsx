'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/client';
import { useParams } from 'next/navigation';
import { LoadingScreen } from '@/components';
import { Button, Badge } from '@crafted/ui';
import { CheckCircleIcon, MapPinIcon, UserIcon, ShieldIcon } from 'lucide-react';

export default function CheckInPage() {
  const params = useParams();
  const token = params.token as string;

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [checkedIn, setCheckedIn] = useState(false);

  const { data: member, isLoading, error } = api.checkin.getMemberByToken.useQuery({ token });

  const checkInMutation = api.checkin.create.useMutation({
    onSuccess: () => {
      setCheckedIn(true);
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

  const handleCheckIn = () => {
    checkInMutation.mutate({
      token,
      latitude: location?.latitude,
      longitude: location?.longitude,
      deviceInfo,
    });
  };

  if (isLoading) return <LoadingScreen />;

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/40 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ShieldIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Invalid QR Code</h2>
          <p className="text-muted-foreground">
            This QR code is not valid or has expired. Please contact your team administrator.
          </p>
        </div>
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4">
        <div className="text-center max-w-md">
          <div className="bg-green-100 dark:bg-green-900/40 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Check-in Successful!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Welcome, <strong>{member.name}</strong>
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: member.team.color }}
              >
                {member.team.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.callsign}</p>
              </div>
            </div>
            <Badge
              className="text-sm"
              style={{ backgroundColor: member.team.color }}
            >
              {member.team.name}
            </Badge>
          </div>
          {location && (
            <p className="text-xs text-muted-foreground mb-4">
              Location recorded: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            You're all set! This window can be closed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <UserIcon className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold mb-2">Member Check-in</h1>
            <p className="text-muted-foreground">Confirm your attendance</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                style={{ backgroundColor: member.team.color }}
              >
                {member.team.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.callsign}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Badge
                className="text-sm"
                style={{ backgroundColor: member.team.color }}
              >
                {member.team.name}
              </Badge>
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
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {checkInMutation.isPending ? 'Checking in...' : 'Confirm Check-in'}
          </Button>

          {checkInMutation.isError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
              {checkInMutation.error.message || 'Check-in failed. Please try again.'}
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your check-in will be recorded with timestamp and location (if available)
        </p>
      </div>
    </div>
  );
}
