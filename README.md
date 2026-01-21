# Crafted SaaS - Balanced Web

⚖️ **BALANCED Level** - Pragmatic Quality, Web Only

## Configuration

- **Level**: Balanced (Pragmatic Quality)
- **Platform**: Web Only (Next.js)
- **Team**: 3-10 developers
- **Lifespan**: 1-3 years (growth)
- **Users**: 100-10K paying customers
- **Revenue**: $5K-100K MRR

## Architecture

**3-Layer Architecture** - Separation of Concerns

```
apps/
└── web/              # Next.js 15 app

packages/
├── api/              # tRPC routers (thin, max 20 lines per procedure)
│   └── routers/      # Orchestration + validation only
├── services/         # Business logic (max 50 lines per function)
│   └── *.service.ts  # Pure functions when possible
├── validators/       # Zod schemas (shared validation)
├── database/         # Prisma + repositories
│   └── repositories/ # Data access layer
├── auth/             # Supabase Auth
├── payments/         # Stripe
├── emails/           # Resend + React Email
└── ui/               # shadcn/ui components
```

### Layer Responsibilities

1. **Routers (API)**: Thin orchestration, validation only (max 20 lines)
2. **Services**: Business logic, platform-agnostic (max 50 lines)
3. **Repositories**: Data access, complex Prisma queries

## Code Rules

| Aspect | Rule |
|--------|------|
| **Max lines/function** | 50 lines |
| **Parameters** | Max 3 |
| **Duplication** | > 2 times = extract required |
| **Cyclomatic complexity** | < 10 |
| **SOLID** | Full (all principles) |
| **Comments** | WHY required (NO inline WHAT/HOW) |

## Testing

**Test-After Generation (TAG)** - 70% coverage enforced

- ✅ Unit tests services (100% public methods)
- ✅ tRPC routers (happy path + errors)
- ✅ Component tests (critical components)
- ✅ E2E (auth + checkout)
- ✅ Integration tests (with MSW)

**Coverage**: 70% minimum enforced

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your keys

# Generate Prisma client
pnpm --filter @crafted/database db:generate

# Start dev server
pnpm --filter @crafted/web dev
```

## Features Included

- ✅ Authentication (Supabase)
- ✅ Payments (Stripe)
- ✅ Emails (Resend)
- ✅ Database (Prisma + PostgreSQL)
- ✅ UI Components (shadcn/ui)
- ✅ Type-safe API (tRPC)

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind
- **Backend**: tRPC 11, Zod validation
- **Database**: Prisma + PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Emails**: Resend + React Email

## Philosophy

> "Quality where it matters. Pragmatic engineering, not dogmatism."

## Active Craft Principles (12/16)

### From Rapid (6/16)
- ✅ Type Safety (TypeScript strict + Zod)
- ✅ Linting (ESLint)
- ✅ Git Hooks (pre-commit)
- ✅ Error Handling
- ✅ Security (input validation + auth)
- ✅ Self-Documenting Code

### New in Balanced (6/16)
- ✅ Layered Architecture (3 layers)
- ✅ Testing 70% coverage
- ✅ AI Code Review
- ✅ Key Documentation
- ✅ SOLID (all principles applied)
- ✅ Basic Performance

## When to upgrade to Crafted?

- Team > 10 developers
- Users > 10K
- MRR > $100K
- Need for longevity (5-10+ years)
- Critical systems requiring maximum reliability

## Documentation

- `CLAUDE.md` - Rules for Claude Code
- `.cursorrules` - Rules for Cursor
- `.clinerules` - Rules for Cline
- `.windsurfrules` - Rules for Windsurf
