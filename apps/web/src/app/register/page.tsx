'use client';

import { useState } from 'react';
import { api } from '@/trpc/client';
import Link from 'next/link';
import { Button } from '@crafted/ui';
import { ShieldCheckIcon, MailIcon, LockIcon, UserIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async (data) => {
      console.log('[Register] Registration successful, setting session on client...');

      // Import Supabase client
      const { supabase } = await import('@crafted/auth');

      // Set the session on the client side
      if (data.session) {
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (error) {
          console.error('[Register] Failed to set session:', error);
          setError('Failed to establish session');
          return;
        }

        console.log('[Register] Session set successfully, redirecting...');
      }

      // Redirect to home
      window.location.href = '/';
    },
    onError: (error) => setError(error.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ name, teamName, email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 201, 160, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 201, 160, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyber-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyber-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-400 to-cyber-600 mb-6 shadow-glow-md relative">
            <SparklesIcon className="h-10 w-10 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyber-300/20 to-transparent" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">
            Join the command center and start building operations
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-strong rounded-2xl shadow-2xl p-8 relative">
          {/* Glow effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-cyber-500/20 to-cyber-600/20 rounded-2xl blur-sm -z-10" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <AlertCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Team Name Field */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium mb-2 text-gray-300">
                Team Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                </div>
                <input
                  id="teamName"
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 transition-all"
                  placeholder="Alpha Team"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Your team name for operations
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 transition-all"
                  placeholder="operator@command.io"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-500 group-focus-within:text-cyber-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyber-400/50 focus:ring-2 focus:ring-cyber-400/20 transition-all"
                  placeholder="••••••••••"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Minimum 8 characters required
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 bg-gradient-to-r from-cyber-500 to-cyber-600 hover:from-cyber-400 hover:to-cyber-500 text-white rounded-xl font-semibold shadow-glow-md hover:shadow-glow-lg transition-all duration-200 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {registerMutation.isPending ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Create Account
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-400/20 to-cyber-500/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Already have an account?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-cyber-400 hover:text-cyber-300 font-medium transition-colors group"
          >
            <ShieldCheckIcon className="h-4 w-4 group-hover:animate-pulse" />
            Sign In
            <span className="text-cyber-500">→</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>Secured by Op-Builder Platform</p>
        </div>
      </div>
    </div>
  );
}
