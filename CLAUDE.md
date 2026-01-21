# Crafted SaaS - Règles pour Claude Code

## Vision du Projet

Crafted SaaS est un boilerplate **adaptatif** qui comprend que la qualité doit correspondre au **contexte**, pas à des dogmes. Il propose 3 niveaux de qualité (Rapid, Balanced, Crafted) × 2 options de plateforme (Web Only, Web+Mobile) = 6 configurations possibles.

---

## Principes Craft Universels

### Philosophie sur les Commentaires - RÈGLE D'OR

**Les commentaires sont un CODE SMELL**

#### Test du Commentaire (TOUJOURS appliquer)

Avant d'écrire un commentaire, demandez-vous dans cet ordre :

1. ❓ Puis-je **renommer** une variable/fonction pour que ce soit clair ?
2. ❓ Puis-je **extraire** une fonction bien nommée ?
3. ❓ Puis-je **simplifier** la logique ?
4. ❓ Est-ce **vraiment** non-évident ? (business rule, gotcha)

Si **OUI aux 3 premiers** → **Refactorer, ne PAS commenter**

#### Commentaires Acceptables

| Type | Acceptable | Exemple |
|------|-----------|---------|
| **WHY** | ✅ Oui | `// Stripe requires amount in cents, not dollars` |
| **Business rules** | ✅ Oui | `// Legal requirement: GDPR mandates 30-day grace period` |
| **Workarounds temporaires** | ⚠️ Avec ticket | `// WORKAROUND: Supabase bug #456 - remove in v2.38` |
| **Performance rationale** | ✅ Oui | `// Using Map instead of object: O(n) → O(1) for 10k+ items` |
| **JSDoc APIs publiques** | ✅ Oui | Documentation externe |
| **WHAT/HOW** | ❌ NON | Refactorer le code |
| **TODO sans ticket** | ❌ NON | Créer un ticket |
| **Code commenté** | ❌ NON | Supprimer (use git) |

#### Exemples

**❌ Mauvais (commentaires inutiles)**
```typescript
// Loop through users
users.forEach(u => ...)

// Check if valid
if (x > 0 && y < 100) { }

// Return the result
return result;
```

**✅ Bon (refactoring)**
```typescript
users.forEach(user => processActiveUser(user))

if (isPriceInValidRange(price)) { }

return calculatedTotal;
```

**✅ Acceptable (WHY)**
```typescript
// Stripe requires amount in cents, not dollars
const amountInCents = price * 100;

// Using exponential backoff because Stripe rate limits at 100 req/sec
await retryWithBackoff(() => stripe.charge(amount));

// Legal: GDPR mandates explicit consent before email marketing
if (!user.hasMarketingConsent) {
  throw new ConsentRequiredError();
}
```

### Principes Présents à TOUS les Niveaux

| Principe | Description |
|----------|-------------|
| **Clean Code** | Code lisible, self-documenting |
| **Self-Documenting** | Noms clairs > commentaires |
| **No Inline Comments** | Refactor plutôt que commenter |
| **DRY** | Don't Repeat Yourself |
| **KISS** | Keep It Simple, Stupid |
| **YAGNI** | You Aren't Gonna Need It |
| **SOLID** | 5 principes OOP |
| **Boy Scout Rule** | Laisser le code plus propre |
| **Separation of Concerns** | Une responsabilité par module |

---

## Stack Technique

### Frontend
- **Next.js** 15 (App Router)
- **React** 19
- **TypeScript** 5.3+ (strict mode)
- **Tailwind CSS** 3.4+
- **shadcn/ui** (composants UI web)
- **React Native** + **Expo** SDK 52+ (si Web+Mobile)
- **NativeWind** (Tailwind pour RN)

### Backend & Data
- **tRPC** 11+ (API type-safe)
- **Prisma** 6+ (ORM)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Zod** 3+ (Validation)
- **TanStack Query** 5+ (Data fetching/cache)

