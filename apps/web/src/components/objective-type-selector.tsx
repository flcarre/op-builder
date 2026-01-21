'use client';

import { Badge } from '@crafted/ui';
import { LucideIcon } from 'lucide-react';

interface ObjectiveType {
  value: string;
  label: string;
  icon: LucideIcon;
  category: string;
  description: string;
}

interface ObjectiveTypeSelectorProps {
  types: ObjectiveType[];
  onSelect: (type: string) => void;
}

export function ObjectiveTypeSelector({ types, onSelect }: ObjectiveTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Choisir un Type d'Objectif
        </h3>
        <p className="text-gray-400 text-sm">
          Sélectionnez le type d'objectif que vous souhaitez créer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((type) => {
          const Icon = type.icon;

          return (
            <button
              key={type.value}
              onClick={() => onSelect(type.value)}
              className="glass rounded-xl p-6 hover:shadow-glow-md transition-all group relative overflow-hidden text-left cursor-pointer border-2 border-transparent hover:border-cyber-500/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center shadow-glow-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs font-mono uppercase border border-cyber-500/50 text-cyber-300 bg-cyber-900/20 px-2 py-1"
                  >
                    {type.category}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-cyber-300 transition-colors">
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
