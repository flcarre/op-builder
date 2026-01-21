'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { DashboardNav, LoadingScreen } from '@/components';
import { Button, Input, Textarea, Label } from '@crafted/ui';
import { AlertCircleIcon, TargetIcon } from 'lucide-react';

export default function NewOperationPage() {
  const router = useRouter();

  const { data: user, isLoading: isLoadingUser } = api.auth.me.useQuery();
  const { data: userTeams, isLoading: isLoadingTeams } = api.team.getUserTeams.useQuery();

  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    endDate: '',
    latitude: '',
    longitude: '',
    coverImageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createOperation = api.operation.create.useMutation({
    onSuccess: (operation) => {
      router.push(`/operations/${operation.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!userTeams?.[0]?.id) {
      setErrors({ submit: 'No team found for your account' });
      return;
    }

    const payload: any = {
      teamId: userTeams[0].id,
      name: formData.name,
      date: new Date(formData.date),
      endDate: new Date(formData.endDate),
    };

    if (formData.description) payload.description = formData.description;
    if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
    if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
    if (formData.coverImageUrl) payload.coverImageUrl = formData.coverImageUrl;

    createOperation.mutate(payload);
  };

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push('/login');
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser || isLoadingTeams) return <LoadingScreen />;

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 201, 160, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 201, 160, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <DashboardNav
        userName={user?.name || undefined}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-6 text-cyber-400 hover:text-cyber-300 hover:bg-white/5"
          >
            ← Back to Command Center
          </Button>

          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
            Deploy New Operation
          </h1>
          <p className="text-gray-400 text-sm">
            Configure Tactical Operation Parameters
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass-strong p-8 rounded-2xl shadow-2xl">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-300">
              Operation Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Operation Nightfall"
              required
              maxLength={200}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Choose a memorable codename for this operation
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Mission Brief
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tactical objective: Secure the northern compound..."
              rows={4}
              maxLength={2000}
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-medium text-gray-300">
                Start Date & Time *
              </Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
              <p className="text-xs text-gray-500">
                When the operation begins
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-300">
                End Date & Time *
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
              />
              <p className="text-xs text-gray-500">
                When the operation ends
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">GPS Coordinates (Optional)</h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="latitude" className="text-sm font-medium text-gray-300">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="48.856614"
                  min="-90"
                  max="90"
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="longitude" className="text-sm font-medium text-gray-300">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="2.352222"
                  min="-180"
                  max="180"
                  className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Add GPS coordinates for the operation location
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="coverImageUrl" className="text-sm font-medium text-gray-300">
              Cover Image URL (Optional)
            </Label>
            <Input
              id="coverImageUrl"
              type="url"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20"
            />
            <p className="text-xs text-gray-500">
              Add a cover image to make your operation more visual
            </p>
          </div>

          {errors.submit && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={createOperation.isPending}
              className="flex-1 h-12 bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl shadow-glow-md hover:shadow-glow-lg transition-all"
            >
              {createOperation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Deploying...
                </>
              ) : (
                <>
                  <TargetIcon className="mr-2 h-5 w-5" />
                  Deploy Operation
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="glow-border text-cyber-400 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
