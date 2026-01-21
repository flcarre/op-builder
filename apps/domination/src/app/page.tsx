'use client';

import Link from 'next/link';
import { Flag, Gear, Trophy, CaretRight } from '@phosphor-icons/react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 safe-area-inset">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-domination-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Flag size={32} weight="fill" className="text-domination-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Mode Domination
          </h1>
          <p className="text-gray-400 text-sm">
            Capturez et contrôlez les points stratégiques
          </p>
        </div>

        {/* Main actions */}
        <div className="space-y-3 mb-8">
          <Link
            href="/live"
            className="flex items-center justify-between glass p-5 rounded-xl active:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Trophy size={24} className="text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Scoreboard
                </h2>
                <p className="text-sm text-gray-400">
                  Voir les scores en direct
                </p>
              </div>
            </div>
            <CaretRight size={20} className="text-gray-500" />
          </Link>

          <Link
            href="/admin"
            className="flex items-center justify-between glass p-5 rounded-xl active:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-domination-500/20 rounded-xl flex items-center justify-center">
                <Gear size={24} className="text-domination-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Administration
                </h2>
                <p className="text-sm text-gray-400">
                  Gérer les sessions
                </p>
              </div>
            </div>
            <CaretRight size={20} className="text-gray-500" />
          </Link>
        </div>

        {/* How it works */}
        <div className="glass p-5 rounded-xl">
          <h3 className="text-base font-semibold text-white mb-4">
            Comment ça marche ?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-domination-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                1
              </div>
              <p className="text-gray-400 text-sm pt-0.5">
                L&apos;admin crée une session avec des équipes et des points
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-domination-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                2
              </div>
              <p className="text-gray-400 text-sm pt-0.5">
                Les joueurs scannent les QR codes sur le terrain
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-domination-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                3
              </div>
              <p className="text-gray-400 text-sm pt-0.5">
                Chaque point contrôlé rapporte des points au fil du temps
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-domination-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                4
              </div>
              <p className="text-gray-400 text-sm pt-0.5">
                L&apos;équipe avec le plus de points gagne
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
