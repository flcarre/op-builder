'use client';

import Link from 'next/link';
import { Flag, Gear, Trophy, CaretRight } from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-theme-primary safe-area-inset">
      <div className="px-4 py-8">
        {/* Header with theme toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Flag size={32} weight="fill" className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-theme-primary mb-2 uppercase tracking-wide">
            Mode Domination
          </h1>
          <p className="text-theme-muted text-sm">
            Capturez et contrôlez les points stratégiques
          </p>
        </div>

        {/* Main actions */}
        <div className="space-y-3 mb-8">
          <Link
            href="/live"
            className="flex items-center justify-between glass p-5 rounded-xl active:opacity-80 transition-all border-theme-accent"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-alert-yellow/20 rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-alert-yellow" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-primary">
                  Scoreboard
                </h2>
                <p className="text-sm text-theme-muted">
                  Voir les scores en direct
                </p>
              </div>
            </div>
            <CaretRight size={20} className="text-theme-muted" />
          </Link>

          <Link
            href="/admin"
            className="flex items-center justify-between glass p-5 rounded-xl active:opacity-80 transition-all border-theme-accent"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-10 rounded-xl flex items-center justify-center">
                <Gear size={24} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-primary">
                  Administration
                </h2>
                <p className="text-sm text-theme-muted">
                  Gérer les sessions
                </p>
              </div>
            </div>
            <CaretRight size={20} className="text-theme-muted" />
          </Link>
        </div>

        {/* How it works */}
        <div className="glass p-5 rounded-xl border-theme-accent">
          <h3 className="text-base font-semibold text-theme-primary mb-4 uppercase tracking-wide">
            Comment ça marche ?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </div>
              <p className="text-theme-muted text-sm pt-0.5">
                L&apos;admin crée une session avec des équipes et des points
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </div>
              <p className="text-theme-muted text-sm pt-0.5">
                Les joueurs scannent les QR codes sur le terrain
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </div>
              <p className="text-theme-muted text-sm pt-0.5">
                Chaque point contrôlé rapporte des points au fil du temps
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                4
              </div>
              <p className="text-theme-muted text-sm pt-0.5">
                L&apos;équipe avec le plus de points gagne
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