### Auth & Payments
- **Supabase Auth** (Authentication)
- **Stripe** ou **Lemon Squeezy** (Paiements)

### Communications
- **Resend** + **React Email** (Emails transactionnels)
- **Twilio** (SMS, WhatsApp, Voice)

### Testing
- **Vitest** (Unit & integration tests)
- **React Testing Library** (Tests composants)
- **MSW** (Mock API)
- **Playwright** (E2E tests)

### Tooling
- **Turborepo** (Monorepo)
- **ESLint** + **Prettier** (Linting/Formatting)
- **Husky** (Git hooks)

---

## Testing Strategy : Test-After Generation (TAG)

### Approche Générale

**Notre approche : Test-After Generation (TAG)**

```
1. LLM génère : Code + Tests en parallèle
          ↓
2. Run tests automatiquement
          ↓
3. Si ❌ → LLM voit l'erreur et corrige
          ↓
4. Si ✅ → Validate rules (architecture, coverage)
          ↓
5. Si ❌ rules → LLM refactor
          ↓
6. Done ✅
```

**Exception : Crafted Domain Layer**
- Tests générés en PREMIER (spec comportement)
- Puis implémentation qui satisfait les tests
- Approche "Spec-First" (inspirée TDD)

---

## 🚀 Niveau RAPID - Ship Fast

### Contexte d'Usage
- **Équipe** : 1-2 développeurs (solo ou duo)
- **Durée de vie** : 3-6 mois (test marché)
- **Utilisateurs** : 0-100 early adopters
- **Revenue** : $0-5K MRR

### Architecture : Flat (Plate)
- Logique directement dans routers tRPC
- Pas de séparation en couches
- Code qui fonctionne > Code parfait

### Règles de Code

| Aspect | Implémentation |
|--------|---------------|
| **Max lignes/fonction** | 100 lignes |
| **Parameters** | Flexible |
| **Duplication** | Acceptable si < 3 fois (⚠️ Warning) |
| **Cyclomatic complexity** | Pas de limite |
| **SOLID** | S + I basic |
| **Comments** | WHY si besoin |

### Structure
```
packages/
├── api/
│   └── routers/
│       └── product.ts        # Toute la logique ici (100 lignes OK)
├── database/
│   └── client.ts             # Prisma simple
└── ui/
    └── components/           # shadcn/ui
```

### Testing : Tests de Validation
- ✅ Auth flows (login, register, logout)
- ✅ Payment flows (checkout, webhooks)
- ❌ Business logic
- ❌ UI components
- ❌ E2E
- **Coverage** : Aucun minimum requis

```typescript
// Exemple Test
describe('Auth', () => {
  it('should login with valid credentials', async () => {
    const response = await trpc.auth.login.mutate({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.user).toBeDefined();
    expect(response.token).toBeDefined();
  });
});
```

### Philosophie
> "Code qui fonctionne > Code parfait. Ship, learn, iterate."

### Principes Craft Actifs (6/16)
- ✅ Type Safety (TypeScript strict + Zod)
- ✅ Linting (ESLint basic)
- ✅ Git Hooks (pre-commit minimal)
- ✅ Error Handling (basic try-catch)
- ✅ Security (input validation + auth)
- ✅ Self-Documenting Code (pas de comments inline)

---

## ⚖️ Niveau BALANCED - Pragmatic Quality

### Contexte d'Usage
- **Équipe** : 3-10 développeurs
- **Durée de vie** : 1-3 ans (croissance)
- **Utilisateurs** : 100-10K clients payants
- **Revenue** : $5K-100K MRR

### Architecture : 3-Couches

**Layer 1: Routers (tRPC)** - Thin orchestration layer
- Max 20 lignes par procedure
- Validation only (Zod)
- Call services for business logic

**Layer 2: Services** - Business logic
- Pure functions when possible
- Unit tested (70%+ coverage)
- Platform-agnostic (shared between web and mobile)
- Max 50 lignes par fonction

**Layer 3: Repositories** - Data access
- Prisma queries
- Complex data operations
- Tested with integration tests

