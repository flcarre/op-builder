# DOMINATION - Direction Artistique
## Inspiré par TerraGroup Labs (Escape from Tarkov)

---

## 1. Concept & Ambiance

### Vision
L'application Domination adopte l'esthétique **TerraGroup Labs** : un laboratoire militaire secret, high-tech et inquiétant. L'interface évoque un terminal de contrôle d'une installation souterraine où chaque action a des conséquences tactiques.

### Mots-clés
- **Militaire & Scientifique** - Précision, données, contrôle
- **Souterrain & Confiné** - Obscurité, éclairage artificiel
- **High-tech rétro-futuriste** - Scanlines, néon, terminaux CRT
- **Tension & Urgence** - Alertes, compte à rebours, danger

### Devise
> "VIRES IN SCIENTIA" - La force par la science

---

## 2. Palette de Couleurs

### Couleurs Principales

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Labs Black** | `#0a0a0f` | 10, 10, 15 | Background principal |
| **Bunker Dark** | `#12141a` | 18, 20, 26 | Cards, surfaces |
| **Steel Gray** | `#1a1d24` | 26, 29, 36 | Éléments secondaires |
| **Terminal Gray** | `#2a2d35` | 42, 45, 53 | Borders, dividers |

### Couleurs d'Accent

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Alert Red** | `#dc2626` | 220, 38, 38 | Danger, alertes, actions critiques |
| **Neon Red** | `#ff3b3b` | 255, 59, 59 | Glow effects, hover states |
| **Hazard Orange** | `#f97316` | 249, 115, 22 | Warnings, attention |
| **Radiation Yellow** | `#eab308` | 234, 179, 8 | Scores, récompenses |

### Couleurs Secondaires

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Tactical Cyan** | `#06b6d4` | 6, 182, 212 | Info, données, liens |
| **Bio Green** | `#22c55e` | 34, 197, 94 | Succès, capture, actif |
| **Contamination Purple** | `#a855f7` | 168, 85, 247 | Spécial, rare |

### Niveaux de Gris (Texte)

| Nom | Hex | Usage |
|-----|-----|-------|
| **White** | `#ffffff` | Titres principaux |
| **Light Gray** | `#e5e7eb` | Texte corps |
| **Medium Gray** | `#9ca3af` | Texte secondaire |
| **Dark Gray** | `#6b7280` | Labels, placeholders |
| **Muted Gray** | `#4b5563` | Texte désactivé |

---

## 3. Typographie

### Police Principale
**Inter** - Sans-serif moderne et lisible

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Police Monospace (Données)
**JetBrains Mono** ou **Fira Code** - Pour les données, scores, timers

