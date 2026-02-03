'use client';

import { use, useState, useEffect } from 'react';
import { api } from '@/trpc/client';
import {
  Lock,
  LockOpen,
  WarningCircle,
  ArrowLeft,
  Key,
  ShieldCheck,
  Eye,
  EyeSlash,
  CaretRight,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PageProps {
  params: Promise<{ token: string }>;
}

const STORAGE_KEY = (pointId: string) => `access-validated-${pointId}`;

function getValidatedLevels(pointId: string): number[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY(pointId));
  return stored ? JSON.parse(stored) : [];
}

function addValidatedLevel(pointId: string, level: number) {
  const levels = getValidatedLevels(pointId);
  if (!levels.includes(level)) {
    levels.push(level);
    localStorage.setItem(STORAGE_KEY(pointId), JSON.stringify(levels));
  }
}

export default function AccessPage({ params }: PageProps) {
  const { token } = use(params);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedLevels, setValidatedLevels] = useState<number[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
  } = api.access.getAccessLevelByToken.useQuery(
    { qrToken: token },
    { retry: false }
  );

  const validatePassword = api.access.validateAccessPassword.useMutation({
    onSuccess: (isValid) => {
      if (isValid) {
        handleLevelValidated();
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

  useEffect(() => {
    if (!mounted || !data) return;

    const pointId = data.level.accessPointId;
    const stored = getValidatedLevels(pointId);
    setValidatedLevels(stored);

    const targetLevel = data.level.level;
    const allLevels = data.level.accessPoint.levels;
    const levelsToValidate = allLevels.filter(
      (l) => l.level <= targetLevel && !stored.includes(l.level)
    );

    if (levelsToValidate.length === 0) {
      setIsUnlocked(true);
    } else {
      const firstUnvalidatedIndex = allLevels.findIndex(
        (l) => l.level === levelsToValidate[0].level
      );
      setCurrentLevelIndex(firstUnvalidatedIndex);
    }
  }, [data, mounted]);

  const handleLevelValidated = () => {
    if (!data) return;

    const currentLevel = data.level.accessPoint.levels[currentLevelIndex];
    const pointId = data.level.accessPointId;

    addValidatedLevel(pointId, currentLevel.level);
    setValidatedLevels((prev) => [...prev, currentLevel.level]);
    setPassword('');
    setError(null);

    const targetLevel = data.level.level;
    const allLevels = data.level.accessPoint.levels;
    const nextUnvalidated = allLevels.findIndex(
      (l, idx) =>
        idx > currentLevelIndex &&
        l.level <= targetLevel &&
        !validatedLevels.includes(l.level) &&
        l.level !== currentLevel.level
    );

    if (nextUnvalidated !== -1) {
      setCurrentLevelIndex(nextUnvalidated);
    } else {
      setIsUnlocked(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !password.trim()) return;

    const currentLevel = data.level.accessPoint.levels[currentLevelIndex];
    validatePassword.mutate({
      levelId: currentLevel.id,
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

  if (data.session.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center safe-area-inset p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm w-full border border-alert-yellow/30">
          <div className="w-16 h-16 rounded-xl bg-alert-yellow/20 mx-auto mb-4 flex items-center justify-center">
            <Lock size={40} className="text-alert-yellow" />
          </div>
          <h1 className="text-xl font-bold text-theme-primary mb-2 uppercase tracking-wide">
            {data.level.accessPoint.name}
          </h1>
          <p className="text-theme-muted text-sm mb-6">
            {data.session.status === 'DRAFT'
              ? "L'opération n'a pas encore commencé."
              : data.session.status === 'PAUSED'
                ? "L'opération est suspendue."
                : "L'opération est terminée."}
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
            <LockOpen size={48} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary mb-1 uppercase tracking-wide">
            Accès déverrouillé
          </h1>
          <p className="text-lg text-theme-secondary mb-2">
            {data.level.accessPoint.name}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 bg-alert-green/20 border border-alert-green/40">
            <ShieldCheck size={18} className="text-alert-green" />
            <span className="text-theme-primary font-semibold">
              Niveau {data.level.level} - {data.level.name}
            </span>
          </div>
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

  const currentLevel = data.level.accessPoint.levels[currentLevelIndex];
  const targetLevel = data.level.level;
  const allLevels = data.level.accessPoint.levels.filter(
    (l) => l.level <= targetLevel
  );

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
      <div className="flex-1 px-4 py-6 overflow-auto">
        {/* Access Point info */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center bg-accent/20">
            <Key size={32} weight="bold" className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary mb-1 uppercase tracking-wide">
            {data.level.accessPoint.name}
          </h1>
          {data.level.accessPoint.description && (
            <p className="text-theme-muted text-sm">
              {data.level.accessPoint.description}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="glass rounded-xl p-4 mb-6">
          <p className="text-xs text-theme-muted mb-3 uppercase tracking-widest text-center">
            Progression
          </p>
          <div className="flex items-center justify-center gap-2">
            {allLevels.map((level, idx) => {
              const isValidated = validatedLevels.includes(level.level);
              const isCurrent =
                data.level.accessPoint.levels[currentLevelIndex]?.id ===
                level.id;

              return (
                <div key={level.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all ${
                      isValidated
                        ? 'bg-alert-green text-white'
                        : isCurrent
                          ? 'bg-accent text-white ring-2 ring-accent ring-offset-2 ring-offset-theme-primary'
                          : 'bg-theme-tertiary text-theme-muted'
                    }`}
                  >
                    {isValidated ? (
                      <ShieldCheck size={16} weight="fill" />
                    ) : (
                      level.level
                    )}
                  </div>
                  {idx < allLevels.length - 1 && (
                    <CaretRight size={14} className="text-theme-muted" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current level form */}
        <div className="glass rounded-xl p-6 border-l-4 border-accent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Lock size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-theme-muted uppercase tracking-widest">
                Niveau {currentLevel.level}
              </p>
              <h2 className="text-lg font-bold text-theme-primary">
                {currentLevel.name}
              </h2>
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
                  Déverrouiller
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