### Règles de Code

| Aspect | Implémentation |
|--------|---------------|
| **Max lignes/fonction** | 50 lignes |
| **Parameters** | Max 3 |
| **Duplication** | > 2 fois = extract obligatoire (⚠️ Review flag) |
| **Cyclomatic complexity** | < 10 |
| **SOLID** | Full |
| **Comments** | WHY required |

### Structure
```
packages/
├── api/
│   └── routers/
│       └── product.ts              # Fin (< 20 lignes)
├── services/
│   ├── product.service.ts          # Business logic
│   └── product.service.test.ts     # Tests
├── database/
│   └── repositories/
│       └── product.repository.ts   # Data access
└── validators/
    └── product.validator.ts        # Zod schemas
```

### Testing : Tests de Non-Régression
- ✅ Unit tests services (100% méthodes publiques)
- ✅ tRPC routers (happy path + erreurs)
- ✅ Component tests (critiques)
- ✅ E2E (auth + checkout)
- ✅ Integration tests (avec MSW)
- **Coverage** : 70% minimum enforced

```typescript
// Exemple Test Service
describe('UserService', () => {
  describe('getProfile', () => {
    it('should return user profile', async () => {
      const profile = await userService.getProfile('user-1');

      expect(profile).toBeDefined();
      expect(profile.email).toBe('test@example.com');
    });

    it('should throw when user not found', async () => {
      await expect(
        userService.getProfile('invalid-id')
      ).rejects.toThrow('User not found');
    });
  });
});
```

### Philosophie
> "Qualité où ça compte. Pragmatic engineering, pas de dogmatisme."

### Principes Craft Actifs (12/16)
- ✅ Tous ceux de Rapid +
- ✅ Architecture Layered (séparation concerns)
- ✅ Testing 70% coverage
- ✅ Code Review IA
- ✅ Documentation clés
- ✅ SOLID (tous principes appliqués)
- ✅ Performance basique

---

## 🏆 Niveau CRAFTED - Software Craftsmanship

### Contexte d'Usage
- **Équipe** : 10-200+ développeurs
- **Durée de vie** : 5-10+ ans (long-terme)
- **Utilisateurs** : 10K-1M+ utilisateurs
- **Revenue** : $100K+ MRR

### Architecture : Hexagonale (Domain/Application/Infrastructure)

**Domain Layer** - Pure business logic
- ZERO external dependencies
- Entities, Value Objects, Aggregates
- 100% test coverage
- Result pattern for errors (no throws)

**Application Layer** - Use-cases
- Orchestration de la logique domain
- Ultra-fin (< 10 lignes)
- 100% test coverage

**Infrastructure Layer** - Implementations
- Database repositories
- External services
- 80% test coverage

### Règles de Code

| Aspect | Implémentation |
|--------|---------------|
| **Max lignes/fonction** | 20 lignes |
| **Parameters** | Max 2 |
| **Duplication** | 0 duplication (❌ CI fail) |
| **Cyclomatic complexity** | < 5 |
| **SOLID** | Full + auditable |
| **Comments** | WHY + ADR ref |

### Structure
```
packages/
├── domain/                    # ⭐ Pure business logic (ZERO deps)
│   ├── entities/
│   │   ├── Product.ts         # Rich domain entity
│   │   └── Product.test.ts    # 100% coverage
│   ├── value-objects/
│   │   ├── Money.ts
│   │   └── Email.ts
│   ├── use-cases/
│   │   ├── CreateProduct.ts   # Orchestration
│   │   └── CreateProduct.test.ts
│   └── repositories/          # Interfaces only
│       └── IProductRepository.ts
│
├── api/                       # Application layer
│   └── routers/
│       └── product.ts         # Ultra-fin (< 10 lignes)
│
└── infrastructure/            # Implémentations
    ├── database/
    │   └── repositories/
    │       └── PrismaProductRepository.ts
    └── payments/
        └── StripeClient.ts
```

### Testing : Tests de Spécification (Spec-First)