```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Hiérarchie Typographique

| Élément | Taille | Poids | Line-height |
|---------|--------|-------|-------------|
| H1 - Titre Principal | 28px | Bold (700) | 1.2 |
| H2 - Sous-titre | 22px | Semibold (600) | 1.3 |
| H3 - Section | 18px | Semibold (600) | 1.4 |
| Body | 14px | Regular (400) | 1.5 |
| Small | 12px | Regular (400) | 1.4 |
| Caption | 10px | Medium (500) | 1.3 |
| Data/Score | 32px | Bold (700) | 1 |

### Style Spécial - Terminal
Pour les éléments type "terminal militaire" :
- Lettres majuscules
- Letter-spacing: 0.05em à 0.1em
- Font-weight: 500-600

---

## 4. Composants UI

### Cards (Glass Morphism Militaire)

```css
.glass-card {
  background: rgba(18, 20, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.glass-card-accent {
  border-left: 3px solid #dc2626; /* Alert Red */
}
```

### Boutons

#### Bouton Principal (Danger/Action)
```css
.btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 0 30px rgba(255, 59, 59, 0.5);
}
```

#### Bouton Secondaire
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}
```

#### Bouton Ghost
```css
.btn-ghost {
  background: transparent;
  color: #9ca3af;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}
```

### Inputs

```css
.input {
  background: rgba(10, 10, 15, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}
```

### Status Indicators

```css
/* Actif / Online */
.status-active {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
  animation: pulse 2s infinite;
}

/* En pause */
.status-paused {
  background: #eab308;
}

/* Terminé / Offline */
.status-ended {
  background: #6b7280;
}

/* Danger */
.status-danger {
  background: #dc2626;
  animation: pulse-danger 1s infinite;
}
```

---

## 5. Effets Visuels

### Scanlines (Optionnel - Effet CRT)

```css
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  opacity: 0.3;
}
```

### Glow Effects

```css
/* Red Glow */
.glow-red {
  box-shadow:
    0 0 10px rgba(220, 38, 38, 0.3),
    0 0 20px rgba(220, 38, 38, 0.2),
    0 0 40px rgba(220, 38, 38, 0.1);
}

/* Cyan Glow */
.glow-cyan {
  box-shadow:
    0 0 10px rgba(6, 182, 212, 0.3),
    0 0 20px rgba(6, 182, 212, 0.2);
}

/* Text Glow */
.text-glow-red {
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
}
```

### Animations

```css
/* Pulse pour éléments actifs */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Pulse danger rapide */
@keyframes pulse-danger {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* Fade in */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Capture success */
@keyframes capture {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

---

## 6. Iconographie

### Style
- **Phosphor Icons** - Style "Regular" ou "Bold"
- Taille standard: 20-24px
- Couleur: Hérite du texte parent ou accent

### Icônes Clés

| Contexte | Icône Phosphor |
|----------|----------------|
| Équipe | `UsersThree` |
| Point / Flag | `Flag` |
| Score | `Trophy` |
| Timer | `Timer` |
| Capture | `Crosshair` |
| Scan QR | `QrCode` |
| Settings | `Gear` |
| Warning | `WarningCircle` |
| Success | `CheckCircle` |
| Map | `MapPin` |
| Refresh | `ArrowsClockwise` |

---

## 7. Layout & Spacing

### Système de Spacing (4px base)

| Token | Valeur | Usage |
|-------|--------|-------|
| `xs` | 4px | Gaps internes minimes |
| `sm` | 8px | Padding compact |
| `md` | 16px | Padding standard |
| `lg` | 24px | Sections |
| `xl` | 32px | Grandes séparations |
| `2xl` | 48px | Entre sections majeures |

### Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `sm` | 6px | Petits éléments (badges) |
| `md` | 8px | Boutons, inputs |
| `lg` | 12px | Cards |
| `xl` | 16px | Modals |
| `full` | 9999px | Pills, avatars |

---

## 8. Responsive Design

### Breakpoints

| Nom | Valeur | Usage |
|-----|--------|-------|
| `sm` | 640px | Téléphones grands |
| `md` | 768px | Tablettes |
| `lg` | 1024px | Desktop |

### Mobile First
L'app est conçue **mobile-first** pour une utilisation sur le terrain (scan QR).

### Safe Areas
Toujours respecter les `env(safe-area-inset-*)` pour les notchs et home indicators.

---

## 9. États & Feedback

### États d'équipe (Couleurs dynamiques)
Les équipes ont des couleurs assignées dynamiquement. Les couleurs suggérées :

| Équipe | Couleur | Hex |
|--------|---------|-----|
| Rouge | Alert Red | `#dc2626` |
| Bleu | Tactical Blue | `#2563eb` |
| Vert | Bio Green | `#22c55e` |
| Jaune | Radiation Yellow | `#eab308` |
| Violet | Contamination Purple | `#a855f7` |
| Orange | Hazard Orange | `#f97316` |
| Cyan | Tactical Cyan | `#06b6d4` |
| Rose | `#ec4899` |

### États de session

| État | Indicateur | Couleur |
|------|------------|---------|
| Draft | Point gris | `#6b7280` |
| Active | Point vert pulsant | `#22c55e` |
| Paused | Point jaune | `#eab308` |
| Completed | Point gris | `#6b7280` |

### Feedback Tactile
Sur mobile, utiliser `active:scale-[0.98]` pour le feedback au toucher.

---

## 10. Exemples de Composition

### Header de Session Active

```
┌─────────────────────────────────────┐
│ ← [●] Opération Alpha         🔄 5s │  ← Dot vert pulsant
│     En cours                        │
├─────────────────────────────────────┤
│    ⏱ 45:23                         │  ← Timer rouge néon
│    [████████████████░░░]            │  ← Barre de progression
└─────────────────────────────────────┘
```

### Card Équipe (Classement)

```
┌─────────────────────────────────────┐
│ ▌ 1  🔴 Équipe Alpha         847 pts│  ← Border-left couleur équipe
│      ⚑ 3 points                     │
│      [██████████████████░░]         │
└─────────────────────────────────────┘
```

### Card Point (Non capturé)

```
┌─────────────────────────────────────┐
│ ▌ 🏴 Point Charlie                  │  ← Border grise
│      Non capturé                    │
└─────────────────────────────────────┘
```

### Card Point (Capturé)

```
┌─────────────────────────────────────┐
│ ▌ 🚩 Point Alpha            Contrôlé│  ← Border couleur équipe
│      ● Équipe Rouge                 │  ← Dot + nom équipe
└─────────────────────────────────────┘
```

---

## 11. Accessibilité

### Contraste
- Texte principal sur fond sombre : ratio minimum 4.5:1
- Texte secondaire : ratio minimum 3:1
- Boutons d'action : ratio minimum 4.5:1

### Focus States
Tous les éléments interactifs doivent avoir un focus visible :

```css
:focus-visible {
  outline: 2px solid #dc2626;
  outline-offset: 2px;
}
```

### Reduced Motion
Respecter `prefers-reduced-motion` :

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'labs': {
          black: '#0a0a0f',
          dark: '#12141a',
          steel: '#1a1d24',
          terminal: '#2a2d35',
        },
        'alert': {
          red: '#dc2626',
          neon: '#ff3b3b',
          orange: '#f97316',
          yellow: '#eab308',
        },
        'tactical': {
          cyan: '#06b6d4',
          green: '#22c55e',
          purple: '#a855f7',
          blue: '#2563eb',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'capture': 'capture 0.5s ease-out',
      },
      keyframes: {
        capture: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
};
```

---

## 13. Références & Inspiration

### Sources Visuelles
- [TerraGroup Labs Concept Art - Eugene Shushliamin](https://www.artstation.com/artwork/v19rxY)
- [Escape from Tarkov Wiki - TerraGroup](https://escapefromtarkov.fandom.com/wiki/TerraGroup)
- [Escape from Tarkov Wiki - The Lab](https://escapefromtarkov.fandom.com/wiki/The_Lab)

### Mots-clés Design
- Scanlines, CRT, retro-futuriste
- Néon rouge sur fond noir
- Interface militaire/scientifique
- Bunker souterrain high-tech
- Tension, urgence, danger

### Ambiance Sonore (pour référence)
Le design du Labs dans le jeu a été décrit comme "hi-tech and luxurious but at the same time ambiguous and a bit scary" - cette tension doit se refléter visuellement.

---

## 14. Thème Light - "Field Operations"

Le thème light est conçu pour une utilisation en extérieur avec forte luminosité (terrain airsoft en journée). Il conserve l'identité militaire tout en optimisant la lisibilité au soleil.

### Concept Light
- **Opérations de terrain** - Lisibilité maximale en extérieur
- **Documents militaires** - Inspiré des cartes tactiques et rapports de mission
- **Contraste élevé** - Visible même en plein soleil

### Palette Light - Couleurs Principales

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Paper White** | `#fafafa` | 250, 250, 250 | Background principal |
| **Tactical Cream** | `#f5f5f4` | 245, 245, 244 | Cards, surfaces |
| **Field Gray** | `#e7e5e4` | 231, 229, 228 | Éléments secondaires |
| **Border Stone** | `#d6d3d1` | 214, 211, 209 | Borders, dividers |

### Palette Light - Couleurs d'Accent (ajustées)

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Combat Red** | `#b91c1c` | 185, 28, 28 | Danger, alertes (plus foncé pour contraste) |
| **Warning Orange** | `#c2410c` | 194, 65, 12 | Warnings, attention |
| **Mission Yellow** | `#a16207` | 161, 98, 7 | Scores, récompenses |

### Palette Light - Couleurs Secondaires (ajustées)

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Intel Cyan** | `#0891b2` | 8, 145, 178 | Info, données, liens |
| **Secure Green** | `#15803d` | 21, 128, 61 | Succès, capture, actif |
| **Classified Purple** | `#7c3aed` | 124, 58, 237 | Spécial, rare |

### Palette Light - Niveaux de Gris (Texte)

| Nom | Hex | Usage |
|-----|-----|-------|
| **Ink Black** | `#0c0a09` | Titres principaux |
| **Dark Stone** | `#1c1917` | Texte corps |
| **Medium Stone** | `#44403c` | Texte secondaire |
| **Light Stone** | `#78716c` | Labels, placeholders |
| **Muted Stone** | `#a8a29e` | Texte désactivé |

### Composants UI - Light

#### Cards Light
```css
.glass-card-light {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.glass-card-light-accent {
  border-left: 3px solid #b91c1c; /* Combat Red */
}
```

#### Bouton Principal Light
```css
.btn-primary-light {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(185, 28, 28, 0.3);
}

.btn-primary-light:hover {
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
}
```

#### Bouton Secondaire Light
```css
.btn-secondary-light {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: #1c1917;
}

.btn-secondary-light:hover {
  background: rgba(0, 0, 0, 0.08);
}
```

#### Inputs Light
```css
.input-light {
  background: white;
  border: 1px solid #d6d3d1;
  border-radius: 8px;
  color: #1c1917;
}

.input-light:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.15);
}
```

### Status Indicators Light

```css
/* Actif / Online - Light */
.status-active-light {
  background: #15803d;
  box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.2);
}

/* En pause - Light */
.status-paused-light {
  background: #a16207;
  box-shadow: 0 0 0 3px rgba(161, 98, 7, 0.2);
}

/* Terminé / Offline - Light */
.status-ended-light {
  background: #78716c;
}

/* Danger - Light */
.status-danger-light {
  background: #b91c1c;
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.2);
}
```

### Effets Visuels Light

#### Subtle Shadow (remplace les glows)
```css
.shadow-tactical {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.1);
}

.shadow-tactical-lg {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 8px 16px rgba(0, 0, 0, 0.1);
}
```

#### Border Accent (remplace les néons)
```css
.border-accent-light {
  border: 2px solid #b91c1c;
}

.ring-accent-light {
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.2);
}
```

### Tailwind Config - Light Theme Extension

```javascript
// tailwind.config.js - Extension pour le thème light
module.exports = {
  theme: {
    extend: {
      colors: {
        // Light theme
        'field': {
          white: '#fafafa',
          cream: '#f5f5f4',
          gray: '#e7e5e4',
          border: '#d6d3d1',
        },
        'combat': {
          red: '#b91c1c',
          orange: '#c2410c',
          yellow: '#a16207',
        },
        'intel': {
          cyan: '#0891b2',
          green: '#15803d',
          purple: '#7c3aed',
        },
        'stone': {
          ink: '#0c0a09',
          dark: '#1c1917',
          medium: '#44403c',
          light: '#78716c',
          muted: '#a8a29e',
        },
      },
    },
  },
};
```

### CSS Variables pour Theming

```css
:root {
  /* Dark Theme (default) */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12141a;
  --bg-tertiary: #1a1d24;
  --border-color: rgba(255, 255, 255, 0.05);

  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-muted: #9ca3af;

  --accent-primary: #dc2626;
  --accent-hover: #ff3b3b;
  --accent-success: #22c55e;
  --accent-warning: #eab308;
  --accent-info: #06b6d4;

  --shadow-glow: 0 0 20px rgba(220, 38, 38, 0.3);
}

[data-theme="light"] {
  /* Light Theme */
  --bg-primary: #fafafa;
  --bg-secondary: #f5f5f4;
  --bg-tertiary: #e7e5e4;
  --border-color: rgba(0, 0, 0, 0.08);

  --text-primary: #0c0a09;
  --text-secondary: #1c1917;
  --text-muted: #78716c;

  --accent-primary: #b91c1c;
  --accent-hover: #991b1b;
  --accent-success: #15803d;
  --accent-warning: #a16207;
  --accent-info: #0891b2;

  --shadow-glow: 0 2px 8px rgba(185, 28, 28, 0.3);
}
```

### Comparaison Dark vs Light

| Élément | Dark Theme | Light Theme |
|---------|------------|-------------|
| Background | `#0a0a0f` (Labs Black) | `#fafafa` (Paper White) |
| Cards | `#12141a` + blur | `#ffffff` + shadow |
| Text principal | `#ffffff` | `#0c0a09` |
| Accent rouge | `#dc2626` + glow | `#b91c1c` + shadow |
| Borders | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.08)` |
| Effet spécial | Glow néon | Drop shadow |
| Ambiance | Bunker souterrain | Terrain extérieur |

### Quand utiliser chaque thème

| Contexte | Thème recommandé |
|----------|------------------|
| Partie de nuit | Dark |
| Partie de jour en forêt | Light |
| Intérieur (CQB) | Dark |
| Soleil direct | Light |
| Admin / Config | Dark (ambiance immersive) |
| Sur le terrain (scan QR) | Auto (selon luminosité) |

### Détection automatique (optionnel)

```typescript
// hooks/useTheme.ts
import { useEffect, useState } from 'react';

export function useAutoTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Détection basée sur l'heure
    const hour = new Date().getHours();
    const isDaytime = hour >= 7 && hour < 19;

    // Ou détection basée sur les préférences système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    setTheme(isDaytime && !prefersDark ? 'light' : 'dark');
  }, []);

  return { theme, setTheme };
}
```

---

*Document créé pour l'application Domination - Mode de jeu airsoft*
*Inspiré par TerraGroup Labs, Escape from Tarkov*
