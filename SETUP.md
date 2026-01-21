# OP Builder - Setup Guide

## Project: Airsoft Operations CMS

**Level**: Balanced (3-Layer Architecture)
**Platform**: Web Only (Mobile-First Design)

---

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.12.3
- PostgreSQL database (local or Supabase)
- Supabase account (for Auth + Storage)
- Resend account (for emails)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo>
cd op-builder

# Install dependencies
pnpm install
```

---

## 2. Environment Setup

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env
```

### Required Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/opbuilder?schema=public"

# Supabase (Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (Emails)
RESEND_API_KEY=re_your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 3. Database Setup

### Option A: Local PostgreSQL

```bash
# Create database
createdb opbuilder

# Run migrations
pnpm prisma migrate dev --name init

# Generate Prisma client
pnpm prisma generate
```

### Option B: Supabase PostgreSQL

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Copy the connection string (Settings → Database)
4. Update `DATABASE_URL` in `.env`
5. Run migrations:

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

---

## 4. Supabase Auth Setup

1. Go to Authentication → Settings in Supabase Dashboard
2. Enable Email provider
3. Copy API keys to `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 5. Run Development Server

```bash
# Start all packages
pnpm dev

# Or start specific app
pnpm --filter @crafted/web dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 6. Verify Installation

### Type Check
```bash
pnpm type-check
```

### Run Tests
```bash
pnpm test
```

### Build
```bash
pnpm build
```

---

## Project Structure

```
op-builder/
├── .ai/
│   ├── specs/               # User Stories & Specs
│   └── docs/                # Implementation docs
├── apps/
│   └── web/                 # Next.js app (TO BE CREATED)
├── packages/
│   ├── api/                 # tRPC routers ✅
│   │   └── routers/
│   │       └── team.ts      # Team management
│   ├── services/            # Business logic ✅
│   │   ├── team.service.ts
│   │   └── qrcode.service.ts
│   ├── database/            # Prisma + Repositories ✅
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── repositories/
│   │       └── team.repository.ts
│   ├── validators/          # Zod schemas ✅
│   │   └── team.validator.ts
│   └── ui/                  # shadcn/ui components
└── .env                     # Your environment config
```

---

## Implemented Features

### ✅ US-001: Team Management (Backend)

**Database Models**:
- Team (id, name, slug, description, logo, color, owner)
- TeamMember (id, name, callsign, email, phone, role, qrCodeToken)

**API Endpoints** (tRPC):
- `team.create` - Create team
- `team.getById` - Get team by ID
- `team.getBySlug` - Get team by slug
- `team.getUserTeams` - List user's teams
- `team.update` - Update team
- `team.delete` - Delete team
- `team.addMember` - Add member
- `team.updateMember` - Update member
- `team.deleteMember` - Delete member
- `team.transferOwnership` - Transfer ownership
- `team.getMemberQRCode` - Generate QR code

**Services**:
- Team CRUD operations with authorization
- QR code generation for members

---

## Next Steps

### 1. Create Frontend Pages
- `/teams/new` - Team creation wizard
- `/teams/[slug]` - Team dashboard
- `/teams/[slug]/members` - Member management

### 2. Create UI Components
- TeamCard
- MemberCard
- QRCodeDisplay
- TeamForm

### 3. Implement Remaining User Stories
- US-002: Create multi-team operations
- US-003: Define camps and assign teams
- US-004: Objective builder
- US-005: QR code generator (print layout)

---

## Available Commands

```bash
# Development
pnpm dev                     # Start dev server
pnpm build                   # Build for production
pnpm start                   # Start production server

# Database
pnpm prisma generate         # Generate Prisma client
pnpm prisma migrate dev      # Create migration
pnpm prisma studio           # Open Prisma Studio (DB GUI)

# Testing
pnpm test                    # Run tests
pnpm test:watch              # Watch mode
pnpm test:coverage           # Coverage report
pnpm test:e2e                # E2E tests
pnpm test:e2e:ui             # E2E with UI

# Code Quality
pnpm lint                    # Lint code
pnpm type-check              # TypeScript check
pnpm format                  # Format with Prettier
```

---

## Troubleshooting

### Prisma Client not generated
```bash
pnpm prisma generate
```

### Database connection error
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Test connection with: `psql $DATABASE_URL`

### Type errors
```bash
pnpm type-check
```

### Tests failing (TypeScript config issue)
**Known Issue**: Tests currently fail due to missing `@crafted/typescript-config/base.json`

**Temporary Fix**: Create the config or adjust tsconfig.json in packages/services

---

## Support

- Documentation: See `.ai/docs/` folder
- Specs: See `.ai/specs/first-specs.md`
- Implementation Report: See `.ai/docs/US-001-implementation.md`

---

## Architecture: Balanced Level

**3-Layer Architecture**:
1. **Routers** (API) - Validation only, max 20 lines
2. **Services** - Business logic, max 50 lines per function
3. **Repositories** - Data access, Prisma queries

**Code Rules**:
- Max 50 lines per function
- Max 3 parameters
- No inline comments (self-documenting code)
- 70% test coverage required
- Full SOLID principles

---

## License

Private - Internal Use Only