**Pour domain entities et use-cases :**
1. UNDERSTAND business rules first
2. Generate tests FIRST (they specify behavior)
3. Then generate implementation that satisfies tests

- ✅ Domain entities : 100% coverage
- ✅ Use-cases : 100% coverage
- ✅ Infrastructure : 80% coverage
- ✅ E2E complets
- **Coverage** : Domain 100%, Use-cases 100%, Infra 80%

### Philosophie
> "Build it right. Architecture-first, sustainable pour 10+ ans."

### Principes Craft Actifs (16/16 - TOUS)
- ✅ Tous ceux de Balanced +
- ✅ Hexagonal Architecture
- ✅ Domain-Driven Design
- ✅ TDD-inspired (tests = spec)
- ✅ SOLID strict (architecture tests)
- ✅ ADR pour toutes décisions
- ✅ E2E complets
- ✅ Security hardened (OWASP Top 10)

---

## Web + Mobile : Patterns Spécifiques

### Shared Code (si Web+Mobile activé)

```
apps/
├── web/                      # Next.js
└── mobile/                   # React Native (Expo)

packages/
├── api/                      # tRPC (PARTAGÉ)
├── domain/                   # Business logic (PARTAGÉ - Crafted)
├── services/                 # Services (PARTAGÉS - Balanced/Crafted)
├── validators/               # Zod schemas (PARTAGÉS)
├── api-client/               # React Query hooks (PARTAGÉS)
└── ui/
    ├── primitives/           # Logique UI partagée
    ├── web/                  # shadcn/ui
    └── mobile/               # React Native components
```

### Mobile-Specific Features
- Expo Router (navigation)
- SecureStore (tokens sécurisés)
- NativeWind (Tailwind pour RN)
- Push notifications (Expo)
- Deep linking
- Platform.select patterns

### Storage Patterns
```typescript
// Web
localStorage.setItem('token', token);

// Mobile
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('token', token);

// Shared abstraction
// packages/storage/index.ts
export const storage = {
  setItem: Platform.OS === 'web'
    ? localStorage.setItem
    : SecureStore.setItemAsync,
  getItem: Platform.OS === 'web'
    ? localStorage.getItem
    : SecureStore.getItemAsync,
};
```

---

## Commandes Utiles

### Tests
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E
npm run test:e2e

# E2E UI
npm run test:e2e:ui
```

### Build
```bash
# Build all
npm run build

# Build specific app
npm run build --filter=web
npm run build --filter=mobile
```

### Dev
```bash
# Dev all
npm run dev

# Dev web only
npm run dev --filter=web

# Dev mobile only
npm run dev --filter=mobile
```

---

## Enforcement par Niveau

| Principe | Rapid | Balanced | Crafted |
|----------|-------|----------|---------|
| **Function length** | < 100 lignes | < 50 lignes | < 20 lignes |
| **Parameters** | Flexible | Max 3 | Max 2 |
| **DRY threshold** | 3+ duplications | 2+ duplications | 0 duplication |
| **Cyclomatic complexity** | Pas de limite | < 10 | < 5 |
| **SOLID** | S + I basic | Full | Full + auditable |
| **Comments** | WHY si besoin | WHY required | WHY + ADR ref |
| **Duplication blocking** | ⚠️ Warning | ⚠️ Review flag | ❌ CI fail |

---

## Résumé : Que Faire ?

1. **Identifiez le niveau du projet** (Rapid, Balanced, ou Crafted)
2. **Respectez la philosophie** de ce niveau
3. **Suivez l'architecture** correspondante
4. **Appliquez les règles de code** du niveau
5. **Générez les tests** selon la stratégie TAG
6. **Refactorez plutôt que commenter** (TOUJOURS)
7. **Validez la coverage** selon le niveau
8. **Si Web+Mobile** : partagez le code métier dans packages/

---

**Note finale** : Ce document établit les règles pour Claude Code. Ne configurez PAS de MCP servers - travaillez directement avec ces règles.
