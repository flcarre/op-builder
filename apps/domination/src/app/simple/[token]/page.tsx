'use client';

import { use, useState, useEffect } from 'react';
import { api } from '@/trpc/client';
import {
  Lock,
  LockOpen,
  WarningCircle,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function SimpleAccessPage({ params }: PageProps) {
  const { token } = use(params);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
  } = api.access.getSimpleAccessByToken.useQuery(
    { qrToken: token },
    { retry: false }
  );

  const validatePassword = api.access.validateSimpleAccessPassword.useMutation({
    onSuccess: (isValid) => {
      if (isValid) {
        setIsUnlocked(true);
      } else {
        setError('Mot de passe incorrect');
      }
    },
    onError: () => {
      setError('Erreur de validation');
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    validatePassword.mutate({
      qrToken: token,
      password: password.trim(),
    });
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 spinner-accent mx-auto mb-4" />
          <p className="text-theme-muted text-sm uppercase tracking-widest">
            Identification...
          </p>
        </div>
      </div>
    );
  }

  if (queryError || !data) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm w-full border border-alert-red/30">
          <div className="w-16 h-16 rounded-xl bg-alert-red/20 mx-auto mb-4 flex items-center justify-center">
            <WarningCircle size={40} className="text-alert-red" />
          </div>
          <h1 className="text-xl font-bold text-theme-primary mb-2 uppercase tracking-wide">
            Accès non trouvé
          </h1>
          <p className="text-theme-muted text-sm mb-6">
            Ce QR code n&apos;est pas valide ou l&apos;accès n&apos;existe plus.
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

  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm w-full animate-capture border-2 border-alert-green">
          <div
            className="w-20 h-20 rounded-xl mx-auto mb-4 flex items-center justify-center bg-alert-green"
            style={{ boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' }}
          >
            <ShieldCheck size={48} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary mb-1 uppercase tracking-wide">
            Accès validé
          </h1>
          <p className="text-lg text-theme-secondary mb-6">
            {data.access.name}
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 btn-primary text-white px-5 py-4 rounded-xl w-full"
            >
              <ArrowLeft size={20} />
              Retour à l&apos;accueil
            </Link>
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
            href="/"
            className="inline-flex items-center gap-2 text-theme-muted active:text-theme-primary text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-auto flex flex-col justify-center">
        {/* Access info */}
        <div className="glass rounded-xl p-6 border-l-4 border-accent max-w-sm mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Lock size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-theme-primary">
                {data.access.name}
              </h1>
              {data.access.description && (
                <p className="text-theme-muted text-sm">
                  {data.access.description}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Entrez le mot de passe"
                className="w-full bg-theme-tertiary text-theme-primary px-4 py-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent font-mono uppercase tracking-wider"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary transition-colors"
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-alert-red/10 border border-alert-red/30 rounded-xl text-alert-red text-sm text-center">
                <WarningCircle size={16} className="inline mr-2 -mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password.trim() || validatePassword.isPending}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold uppercase tracking-widest"
            >
              {validatePassword.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                  Vérification...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LockOpen size={20} weight="bold" />
                  Valider
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
