# Balanced Web Architecture

## Overview

The Balanced level implements a **3-layer architecture** that separates concerns while maintaining pragmatic simplicity.

## Architecture Layers

### Layer 1: Routers (API) - Thin Orchestration

**Location**: `/packages/api/src/routers/`

**Responsibility**: Validation and orchestration only

**Rules**:
- Max 20 lines per procedure
- Only input validation (using Zod schemas from validators)
- Call services for business logic
- No direct database access
- No complex logic

**Example**:
```typescript
// packages/api/src/routers/auth.ts
import { publicProcedure, router } from '../trpc';
import { registerSchema } from '@crafted/validators';
import { registerUser } from '@crafted/services';

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => registerUser(input)),
});
```

### Layer 2: Services - Business Logic

**Location**: `/packages/services/src/`

**Responsibility**: Business logic implementation

**Rules**:
- Max 50 lines per function
- Max 3 parameters
- Pure functions when possible
- Platform-agnostic (can be shared between web/mobile)
- 100% test coverage for public methods
- No direct tRPC or Next.js dependencies

**Example**:
```typescript
// packages/services/src/auth.service.ts
import { signUp } from '@crafted/auth';
import type { RegisterInput } from '@crafted/validators';

export const registerUser = async (input: RegisterInput) => {
  const data = await signUp(input);
  return {
    user: data.user,
    session: data.session,
  };
};
```

### Layer 3: Repositories - Data Access

**Location**: `/packages/database/src/repositories/`

**Responsibility**: Data access and complex queries

**Rules**:
- Prisma queries only
- Complex data operations
- Can have longer functions for complex queries
- Integration tested

**Example**:
```typescript
// packages/database/src/repositories/subscription.repository.ts
import { db } from '../index';

export const findActiveSubscription = async (userId: string) => {
  return db.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] },
    },
    orderBy: { createdAt: 'desc' },
  });
};
```

## Supporting Packages

### Validators Package

**Location**: `/packages/validators/src/`

**Purpose**: Centralized Zod schemas for validation

**Benefits**:
- Single source of truth for validation
- Type inference for TypeScript
- Reusable across layers
- Easy to test

**Example**:
```typescript
// packages/validators/src/auth.validator.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

## Data Flow

```
Client Request
      ↓
tRPC Router (API Layer)
  - Validates input with Zod
  - Calls service function
      ↓
Service (Business Logic Layer)
  - Implements business logic
  - May call repositories or external services
      ↓
Repository (Data Layer) [if needed]
  - Executes Prisma queries
  - Returns data
      ↓
Service returns result
      ↓
Router returns response
      ↓
Client receives response
```

## Testing Strategy

### Unit Tests (Services)

**Coverage**: 100% of public methods

**Tools**: Vitest

**Location**: `packages/services/src/*.test.ts`

**Example**:
```typescript
describe('AuthService', () => {
  describe('registerUser', () => {
    it('should register a new user', async () => {
      // Test implementation
    });

    it('should throw when email already exists', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests (Routers)

**Coverage**: Happy path + error cases

**Tools**: Vitest + MSW

**Example**:
```typescript
describe('Auth Router', () => {
  it('should handle registration flow', async () => {
    const result = await caller.auth.register({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.user).toBeDefined();
  });
});
```

### E2E Tests

**Coverage**: Critical user flows (auth, checkout)

**Tools**: Playwright

## Code Quality Rules

### Function Length
- Routers: Max 20 lines per procedure
- Services: Max 50 lines per function
- Repositories: Flexible (can be longer for complex queries)

### Parameters
- Max 3 parameters per function
- Use object destructuring for multiple params

### Duplication
- 2+ duplications = extract to function
- CI review flag on duplication

### Cyclomatic Complexity
- Max complexity: 10
- Keep logic simple and testable

### SOLID Principles
- Single Responsibility: Each layer has one concern
- Open/Closed: Extend via services, not modifying routers
- Liskov Substitution: Service interfaces are consistent
- Interface Segregation: Small, focused service functions
- Dependency Inversion: Routers depend on service abstractions

## When to Use Each Layer

### Use Routers When:
- You need to expose an API endpoint
- You need to validate user input
- You need to orchestrate multiple services

### Use Services When:
- You have business logic
- You need to coordinate multiple operations
- Logic needs to be testable in isolation
- Logic might be reused (web + mobile)

### Use Repositories When:
- You have complex Prisma queries
- You need to abstract database operations
- Multiple services need the same query logic

## Migration from Rapid

If migrating from Rapid level:

1. Extract validation schemas to `packages/validators/`
2. Create `packages/services/` directory
3. Move business logic from routers to services
4. Refactor routers to be thin (max 20 lines)
5. Add unit tests for services
6. Create repositories for complex queries (optional)

## Benefits of This Architecture

1. **Maintainability**: Clear separation of concerns
2. **Testability**: Easy to unit test business logic
3. **Reusability**: Services can be shared across platforms
4. **Scalability**: Easy to add new features
5. **Type Safety**: End-to-end type safety with tRPC + Zod
6. **Developer Experience**: Clear structure, easy to navigate

## Common Patterns

### Error Handling
```typescript
// Service layer
export const registerUser = async (input: RegisterInput) => {
  try {
    const data = await signUp(input);
    return { user: data.user, session: data.session };
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      throw new Error('Email already registered');
    }
    throw error;
  }
};
```

### Async Operations
```typescript
// Always use async/await, not callbacks or promises chains
export const processPayment = async (input: PaymentInput) => {
  const session = await createCheckoutSession(input);
  const customer = await getCustomer(session.customerId);
  return { session, customer };
};
```

### Type Safety
```typescript
// Export types from validators
export type RegisterInput = z.infer<typeof registerSchema>;

// Use in services
export const registerUser = async (input: RegisterInput) => {
  // TypeScript ensures input matches schema
};
```
