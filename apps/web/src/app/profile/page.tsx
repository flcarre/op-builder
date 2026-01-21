'use client';

import { api } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Button,
  Input,
  Label,
} from '@crafted/ui';
import { UserIcon, MailIcon, ChevronLeftIcon, ShieldCheckIcon } from 'lucide-react';
import { DashboardNav, LoadingScreen } from '@/components';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = api.auth.me.useQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-black via-tactical-950 to-olive-950"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
      }}
    >
      <DashboardNav
        userName={user?.name || undefined}
        userEmail={user?.email}
        onLogout={() => {}}
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6 text-olive-300 hover:text-olive-100 hover:bg-tactical-900/60 font-mono"
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Back to Command Center
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white font-mono uppercase mb-2">
            [ Operator Profile ]
          </h1>
          <p className="text-olive-300/80 font-mono text-sm">
            MANAGE PERSONAL INFORMATION
          </p>
        </div>

        <div className="bg-tactical-950/95 backdrop-blur-sm rounded-lg shadow-elevated p-8 border-2 border-olive-700/50 mb-6">
          <h2 className="text-xl font-bold text-white font-mono uppercase mb-6">Personal Information</h2>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-olive-300">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-olive-500" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-tactical-900/60 border-2 border-tactical-700 text-tactical-400 font-mono cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-olive-400/60 font-mono">
                Email address cannot be modified
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-olive-300">
                Operator Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-olive-500" />
                </div>
                {isEditing ? (
                  <Input
                    id="name"
                    type="text"
                    value={name || user.name || ''}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-tactical-900 border-2 border-olive-700 text-white placeholder-olive-500 focus:border-olive-500 font-mono"
                  />
                ) : (
                  <Input
                    id="name"
                    type="text"
                    value={user.name || 'Not set'}
                    disabled
                    className="pl-10 bg-tactical-900/60 border-2 border-tactical-700 text-white font-mono cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="flex-1 bg-olive-700 hover:bg-olive-600 border-2 border-olive-600 font-mono uppercase">
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setName('');
                    }}
                    variant="outline"
                    className="bg-tactical-900 border-2 border-tactical-600 text-olive-300 hover:bg-tactical-700 hover:border-olive-600 font-mono uppercase"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-olive-700 hover:bg-olive-600 border-2 border-olive-600 font-mono uppercase">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-tactical-950/95 backdrop-blur-sm rounded-lg shadow-elevated p-8 border-2 border-olive-700/50">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="h-6 w-6 text-olive-400" />
            <h2 className="text-xl font-bold text-white font-mono uppercase">Account Information</h2>
          </div>

          <dl className="space-y-4">
            <div className="flex justify-between items-start py-3 border-b border-tactical-700/50">
              <dt className="text-sm font-mono uppercase tracking-wider text-olive-300">User ID</dt>
              <dd className="text-sm text-white font-mono">{user.id.slice(0, 8)}...</dd>
            </div>
            <div className="flex justify-between items-start py-3">
              <dt className="text-sm font-mono uppercase tracking-wider text-olive-300">
                Member Since
              </dt>
              <dd className="text-sm text-white font-mono">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
