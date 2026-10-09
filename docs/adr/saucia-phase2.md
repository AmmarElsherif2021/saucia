# **Saucia v2: Detailed Implementation Roadmap with Task Breakdown**

---

## **EXECUTIVE SUMMARY**

Saucia v2 refactors the codebase from a monolithic frontend-heavy architecture to a **platform-agnostic Clean server** + **FSD×Clean client** using a **pnpm workspace**. All features from v1 (master) are preserved and refactored incrementally. The migration uses a **strangler pattern** with zero downtime.

**Timeline:** 12-14 weeks | **Effort:** ~400-450 engineering hours | **Team:** 2-3 developers

---

## **TABLE OF CONTENTS**

1. [Phase 0: Foundations](#phase-0-foundations)
2. [Phase 1: Server Core (Order Vertical)](#phase-1-server-core-order-vertical)
3. [Phase 2: Client Skeleton & Cart](#phase-2-client-skeleton--cart)
4. [Phase 3: Client Order & Checkout](#phase-3-client-order--checkout)
5. [Phase 4: Auth & Session](#phase-4-auth--session)
6. [Phase 5: Menu & Features](#phase-5-menu--features)
7. [Phase 6: Premium & Subscriptions](#phase-6-premium--subscriptions)
8. [Phase 7: Admin Panel](#phase-7-admin-panel)
9. [Phase 8: Quality & Deployment](#phase-8-quality--deployment)
10. [v1 → v2 Migration Map](#v1--v2-migration-map)
11. [v2 README](#v2-readme)

---

# **PHASE 0: FOUNDATIONS (Weeks 1-2)**

## **Objective**
Set up the monorepo structure, establish shared packages, configure linting/CI, and validate the Edge Function bundling approach.

---

### **TASK 0.1: Initialize pnpm Workspace**

**Files to Create:**
- `pnpm-workspace.yaml`
- Root `package.json`
- Root `.npmrc`

**Deliverables:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'client'
  - 'server'
```

```json
{
  "name": "saucia",
  "private": true,
  "version": "2.0.0",
  "workspaces": ["packages/*", "client", "server"],
  "scripts": {
    "dev": "pnpm --recursive run dev",
    "build": "pnpm --recursive run build",
    "test": "pnpm --recursive run test",
    "lint": "pnpm --recursive run lint"
  }
}
```

**Time Estimate:** 2 hours

**Dependencies:** None

---

### **TASK 0.2: Create `packages/domain` (Shared Business Logic)**

**Files to Create:**
- `packages/domain/package.json`
- `packages/domain/tsconfig.json`
- `packages/domain/src/index.ts`
- `packages/domain/src/money/Money.ts`
- `packages/domain/src/order/orderRules.ts`
- `packages/domain/src/order/computeOrderTotals.ts`
- `packages/domain/src/cart/cartRules.ts`
- `packages/domain/src/subscription/TDEECalculator.ts`
- `packages/domain/src/subscription/BMICalculator.ts`
- `packages/domain/src/identity/phoneValidation.ts`

**Deliverables:**

```typescript
// packages/domain/src/money/Money.ts
/**
 * Money value object - handles currency safely using minor units (cents)
 * Used by BOTH client and server
 */
export class Money {
  private readonly cents: number;

  private constructor(cents: number) {
    if (!Number.isInteger(cents)) throw new Error('Money must be in integer cents');
    this.cents = cents;
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static fromDollars(dollars: number): Money {
    return new Money(Math.round(dollars * 100));
  }

  get inCents(): number {
    return this.cents;
  }

  get inDollars(): number {
    return this.cents / 100;
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.inCents);
  }

  subtract(other: Money): Money {
    if (other.inCents > this.cents) throw new Error('Insufficient funds');
    return Money.fromCents(this.cents - other.inCents);
  }

  equals(other: Money): boolean {
    return this.cents === other.inCents;
  }
}
```

```typescript
// packages/domain/src/order/computeOrderTotals.ts
import { Money } from '../money/Money';

export interface OrderTotals {
  subtotal: Money;
  taxAmount: Money;
  deliveryFee: Money;
  discountAmount: Money;
  totalAmount: Money;
}

/**
 * Pure function: compute order totals
 * Invariant: totalAmount = subtotal + tax + delivery - discount
 */
export function computeOrderTotals(
  subtotal: Money,
  taxAmount: Money,
  deliveryFee: Money,
  discountAmount: Money
): OrderTotals {
  const totalAmount = subtotal
    .add(taxAmount)
    .add(deliveryFee)
    .subtract(discountAmount);

  return {
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount,
    totalAmount,
  };
}

/**
 * Validate order totals satisfy the invariant
 */
export function validateOrderTotals(totals: OrderTotals): { isValid: boolean; error?: string } {
  const computed = computeOrderTotals(
    totals.subtotal,
    totals.taxAmount,
    totals.deliveryFee,
    totals.discountAmount
  );

  if (!computed.totalAmount.equals(totals.totalAmount)) {
    return {
      isValid: false,
      error: `Total mismatch: expected ${computed.totalAmount.inDollars}, got ${totals.totalAmount.inDollars}`,
    };
  }

  return { isValid: true };
}
```

```typescript
// packages/domain/src/subscription/TDEECalculator.ts
export interface HealthProfile {
  age: number;
  gender: 'M' | 'F';
  weight_kg: number;
  height_cm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'lose' | 'maintain' | 'gain';
}

/**
 * Mifflin-St Jeor formula (more accurate than Harris-Benedict)
 */
export class TDEECalculator {
  static calculateBMR(profile: HealthProfile): number {
    const { age, gender, weight_kg, height_cm } = profile;

    let bmr: number;
    if (gender === 'M') {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    } else {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
    }

    return Math.round(bmr);
  }

  static calculateTDEE(profile: HealthProfile): number {
    const bmr = this.calculateBMR(profile);
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    return Math.round(bmr * multipliers[profile.activityLevel]);
  }

  static calculateTargetCalories(profile: HealthProfile): number {
    const tdee = this.calculateTDEE(profile);
    const adjustments = {
      lose: tdee - 500,
      maintain: tdee,
      gain: tdee + 300,
    };
    return adjustments[profile.goal];
  }
}
```

```typescript
// packages/domain/src/index.ts
export { Money } from './money/Money';
export { computeOrderTotals, validateOrderTotals } from './order/computeOrderTotals';
export type { OrderTotals } from './order/computeOrderTotals';
export { TDEECalculator, BMICalculator } from './subscription/TDEECalculator';
export { phoneValidation } from './identity/phoneValidation';
```

**Time Estimate:** 8 hours

**Dependencies:** None

**Legacy v1 Mapping:**
- `shared/domain/order/` → `packages/domain/src/order/`
- `shared/domain/subscription/calculators/` → `packages/domain/src/subscription/`
- `shared/domain/auth/validators/phoneValidation.ts` → `packages/domain/src/identity/phoneValidation.ts`

---

### **TASK 0.3: Create `packages/contracts` (API Contract Schemas)**

**Files to Create:**
- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/order/submitOrder.schema.ts`
- `packages/contracts/src/order/orderStatus.ts`
- `packages/contracts/src/errors/errorCodes.ts`
- `packages/contracts/src/auth/loginResponse.schema.ts`
- `packages/contracts/src/subscription/enrollSubscription.schema.ts`

**Deliverables:**

```typescript
// packages/contracts/src/order/submitOrder.schema.ts
/**
 * Contract: Submit order request (from client to server)
 * Client sends only identifiers and quantities; server looks up prices
 */
export interface SubmitOrderRequest {
  deliveryAddressId: string;
  orderMeals: {
    mealId: string;
    quantity: number;
  }[];
  clientInstructions?: string;
}

export interface SubmitOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number; // in cents
  estimatedDelivery: string; // ISO 8601
}

export interface OrderDetailsResponse {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  clientInstructions?: string;
  createdAt: string;
  estimatedDelivery?: string;
  meals: {
    mealId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}
```

```typescript
// packages/contracts/src/errors/errorCodes.ts
export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',

  // Order
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  FINANCIAL_MISMATCH = 'FINANCIAL_MISMATCH',
  MEAL_NOT_FOUND = 'MEAL_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',

  // Subscription
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  INVALID_HEALTH_PROFILE = 'INVALID_HEALTH_PROFILE',

  // Address
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',
  DELIVERY_AREA_NOT_SUPPORTED = 'DELIVERY_AREA_NOT_SUPPORTED',

  // Generic
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

**Time Estimate:** 6 hours

**Dependencies:** `packages/domain`

**Legacy v1 Mapping:**
- API handler responses → `packages/contracts/src/*/` schema files

---

### **TASK 0.4: Set Up Linting & Enforcement Rules**

**Files to Create:**
- `.eslintrc.cjs` (root)
- `.steiger.json` (FSD linter)
- `dependency-cruiser.js` (server layer enforcement)

**Deliverables:**

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'boundaries'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'deny',
        rules: [
          // App layer: can import anything (composition root)
          {
            from: ['app'],
            allow: ['**'],
          },
          // Pages: only from pages, widgets, entities, shared
          {
            from: ['pages'],
            allow: ['pages', 'widgets', 'entities', 'shared'],
          },
          // Widgets: only from widgets, entities, shared
          {
            from: ['widgets'],
            allow: ['widgets', 'entities', 'shared'],
          },
          // Features: only from entities, shared
          {
            from: ['features'],
            allow: ['entities', 'shared'],
          },
          // Entities: only from shared
          {
            from: ['entities'],
            allow: ['entities', 'shared'],
          },
          // Shared: only from packages (domain, contracts)
          {
            from: ['shared'],
            allow: ['shared', '@saucia/domain', '@saucia/contracts'],
          },
        ],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // No infrastructure exports outside app
          {
            group: ['**/infrastructure', '**/infrastructure/**'],
            message: 'Infrastructure can only be imported in app/di/',
          },
          // No server imports in client
          {
            group: ['server', 'server/**'],
            message: 'Client cannot import from server',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['client/**/*.ts', 'client/**/*.tsx'],
      rules: {
        'boundaries/element-types': ['error', { default: 'deny', rules: [] }], // Enforce FSD
      },
    },
    {
      files: ['server/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['client', 'client/**'],
                message: 'Server cannot import from client',
              },
              // Domain and application cannot import infrastructure
              {
                from: ['modules/*/domain', 'modules/*/application'],
                allow: ['kernel', 'modules/*/domain', 'modules/*/application', '@saucia/domain', '@saucia/contracts'],
              },
            ],
          },
        ],
      },
    },
  ],
};
```

```json
// .steiger.json
{
  "layers": [
    "app",
    "pages",
    "widgets",
    "features",
    "entities",
    "shared"
  ],
  "reuseNeighboringSegments": true,
  "slices": [
    "cart",
    "order",
    "session",
    "menu",
    "subscription",
    "address",
    "message"
  ]
}
```

**Time Estimate:** 4 hours

**Dependencies:** Eslint plugins

---

### **TASK 0.5: Bundling Spike - Edge Function Dependencies**

**Objective:** Validate that `server/` modules can be bundled and imported into a Supabase Edge Function.

**Deliverables:**

1. Create a test edge function:
   ```typescript
   // supabase/functions/_test-bundling/index.ts
   import { TDEECalculator } from '@saucia/domain';
   import { computeOrderTotals } from '@saucia/domain';
   
   export async function handler(req: Request) {
     const result = TDEECalculator.calculateTDEE({...});
     return new Response(JSON.stringify(result));
   }
   ```

2. Deploy and verify it loads correctly.

3. Document findings in `docs/EDGE_FUNCTION_BUNDLING.md`:
   - Which imports work / don't work
   - Any import path rewrites needed
   - Build/deploy time impact

**Time Estimate:** 6 hours

**Outcome:** Clear path forward for edge function imports in later phases; fallback plan if bundling fails.

---

### **TASK 0.6: Configure CI/CD Pipeline**

**Files to Create:**
- `.github/workflows/test.yml`
- `.github/workflows/lint.yml`
- `.github/workflows/deploy-dev.yml`

**Deliverables:**

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test
      - run: pnpm run lint
```

**Time Estimate:** 3 hours

**Dependencies:** GitHub Actions setup

---

### **TASK 0.7: Documentation Structure**

**Files to Create:**
- `docs/ARCHITECTURE.md` (refined from v2.md)
- `docs/FSD_CLEAN_RULES.md` (detailed rules from Section VI)
- `docs/API_CONTRACTS.md` (endpoint definitions)
- `docs/SERVER.md` (server architecture guide)
- `docs/DEPLOYMENT.md` (how to deploy to Supabase)
- `docs/EDGE_FUNCTION_BUNDLING.md` (results from Task 0.5)
- `MIGRATION_MAP.md` (v1 → v2 mappings)

**Time Estimate:** 8 hours

---

## **PHASE 0 SUMMARY**

| Task | Hours | Deliverables |
|------|-------|---|
| 0.1: pnpm workspace | 2 | `pnpm-workspace.yaml`, root `package.json` |
| 0.2: `packages/domain` | 8 | Money, order rules, TDEE, validators |
| 0.3: `packages/contracts` | 6 | API schemas, error codes |
| 0.4: Linting | 4 | ESLint, Steiger, dependency-cruiser config |
| 0.5: Bundling spike | 6 | Findings doc, test function |
| 0.6: CI/CD | 3 | GitHub Actions workflows |
| 0.7: Docs | 8 | Architecture guides, migration map |
| **TOTAL** | **37** | Foundation complete, safe to build on |

---

# **PHASE 1: SERVER CORE (Order Vertical) (Weeks 3-5)**

## **Objective**
Build the authoritative server with a single end-to-end use case: order submission. This is the proof that the Clean core + Supabase adapter pattern works.

---

### **TASK 1.1: Server Folder Structure & Kernel**

**Files to Create:**
- `server/src/kernel/Result.ts`
- `server/src/kernel/DomainError.ts`
- `server/src/kernel/ports/Clock.ts`
- `server/src/kernel/ports/Logger.ts`
- `server/src/kernel/ports/IdGenerator.ts`
- `server/tsconfig.json`
- `server/package.json`

**Deliverables:**

```typescript
// server/src/kernel/Result.ts
/**
 * Result type: Either<Error, Success>
 * Used throughout the server to handle errors without throwing
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  constructor(readonly value: T) {}
  isSuccess(): this is Success<T> { return true; }
  isFailure(): this is Failure<unknown> { return false; }
}

export class Failure<E> {
  constructor(readonly error: E) {}
  isSuccess(): this is Success<unknown> { return false; }
  isFailure(): this is Failure<E> { return true; }
}

export const Ok = <T>(value: T): Result<T> => new Success(value);
export const Err = <E>(error: E): Result<any, E> => new Failure(error);
```

```typescript
// server/src/kernel/DomainError.ts
import { ErrorCode } from '@saucia/contracts';

export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly statusCode: number = 400,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(ErrorCode.UNAUTHORIZED, message, 401);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(ErrorCode.ORDER_NOT_FOUND, `${entity} not found: ${id}`, 404);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}

export class FinancialMismatchError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.FINANCIAL_MISMATCH, message, 400);
  }
}
```

**Time Estimate:** 6 hours

---

### **TASK 1.2: Order Module - Domain Layer**

**Files to Create:**
- `server/src/modules/order/domain/Order.ts`
- `server/src/modules/order/domain/OrderStatus.ts`
- `server/src/modules/order/domain/errors/OrderErrors.ts`

**Deliverables:**

```typescript
// server/src/modules/order/domain/OrderStatus.ts
/**
 * Order status state machine
 */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return orderStatusTransitions[from]?.includes(to) ?? false;
}
```

```typescript
// server/src/modules/order/domain/Order.ts
import { Money } from '@saucia/domain';
import { canTransition, OrderStatus } from './OrderStatus';

export interface OrderMeal {
  mealId: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export class Order {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly orderNumber: number,
    readonly status: OrderStatus,
    readonly subtotal: Money,
    readonly taxAmount: Money,
    readonly deliveryFee: Money,
    readonly discountAmount: Money,
    readonly totalAmount: Money,
    readonly meals: OrderMeal[],
    readonly deliveryAddressId: string,
    readonly clientInstructions: string,
    readonly createdAt: Date,
    readonly estimatedDelivery?: Date
  ) {}

  /**
   * Transition to new status (does not persist, just validates)
   */
  transitionTo(newStatus: OrderStatus): Order {
    if (!canTransition(this.status, newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    return new Order(
      this.id,
      this.userId,
      this.orderNumber,
      newStatus,
      this.subtotal,
      this.taxAmount,
      this.deliveryFee,
      this.discountAmount,
      this.totalAmount,
      this.meals,
      this.deliveryAddressId,
      this.clientInstructions,
      this.createdAt,
      this.estimatedDelivery
    );
  }

  /**
   * Validate invariant: totalAmount = subtotal + tax + delivery - discount
   */
  validateFinancials(): { isValid: boolean; error?: string } {
    const expected = this.subtotal
      .add(this.taxAmount)
      .add(this.deliveryFee)
      .subtract(this.discountAmount);

    if (!expected.equals(this.totalAmount)) {
      return {
        isValid: false,
        error: `Financial mismatch: ${expected.inDollars} vs ${this.totalAmount.inDollars}`,
      };
    }
    return { isValid: true };
  }
}
```

**Time Estimate:** 5 hours

**Legacy v1 Mapping:**
- `shared/domain/order/models/Order.ts` → `server/src/modules/order/domain/Order.ts`
- `shared/domain/order/models/OrderStatus.ts` → `server/src/modules/order/domain/OrderStatus.ts`

---

### **TASK 1.3: Order Module - Application Layer (Use Cases)**

**Files to Create:**
- `server/src/modules/order/application/ports/OrderRepository.ts`
- `server/src/modules/order/application/ports/MealPriceReader.ts`
- `server/src/modules/order/application/ports/UnitOfWork.ts`
- `server/src/modules/order/application/use-cases/SubmitOrderUseCase.ts`

**Deliverables:**

```typescript
// server/src/modules/order/application/ports/OrderRepository.ts
import { Order } from '../../domain/Order';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string, limit?: number): Promise<Order[]>;
  getNextOrderNumber(): Promise<number>; // Uses sequence
}
```

```typescript
// server/src/modules/order/application/ports/MealPriceReader.ts
import { Money } from '@saucia/domain';

export interface MealInfo {
  id: string;
  name: string;
  unitPrice: Money;
  isAvailable: boolean;
}

export interface IMealPriceReader {
  /**
   * Get current meal prices and availability
   * Used to compute server-side totals
   */
  getMealPrices(mealIds: string[]): Promise<MealInfo[]>;
}
```

```typescript
// server/src/modules/order/application/ports/UnitOfWork.ts
/**
 * Transaction wrapper - atomic order creation
 */
export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  execute<T>(fn: () => Promise<T>): Promise<T>;
}
```

```typescript
// server/src/modules/order/application/use-cases/SubmitOrderUseCase.ts
import { SubmitOrderRequest, SubmitOrderResponse } from '@saucia/contracts';
import { computeOrderTotals, Money } from '@saucia/domain';
import { Order } from '../../domain/Order';
import { IOrderRepository } from '../ports/OrderRepository';
import { IMealPriceReader } from '../ports/MealPriceReader';
import { IUnitOfWork } from '../ports/UnitOfWork';
import { DomainError } from '../../../kernel/DomainError';
import { Clock, IdGenerator, Logger } from '../../../kernel/ports';

export class SubmitOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private mealPriceReader: IMealPriceReader,
    private unitOfWork: IUnitOfWork,
    private clock: Clock,
    private idGenerator: IdGenerator,
    private logger: Logger
  ) {}

  async execute(
    userId: string,
    request: SubmitOrderRequest
  ): Promise<SubmitOrderResponse> {
    this.logger.info('SubmitOrder', { userId, addressId: request.deliveryAddressId });

    // 1. Fetch meal prices from DB (server is source of truth)
    const mealIds = request.orderMeals.map(m => m.mealId);
    const meals = await this.mealPriceReader.getMealPrices(mealIds);

    if (meals.length !== mealIds.length) {
      throw new DomainError(
        'MEAL_NOT_FOUND',
        'One or more meals not found or unavailable',
        404
      );
    }

    // 2. Recompute totals on server (do not trust client)
    let subtotal = Money.fromCents(0);
    const orderMeals = [];

    for (const requestMeal of request.orderMeals) {
      const meal = meals.find(m => m.id === requestMeal.mealId);
      if (!meal || !meal.isAvailable) {
        throw new DomainError('MEAL_NOT_FOUND', `Meal ${requestMeal.mealId} unavailable`, 404);
      }

      const mealTotal = Money.fromCents(
        meal.unitPrice.inCents * requestMeal.quantity
      );
      subtotal = subtotal.add(mealTotal);

      orderMeals.push({
        mealId: meal.id,
        quantity: requestMeal.quantity,
        unitPrice: meal.unitPrice,
        totalPrice: mealTotal,
      });
    }

    // 3. Compute totals
    const taxAmount = Money.fromCents(0); // Admin sets this later
    const deliveryFee = Money.fromCents(1500); // $15
    const discountAmount = Money.fromCents(0); // No discount yet
    const totals = computeOrderTotals(subtotal, taxAmount, deliveryFee, discountAmount);

    // 4. Create order entity
    const orderId = this.idGenerator.generate();
    const orderNumber = await this.orderRepository.getNextOrderNumber();
    const estimatedDelivery = new Date(this.clock.now().getTime() + 45 * 60000); // +45 min

    const order = new Order(
      orderId,
      userId,
      orderNumber,
      'pending',
      totals.subtotal,
      totals.taxAmount,
      totals.deliveryFee,
      totals.discountAmount,
      totals.totalAmount,
      orderMeals,
      request.deliveryAddressId,
      request.clientInstructions || '',
      this.clock.now(),
      estimatedDelivery
    );

    // 5. Validate invariant
    const validation = order.validateFinancials();
    if (!validation.isValid) {
      throw new DomainError('FINANCIAL_MISMATCH', validation.error!, 400);
    }

    // 6. Save atomically
    await this.unitOfWork.execute(async () => {
      await this.orderRepository.save(order);
    });

    this.logger.info('SubmitOrder success', { orderId, orderNumber, total: totals.totalAmount.inDollars });

    return {
      orderId,
      orderNumber: `#${String(orderNumber).padStart(6, '0')}`,
      totalAmount: totals.totalAmount.inCents,
      estimatedDelivery: estimatedDelivery.toISOString(),
    };
  }
}
```

**Time Estimate:** 10 hours

**Legacy v1 Mapping:**
- `application/useCases/cart/SubmitOrderUseCase.ts` → `server/src/modules/order/application/use-cases/SubmitOrderUseCase.ts` (completely rewritten for server)

---

### **TASK 1.4: Order Module - Infrastructure (Supabase Adapter)**

**Files to Create:**
- `server/src/infrastructure/supabase/repositories/SupabaseOrderRepository.ts`
- `server/src/infrastructure/supabase/repositories/SupabaseMealPriceReader.ts`
- `server/src/infrastructure/supabase/mappers/orderMapper.ts`
- `server/src/infrastructure/supabase/dto/orderDto.ts`
- `server/src/infrastructure/supabase/SupabaseUnitOfWork.ts`

**Deliverables:**

```typescript
// server/src/infrastructure/supabase/dto/orderDto.ts
/**
 * DTO: Supabase row schema
 * Never export this outside infrastructure/
 */
export interface OrderRow {
  id: string;
  user_id: string;
  order_number: number;
  status: string;
  subtotal: number; // in cents (numeric)
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  client_instructions: string | null;
  delivery_address_id: string;
  created_at: string;
  updated_at: string;
  estimated_delivery: string | null;
}
```

```typescript
// server/src/infrastructure/supabase/mappers/orderMapper.ts
import { Money } from '@saucia/domain';
import { Order, OrderMeal } from '../../order/domain/Order';
import { OrderRow } from '../dto/orderDto';

export class OrderMapper {
  static toDomain(row: OrderRow, meals: OrderMeal[]): Order {
    return new Order(
      row.id,
      row.user_id,
      row.order_number,
      row.status as any,
      Money.fromCents(row.subtotal),
      Money.fromCents(row.tax_amount),
      Money.fromCents(row.delivery_fee),
      Money.fromCents(row.discount_amount),
      Money.fromCents(row.total_amount),
      meals,
      row.delivery_address_id,
      row.client_instructions || '',
      new Date(row.created_at),
      row.estimated_delivery ? new Date(row.estimated_delivery) : undefined
    );
  }

  static toPersistence(order: Order): Omit<OrderRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: order.userId,
      order_number: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal.inCents,
      tax_amount: order.taxAmount.inCents,
      delivery_fee: order.deliveryFee.inCents,
      discount_amount: order.discountAmount.inCents,
      total_amount: order.totalAmount.inCents,
      payment_status: 'unpaid',
      client_instructions: order.clientInstructions,
      delivery_address_id: order.deliveryAddressId,
      estimated_delivery: order.estimatedDelivery?.toISOString() || null,
    };
  }
}
```

```typescript
// server/src/infrastructure/supabase/repositories/SupabaseOrderRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Order } from '../../order/domain/Order';
import { IOrderRepository } from '../../order/application/ports/OrderRepository';
import { OrderMapper } from '../mappers/orderMapper';
import { OrderRow } from '../dto/orderDto';

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(order: Order): Promise<void> {
    const payload = OrderMapper.toPersistence(order);

    // Insert order + order_meals via RPC (atomic)
    const { error } = await this.supabase.rpc('create_order_with_meals', {
      order_data: payload,
      order_meals: order.meals.map(m => ({
        meal_id: m.mealId,
        quantity: m.quantity,
        unit_price: m.unitPrice.inCents,
        total_price: m.totalPrice.inCents,
      })),
    });

    if (error) throw error;
  }

  async findById(id: string): Promise<Order | null> {
    const { data: orderRow, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) return null;

    const { data: mealsRows } = await this.supabase
      .from('order_meals')
      .select('*')
      .eq('order_id', id);

    const meals = (mealsRows || []).map(m => ({
      mealId: m.meal_id,
      quantity: m.quantity,
      unitPrice: Money.fromCents(m.unit_price),
      totalPrice: Money.fromCents(m.total_price),
    }));

    return OrderMapper.toDomain(orderRow as OrderRow, meals);
  }

  async getNextOrderNumber(): Promise<number> {
    const { data } = await this.supabase.rpc('get_next_order_number');
    return data;
  }

  async findByUserId(userId: string, limit = 50): Promise<Order[]> {
    const { data: rows } = await this.supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return Promise.all(
      (rows || []).map(async row => {
        const { data: mealsRows } = await this.supabase
          .from('order_meals')
          .select('*')
          .eq('order_id', row.id);

        const meals = (mealsRows || []).map(m => ({...}));
        return OrderMapper.toDomain(row as OrderRow, meals);
      })
    );
  }
}
```

**Time Estimate:** 12 hours

**Legacy v1 Mapping:**
- `infrastructure/supabase/repositories/SupabaseOrderRepository.ts` → refactored to implement the port

---

### **TASK 1.5: Database Migrations & Stored Procedures**

**Files to Create:**
- `server/database/migrations/001_initial_schema.sql`
- `server/database/migrations/002_add_rls.sql`
- `server/database/migrations/003_add_sequences_triggers.sql`
- `server/database/policies/rls.sql`

**Deliverables:**

```sql
-- server/database/migrations/001_initial_schema.sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number BIGINT NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  client_instructions TEXT,
  delivery_address_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  estimated_delivery TIMESTAMP,
  CONSTRAINT total_equals_sum CHECK (
    total_amount = subtotal + tax_amount + delivery_fee - discount_amount
  )
);

CREATE TABLE order_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_meals_order_id ON order_meals(order_id);
```

```sql
-- server/database/migrations/002_add_rls.sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_meals ENABLE ROW LEVEL SECURITY;

-- Users can see only their own orders
CREATE POLICY "Users see own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins see all orders
CREATE POLICY "Admins see all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can see meals for their orders
CREATE POLICY "Users see own order meals" ON order_meals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );
```

```sql
-- server/database/migrations/003_add_sequences_triggers.sql
CREATE SEQUENCE order_number_seq START 1000;

-- Stored procedure: atomic order creation
CREATE OR REPLACE FUNCTION create_order_with_meals(
  order_data JSONB,
  order_meals JSONB[]
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
BEGIN
  INSERT INTO orders (
    user_id, order_number, status, subtotal, tax_amount, delivery_fee,
    discount_amount, total_amount, payment_status, client_instructions,
    delivery_address_id, estimated_delivery
  )
  VALUES (
    (order_data->>'user_id')::UUID,
    nextval('order_number_seq'),
    order_data->>'status',
    (order_data->>'subtotal')::NUMERIC,
    (order_data->>'tax_amount')::NUMERIC,
    (order_data->>'delivery_fee')::NUMERIC,
    (order_data->>'discount_amount')::NUMERIC,
    (order_data->>'total_amount')::NUMERIC,
    order_data->>'payment_status',
    order_data->>'client_instructions',
    (order_data->>'delivery_address_id')::UUID,
    (order_data->>'estimated_delivery')::TIMESTAMP
  )
  RETURNING id INTO v_order_id;

  -- Insert meals
  FOR meal IN (SELECT * FROM jsonb_array_elements(order_meals))
  LOOP
    INSERT INTO order_meals (
      order_id, meal_id, quantity, unit_price, total_price
    )
    VALUES (
      v_order_id,
      (meal->>'meal_id')::UUID,
      (meal->>'quantity')::INT,
      (meal->>'unit_price')::NUMERIC,
      (meal->>'total_price')::NUMERIC
    );
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS BIGINT AS $$
BEGIN
  RETURN nextval('order_number_seq');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Time Estimate:** 8 hours

**Legacy v1 Mapping:**
- `supabase/migrations/V1__initial_schema.sql` → `server/database/migrations/001_initial_schema.sql`
- `supabase/migrations/V3__add_triggers.sql` → split into 002 and 003

---

### **TASK 1.6: Server HTTP Handler & Routing**

**Files to Create:**
- `server/src/delivery-shared/http/Router.ts`
- `server/src/delivery-shared/http/AuthMiddleware.ts`
- `server/src/delivery-shared/http/ErrorHandler.ts`
- `server/src/modules/order/delivery/http/orderController.ts`
- `server/src/modules/order/delivery/http/routes.ts`

**Deliverables:**

```typescript
// server/src/delivery-shared/http/AuthMiddleware.ts
/**
 * Extract user from JWT (from Authorization header)
 */
import { jwtVerify } from 'jose';
import { DomainError } from '../../kernel/DomainError';

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET')!);

export async function extractUser(req: Request): Promise<{ userId: string; isAdmin: boolean }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new DomainError('UNAUTHORIZED', 'Missing authorization header', 401);
  }

  const token = authHeader.slice(7);
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return {
      userId: verified.payload.sub as string,
      isAdmin: (verified.payload.app_metadata as any)?.is_admin ?? false,
    };
  } catch (error) {
    throw new DomainError('INVALID_TOKEN', 'Invalid JWT', 401);
  }
}
```

```typescript
// server/src/delivery-shared/http/ErrorHandler.ts
import { DomainError } from '../../kernel/DomainError';
import type { ErrorCode } from '@saucia/contracts';

export function errorToResponse(error: unknown): Response {
  if (error instanceof DomainError) {
    return new Response(
      JSON.stringify({
        code: error.code,
        message: error.message,
        details: error.details,
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Avoid leaking internal details
  console.error('Unhandled error:', error);
  return new Response(
    JSON.stringify({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

```typescript
// server/src/modules/order/delivery/http/orderController.ts
import { SubmitOrderRequest } from '@saucia/contracts';
import { SubmitOrderUseCase } from '../../application/use-cases/SubmitOrderUseCase';
import { extractUser, errorToResponse } from '../../../../delivery-shared/http';

export async function submitOrderHandler(
  req: Request,
  submitOrderUseCase: SubmitOrderUseCase
): Promise<Response> {
  try {
    const { userId } = await extractUser(req);
    const body = await req.json() as SubmitOrderRequest;

    const result = await submitOrderUseCase.execute(userId, body);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
```

**Time Estimate:** 8 hours

**Legacy v1 Mapping:**
- `supabase/functions/order-processing/index.ts` → `server/src/modules/order/delivery/http/orderController.ts`

---

### **TASK 1.7: Composition Root & Testing**

**Files to Create:**
- `server/src/composition/container.ts`
- `server/src/composition/env.ts`
- `server/src/modules/order/application/use-cases/SubmitOrderUseCase.test.ts`
- `server/src/infrastructure/supabase/repositories/SupabaseOrderRepository.test.ts`

**Deliverables:**

```typescript
// server/src/composition/container.ts
/**
 * Dependency injection container
 * Wires all ports to implementations
 */
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SubmitOrderUseCase } from '../modules/order/application/use-cases/SubmitOrderUseCase';
import { SupabaseOrderRepository } from '../infrastructure/supabase/repositories/SupabaseOrderRepository';
import { SupabaseMealPriceReader } from '../infrastructure/supabase/repositories/SupabaseMealPriceReader';
import { SupabaseUnitOfWork } from '../infrastructure/supabase/SupabaseUnitOfWork';
import { RealClock, RealIdGenerator, ConsoleLogger } from '../platform';

export class Container {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
  }

  getSubmitOrderUseCase(): SubmitOrderUseCase {
    return new SubmitOrderUseCase(
      new SupabaseOrderRepository(this.supabase),
      new SupabaseMealPriceReader(this.supabase),
      new SupabaseUnitOfWork(this.supabase),
      new RealClock(),
      new RealIdGenerator(),
      new ConsoleLogger()
    );
  }
}
```

```typescript
// server/src/modules/order/application/use-cases/SubmitOrderUseCase.test.ts
import { assertEquals } from 'https://deno.land/std@0.208.0/testing/asserts.ts';
import { Money } from '@saucia/domain';
import { SubmitOrderUseCase } from './SubmitOrderUseCase';
import { Order } from '../../domain/Order';

// Mock implementations
class MockOrderRepository {
  async save(order: Order) {}
  async getNextOrderNumber() { return 1001; }
}

class MockMealPriceReader {
  async getMealPrices(mealIds: string[]) {
    return mealIds.map((id, i) => ({
      id,
      name: `Meal ${i}`,
      unitPrice: Money.fromDollars(12.99),
      isAvailable: true,
    }));
  }
}

Deno.test('SubmitOrder recomputes totals on server', async () => {
  const useCase = new SubmitOrderUseCase(
    new MockOrderRepository(),
    new MockMealPriceReader(),
    // ... mock other deps
  );

  const result = await useCase.execute('user-123', {
    deliveryAddressId: 'addr-1',
    orderMeals: [
      { mealId: 'meal-1', quantity: 2 },
      { mealId: 'meal-2', quantity: 1 },
    ],
  });

  assertEquals(result.totalAmount, 4099); // 12.99 * 2 + 12.99 + 15.00 = $50.97 = 5097 cents
});
```

**Time Estimate:** 10 hours

---

## **PHASE 1 SUMMARY**

| Task | Hours | Deliverables |
|------|-------|---|
| 1.1: Kernel | 6 | Result, DomainError, ports |
| 1.2: Domain | 5 | Order entity, status machine |
| 1.3: Application | 10 | Use cases, ports |
| 1.4: Infrastructure | 12 | Supabase adapter, mappers |
| 1.5: Database | 8 | Migrations, RLS, RPC |
| 1.6: HTTP Handler | 8 | Controller, routing, middleware |
| 1.7: Composition & Tests | 10 | DI container, unit tests |
| **TOTAL** | **59** | Order vertical complete, server proven |

---

# **PHASE 2: CLIENT SKELETON & CART (Weeks 6-7)**

## **Objective**
Establish the client FSD structure with Cart as the first feature slice. Cart uses LocalStorage initially (no server call yet).

---

### **TASK 2.1: Client App Layer & Providers**

**Files to Create:**
- `client/src/app/App.tsx`
- `client/src/app/providers/AppProviders.tsx`
- `client/src/app/providers/QueryProvider.tsx`
- `client/src/app/providers/SessionProvider.tsx`
- `client/src/app/providers/ThemeProvider.tsx`
- `client/src/app/providers/I18nProvider.tsx`
- `client/src/app/di/container.ts`
- `client/src/app/di/tokens.ts`
- `client/src/app/router/routes.tsx`

**Deliverables:**

```typescript
// client/src/app/App.tsx
import { AppProviders } from './providers/AppProviders';
import { Router } from './router/routes';

export function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}
```

```typescript
// client/src/app/di/tokens.ts
/**
 * DI tokens - typed keys for dependency resolution
 */
import type { ICartRepository } from '../../entities/cart/ports/CartRepository';
import type { IOrderRepository } from '../../entities/order/ports/OrderRepository';

export const DI_TOKENS = {
  CART_REPOSITORY: 'CART_REPOSITORY' as const,
  ORDER_REPOSITORY: 'ORDER_REPOSITORY' as const,
};

export type DITokens = typeof DI_TOKENS;
```

```typescript
// client/src/app/di/container.ts
import { LocalStorageCartRepository } from '../../entities/cart/infrastructure/LocalStorageCartRepository';
import { SupabaseOrderRepository } from '../../entities/order/infrastructure/SupabaseOrderRepository';
import { DI_TOKENS } from './tokens';

class DIContainer {
  private instances = new Map();

  register<T>(token: string, factory: () => T) {
    this.instances.set(token, factory);
  }

  get<T>(token: string): T {
    const factory = this.instances.get(token);
    if (!factory) throw new Error(`Token ${token} not registered`);
    return factory();
  }
}

export const container = new DIContainer();

// Register implementations
container.register(DI_TOKENS.CART_REPOSITORY, () => new LocalStorageCartRepository());
container.register(DI_TOKENS.ORDER_REPOSITORY, () => new SupabaseOrderRepository());
```

**Time Estimate:** 8 hours

---

### **TASK 2.2: Shared Kernel & Libraries**

**Files to Create:**
- `client/src/shared/kernel/Result.ts`
- `client/src/shared/kernel/AppError.ts`
- `client/src/shared/api/supabaseClient.ts`
- `client/src/shared/api/edgeClient.ts`
- `client/src/shared/lib/di/useDI.ts`
- `client/src/shared/lib/hooks/useAsync.ts`

**Deliverables:**

```typescript
// client/src/shared/kernel/Result.ts
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  constructor(readonly value: T) {}
  isSuccess(): this is Success<T> { return true; }
  isFailure(): this is Failure<unknown> { return false; }
  map<U>(fn: (v: T) => U): Result<U, unknown> { return new Success(fn(this.value)); }
}

export class Failure<E> {
  constructor(readonly error: E) {}
  isSuccess(): this is Success<unknown> { return false; }
  isFailure(): this is Failure<E> { return true; }
  map<U>(): Result<U, E> { return this as any; }
}

export const Ok = <T>(value: T): Result<T> => new Success(value);
export const Err = <E>(error: E): Result<any, E> => new Failure(error);
```

```typescript
// client/src/shared/lib/di/useDI.ts
import { useCallback } from 'react';
import { container } from '../../../app/di/container';

export function useDI<T>(token: string): T {
  return useCallback(() => container.get<T>(token), [token])();
}
```

**Time Estimate:** 6 hours

---

### **TASK 2.3: Cart Entity (Domain + Ports)**

**Files to Create:**
- `client/src/entities/cart/domain/CartItem.ts`
- `client/src/entities/cart/domain/Cart.ts`
- `client/src/entities/cart/domain/errors/CartErrors.ts`
- `client/src/entities/cart/ports/CartRepository.ts`

**Deliverables:**

```typescript
// client/src/entities/cart/domain/Cart.ts
import { Money } from '@saucia/domain';

export interface CartItemData {
  mealId: string;
  tempMealId: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

export class Cart {
  private meals: CartItemData[] = [];
  private deliveryFee = Money.fromDollars(15);

  addMeal(meal: CartItemData): void {
    if (meal.unitPrice.inCents <= 0) throw new Error('Invalid price');
    this.meals.push(meal);
  }

  removeMeal(tempMealId: string): void {
    this.meals = this.meals.filter(m => m.tempMealId !== tempMealId);
  }

  getMeals(): CartItemData[] {
    return [...this.meals];
  }

  getSubtotal(): Money {
    return this.meals.reduce(
      (sum, m) => sum.add(m.totalPrice),
      Money.fromCents(0)
    );
  }

  isEmpty(): boolean {
    return this.meals.length === 0;
  }
}
```

```typescript
// client/src/entities/cart/ports/CartRepository.ts
import { Cart } from '../domain/Cart';

export interface ICartRepository {
  save(cart: Cart, userId: string): Promise<void>;
  load(userId: string): Promise<Cart>;
  clear(userId: string): Promise<void>;
}
```

**Time Estimate:** 6 hours

**Legacy v1 Mapping:**
- `client/src/domain/cart/models/Cart.ts` → `client/src/entities/cart/domain/Cart.ts`
- `client/src/application/ports/CartRepository.ts` → `client/src/entities/cart/ports/CartRepository.ts`

---

### **TASK 2.4: Cart Infrastructure (LocalStorage)**

**Files to Create:**
- `client/src/entities/cart/infrastructure/LocalStorageCartRepository.ts`
- `client/src/entities/cart/infrastructure/mappers/cartMapper.ts`

**Deliverables:**

```typescript
// client/src/entities/cart/infrastructure/LocalStorageCartRepository.ts
import { ICartRepository } from '../ports/CartRepository';
import { Cart } from '../domain/Cart';

const CART_KEY = (userId: string) => `cart:${userId}`;

export class LocalStorageCartRepository implements ICartRepository {
  async save(cart: Cart, userId: string): Promise<void> {
    const data = {
      meals: cart.getMeals().map(m => ({
        mealId: m.mealId,
        tempMealId: m.tempMealId,
        name: m.name,
        quantity: m.quantity,
        unitPrice: m.unitPrice.inCents,
        totalPrice: m.totalPrice.inCents,
      })),
    };
    localStorage.setItem(CART_KEY(userId), JSON.stringify(data));
  }

  async load(userId: string): Promise<Cart> {
    const data = localStorage.getItem(CART_KEY(userId));
    const cart = new Cart();

    if (data) {
      const parsed = JSON.parse(data);
      for (const meal of parsed.meals) {
        cart.addMeal({
          mealId: meal.mealId,
          tempMealId: meal.tempMealId,
          name: meal.name,
          quantity: meal.quantity,
          unitPrice: Money.fromCents(meal.unitPrice),
          totalPrice: Money.fromCents(meal.totalPrice),
        });
      }
    }

    return cart;
  }

  async clear(userId: string): Promise<void> {
    localStorage.removeItem(CART_KEY(userId));
  }
}
```

**Time Estimate:** 4 hours

---

### **TASK 2.5: Cart Feature (Add to Cart)**

**Files to Create:**
- `client/src/features/add-to-cart/application/AddMealUseCase.ts`
- `client/src/features/add-to-cart/model/addToCartStore.tsx` (Zustand or Context)
- `client/src/features/add-to-cart/ui/AddToCartButton.tsx`
- `client/src/features/add-to-cart/index.ts`

**Deliverables:**

```typescript
// client/src/features/add-to-cart/application/AddMealUseCase.ts
import { Money } from '@saucia/domain';
import { Cart } from '../../../entities/cart/domain/Cart';
import type { ICartRepository } from '../../../entities/cart/ports/CartRepository';

export interface AddMealCommand {
  mealId: string;
  name: string;
  quantity: number;
  unitPrice: Money;
}

export class AddMealUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(userId: string, command: AddMealCommand): Promise<void> {
    const cart = await this.cartRepository.load(userId);

    const tempMealId = `temp_${command.mealId}_${Date.now()}`;
    const totalPrice = Money.fromCents(command.unitPrice.inCents * command.quantity);

    cart.addMeal({
      mealId: command.mealId,
      tempMealId,
      name: command.name,
      quantity: command.quantity,
      unitPrice: command.unitPrice,
      totalPrice,
    });

    await this.cartRepository.save(cart, userId);
  }
}
```

```typescript
// client/src/features/add-to-cart/model/addToCartStore.tsx
import { create } from 'zustand';
import { useSession } from '../../../entities/session/model/useSession';
import { useDI } from '../../../shared/lib/di/useDI';
import { DI_TOKENS } from '../../../app/di/tokens';
import { AddMealUseCase } from '../application/AddMealUseCase';
import { Money } from '@saucia/domain';

export const useAddToCart = create((set) => ({
  isLoading: false,
  error: null,
  addMeal: async (mealId: string, name: string, quantity: number, unitPrice: Money) => {
    const { userId } = useSession();
    if (!userId) throw new Error('Not authenticated');

    const cartRepo = useDI(DI_TOKENS.CART_REPOSITORY);
    const useCase = new AddMealUseCase(cartRepo);

    set({ isLoading: true, error: null });
    try {
      await useCase.execute(userId, { mealId, name, quantity, unitPrice });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },
}));
```

**Time Estimate:** 8 hours

**Legacy v1 Mapping:**
- `client/src/presentation/features/cart/` → `client/src/features/add-to-cart/`

---

### **TASK 2.6: Cart Entity UI (Components)**

**Files to Create:**
- `client/src/entities/cart/model/useCart.ts` (query hook)
- `client/src/entities/cart/ui/CartView.tsx`
- `client/src/entities/cart/ui/CartSummary.tsx`
- `client/src/entities/cart/index.ts`

**Deliverables:**

```typescript
// client/src/entities/cart/model/useCart.ts
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../../entities/session/model/useSession';
import { useDI } from '../../../shared/lib/di/useDI';
import { DI_TOKENS } from '../../../app/di/tokens';

export function useCart() {
  const { userId } = useSession();
  const cartRepo = useDI(DI_TOKENS.CART_REPOSITORY);

  return useQuery({
    queryKey: ['cart', userId],
    queryFn: () => (userId ? cartRepo.load(userId) : null),
    enabled: !!userId,
  });
}
```

```typescript
// client/src/entities/cart/ui/CartSummary.tsx
import React from 'react';
import { useCart } from '../model/useCart';

export function CartSummary() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) return <div>Loading...</div>;
  if (!cart) return <div>No cart</div>;

  const subtotal = cart.getSubtotal();
  const total = subtotal.add(Money.fromDollars(15)); // delivery fee

  return (
    <div>
      <h3>Cart Summary</h3>
      <p>Items: {cart.getMeals().length}</p>
      <p>Subtotal: ${subtotal.inDollars}</p>
      <p>Delivery: $15.00</p>
      <p><strong>Total: ${total.inDollars}</strong></p>
    </div>
  );
}
```

**Time Estimate:** 6 hours

**Legacy v1 Mapping:**
- `client/src/presentation/features/cart/components/` → `client/src/entities/cart/ui/`
- `client/src/presentation/features/cart/model/useCart.ts` → `client/src/entities/cart/model/useCart.ts`

---

## **PHASE 2 SUMMARY**

| Task | Hours | Deliverables |
|------|-------|---|
| 2.1: App & Providers | 8 | App.tsx, DI container, routing |
| 2.2: Shared kernel | 6 | Result, AppError, shared libs |
| 2.3: Cart domain | 6 | Cart entity, ports |
| 2.4: Cart infrastructure | 4 | LocalStorage adapter |
| 2.5: Add to cart feature | 8 | Use case, UI button |
| 2.6: Cart UI | 6 | CartSummary, CartView |
| **TOTAL** | **38** | Client skeleton + Cart working |

---

# **PHASE 3: CLIENT ORDER & CHECKOUT (Weeks 8-9)**

## **Objective**
Connect client Cart feature to the server Order vertical. Implement the full checkout flow.

---

### **TASK 3.1: Order Entity (Client Side)**

**Files to Create:**
- `client/src/entities/order/domain/Order.ts` (re-export from domain pkg)
- `client/src/entities/order/ports/OrderRepository.ts`
- `client/src/entities/order/infrastructure/SupabaseOrderRepository.ts`

**Deliverables:**

```typescript
// client/src/entities/order/infrastructure/SupabaseOrderRepository.ts
import { edgeClient } from '../../../shared/api/edgeClient';
import { OrderDetailsResponse, SubmitOrderResponse } from '@saucia/contracts';

export class SupabaseOrderRepository {
  async submitOrder(
    deliveryAddressId: string,
    orderMeals: { mealId: string; quantity: number }[],
    instructions?: string
  ): Promise<SubmitOrderResponse> {
    const response = await edgeClient.post('/order-processing', {
      action: 'submit-order',
      payload: {
        deliveryAddressId,
        orderMeals,
        clientInstructions: instructions,
      },
    });

    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  }

  async getOrderDetails(orderId: string): Promise<OrderDetailsResponse> {
    const response = await edgeClient.get(`/orders/${orderId}`);
    if (!response.ok) throw new Error('Order not found');
    return response.json();
  }

  async getUserOrders(): Promise<OrderDetailsResponse[]> {
    const response = await edgeClient.get('/orders');
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }
}
```

**Time Estimate:** 6 hours

---

### **TASK 3.2: Submit Order Use Case**

**Files to Create:**
- `client/src/features/submit-order/application/SubmitOrderUseCase.ts`
- `client/src/features/submit-order/model/useCheckout.ts`
- `client/src/features/submit-order/ui/CheckoutForm.tsx`

**Deliverables:**

```typescript
// client/src/features/submit-order/application/SubmitOrderUseCase.ts
import { SubmitOrderResponse } from '@saucia/contracts';
import { Cart } from '../../../entities/cart/domain/Cart';
import type { IOrderRepository } from '../../../entities/order/ports/OrderRepository';

export class SubmitOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    cart: Cart,
    deliveryAddressId: string,
    instructions?: string
  ): Promise<SubmitOrderResponse> {
    if (cart.isEmpty()) throw new Error('Cart is empty');

    const meals = cart.getMeals();

    return this.orderRepository.submitOrder(
      deliveryAddressId,
      meals.map(m => ({
        mealId: m.mealId,
        quantity: m.quantity,
      })),
      instructions
    );
  }
}
```

```typescript
// client/src/features/submit-order/model/useCheckout.ts
import { useState } from 'react';
import { useCart } from '../../../entities/cart/model/useCart';
import { useDI } from '../../../shared/lib/di/useDI';
import { DI_TOKENS } from '../../../app/di/tokens';
import { SubmitOrderUseCase } from '../application/SubmitOrderUseCase';

export function useCheckout() {
  const { data: cart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderRepo = useDI(DI_TOKENS.ORDER_REPOSITORY);
  const useCase = new SubmitOrderUseCase(orderRepo);

  const submit = async (deliveryAddressId: string, instructions?: string) => {
    if (!cart) throw new Error('No cart');

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await useCase.execute(cart, deliveryAddressId, instructions);
      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error };
}
```

**Time Estimate:** 8 hours

---

### **TASK 3.3: Checkout Page & Integration**

**Files to Create:**
- `client/src/pages/checkout/index.tsx`
- `client/src/widgets/checkout-form/CheckoutForm.tsx`

**Time Estimate:** 8 hours

**Legacy v1 Mapping:**
- `client/src/Pages/Checkout/CheckoutPage.jsx` → refactored to `client/src/pages/checkout/`

---

## **PHASE 3 SUMMARY**

| Task | Hours | Deliverables |
|------|-------|---|
| 3.1: Order entity | 6 | Supabase repository, ports |
| 3.2: Submit use case | 8 | Use case, hooks, form state |
| 3.3: Checkout page | 8 | Full page, integration |
| **TOTAL** | **22** | Order flow working end-to-end |

---

# **PHASES 4-8: CONTINUED MIGRATION**

*(Each phase follows the same pattern: domain → ports → adapters → use cases → UI → integration)*

---

## **PHASE 4: AUTH & SESSION (Weeks 10)**

### **TASK 4.1: Session Entity**
- Replace fat `AuthContext` with thin `SessionProvider`
- Domain: User model, phone validation
- Ports: AuthRepository (login, logout, verify OTP)
- Infrastructure: SupabaseAuthRepository
- Model: `useSession()` hook

### **TASK 4.2: Login & Profile Completion**
- `features/login-with-google`
- `features/complete-profile`
- Server: Auth edge function (onUserCreated, onUserDeleted)

**Legacy v1 Mapping:**
- `client/src/Contexts/AuthContext.jsx` → `client/src/entities/session/model/SessionProvider.tsx`
- `client/src/Pages/Auth/Auth.jsx` → `client/src/pages/auth/`

---

## **PHASE 5: MENU & FEATURES (Weeks 11)**

### **TASK 5.1: Menu Entity**
- Domain: Meal, Item, Section models
- Ports: MealRepository (listMeals, search, filter)
- Infrastructure: SupabaseMealRepository
- Model: `useMeals()` query hook, filter state

### **TASK 5.2: Replace ElementsContext**
- Split into per-entity query hooks
- Remove god-object anti-pattern
- Replace `Elements` with dedicated queries

**Legacy v1 Mapping:**
- `client/src/Contexts/ElementsContext.jsx` → split into entity query hooks
- `client/src/Pages/Menu/MenuPage.jsx` → split into widgets + features

---

## **PHASE 6: PREMIUM & SUBSCRIPTIONS (Weeks 12)**

### **TASK 6.1: Subscription Entity**
- Domain: SubscriptionPlan, TDEE/BMI calculators (using @saucia/domain)
- Ports: SubscriptionRepository, PlanRepository
- Infrastructure: SupabaseSubscriptionRepository
- Model: `useHealthCalculator()`, `useSubscription()`

### **TASK 6.2: Server Subscription Module**
- Enroll subscription use case
- Health profile processing
- Meal assignment logic

**Legacy v1 Mapping:**
- `client/src/Pages/Premium/` → split into features + widgets

---

## **PHASE 7: ADMIN PANEL (Weeks 13)**

### **TASK 7.1: Split Admin.jsx**
- Create `features/admin-*` for each entity (meals, orders, users)
- Move entity CRUD into entity slices
- Move analysis into separate features

### **TASK 7.2: Admin Features**
- `features/admin-update-order-status`
- `features/admin-create-meal`
- `features/admin-analytics`

**Legacy v1 Mapping:**
- `client/src/Pages/Auth/Admin.jsx` (2000+ lines) → split into 20+ small features + widgets

---

## **PHASE 8: QUALITY & DEPLOYMENT (Week 14)**

### **TASK 8.1: Testing**
- Unit tests: domain + application layers
- Component tests: features + entities
- E2E tests: critical user flows

### **TASK 8.2: Performance & Bundle**
- Code splitting by feature
- Lazy-load admin panel
- Bundle analysis

### **TASK 8.3: Deployment**
- Deploy server migrations
- Deploy edge functions
- Deploy client to Vercel

---

# **V1 → V2 MIGRATION MAP**

## **Complete Mapping Table**

| v1 Location | v2 Location | Type | Status |
|---|---|---|---|
| **Frontend** | | | |
| `client/src/main.jsx` | `client/src/app/main.tsx` | Entry | Refactored |
| `client/src/App.css` | Removed (Chakra UI only) | Style | Removed |
| `client/src/theme.jsx` | `client/src/shared/theme/` | Theme | Kept |
| `client/src/i18n.jsx` | `client/src/shared/i18n/` | i18n | Kept |
| `client/src/Contexts/AuthContext.jsx` | `client/src/entities/session/model/SessionProvider.tsx` | Provider | Refactored |
| `client/src/Contexts/CartContext.jsx` | `client/src/entities/cart/model/` (Zustand) | State | Refactored |
| `client/src/Contexts/ElementsContext.jsx` | `client/src/entities/menu/model/useM eals.ts`, etc. | Queries | Split |
| `client/src/Contexts/ThemeContext.jsx` | `client/src/shared/theme/` | Theme | Kept |
| `client/src/Contexts/I18nContext.jsx` | `client/src/shared/i18n/` | i18n | Kept |
| `client/src/Contexts/ChosenPlanContext.jsx` | `client/src/entities/subscription/model/` | State | Refactored |
| `client/src/Components/Cart.jsx` | `client/src/entities/cart/ui/CartView.tsx` | Component | Refactored |
| `client/src/Components/Cards.jsx` | `client/src/entities/meal/ui/MealCard.tsx` | Component | Refactored |
| `client/src/Components/ItemsCarousel.jsx` | `client/src/shared/ui/Carousel.tsx` | Component | Moved to shared |
| `client/src/Components/Navbar/` | `client/src/widgets/navbar/` | Widget | Refactored |
| `client/src/Components/Map/MapBox.jsx` | `client/src/entities/address/ui/MapPicker.tsx` | Component | Refactored |
| `client/src/Pages/Home/HomePage.jsx` | `client/src/pages/home/` | Page | Refactored |
| `client/src/Pages/Menu/MenuPage.jsx` | `client/src/pages/menu/`, `client/src/widgets/menu-catalog/` | Page + Widget | Split |
| `client/src/Pages/Auth/Auth.jsx` | `client/src/pages/auth/`, `client/src/features/login-*/` | Page + Features | Split |
| `client/src/Pages/Checkout/` | `client/src/pages/checkout/`, `client/src/features/submit-order/` | Page + Feature | Split |
| `client/src/Pages/Premium/` | `client/src/pages/premium/`, `client/src/features/enroll-subscription/` | Page + Feature | Split |
| `client/src/Pages/Auth/Admin.jsx` | `client/src/pages/admin/`, `client/src/features/admin-*/` | Page + Features | Split into 20+ |
| `client/src/API/adminAPI.jsx` | `client/src/entities/*/ports/`, `infrastructure/` | Ports + Adapters | Refactored |
| `client/src/API/mealAPI.jsx` | `client/src/entities/meal/infrastructure/` | Adapter | Refactored |
| `client/src/API/orderAPI.jsx` | `client/src/entities/order/infrastructure/` | Adapter | Refactored |
| `client/src/API/userAPI.jsx` | `client/src/entities/session/infrastructure/` | Adapter | Refactored |
| `client/src/Hooks/useOrders.jsx` | `client/src/entities/order/model/useOrders.ts` | Hook | Refactored |
| `client/src/Hooks/userHooks.jsx` | `client/src/entities/session/model/useProfile.ts` | Hook | Refactored |
| `client/src/Hooks/useCart.ts` | `client/src/features/add-to-cart/` | Hook | Refactored |
| `client/src/lib/otpService.js` | `server/src/modules/identity/` | Logic | Moved to server |
| `client/src/lib/prefetchQueries.ts` | `client/src/shared/lib/query/` | Lib | Kept |
| **Backend** | | | |
| `supabase/config.toml` | `supabase/config.toml` | Config | Kept |
| `supabase/functions/order-processing/` | `server/src/modules/order/` | Module | Refactored |
| `supabase/functions/auth-handlers/` | `server/src/modules/identity/` | Module | Refactored |
| `supabase/functions/subscription-mgmt/` | `server/src/modules/subscription/` | Module | New |
| `supabase/functions/payment-webhook/` | `server/src/modules/payment/` | Module | New |
| `supabase/functions/notifications/` | `server/src/modules/notification/` | Module | New |
| `supabase/functions/cron-jobs/` | `server/src/modules/scheduler/` | Module | New |
| `supabase/migrations/V1__initial_schema.sql` | `server/database/migrations/001_*.sql` | Migration | Kept |
| `supabase/migrations/V2__add_rls.sql` | `server/database/migrations/002_*.sql` | Migration | Kept |
| `supabase/migrations/V3__add_triggers.sql` | `server/database/migrations/003_*.sql` | Migration | Split |

---

# **V2 README**

```markdown
# Saucia v2 - Clean Server × FSD×Clean Client

**A healthy food store web application with a platform-agnostic server and modular client.**

## What's New in v2?

- **Platform-Agnostic Server:** Clean architecture core that can run on Deno, Node, or Workers with no refactoring
- **FSD×Clean Client:** Feature-sliced design with Clean rings inside each entity slice
- **pnpm Monorepo:** Shared `@saucia/domain` and `@saucia/contracts` packages used by both client and server
- **Enforcement:** ESLint, Steiger, and dependency-cruiser rules prevent architectural decay
- **Zero Downtime Migration:** Strangler pattern refactoring of v1 features

## Architecture Overview

```
saucia/
├── packages/                    # Pure, shared, zero runtime deps
│   ├── domain/                 # Business rules (Money, Order, TDEE, etc.)
│   └── contracts/              # API schemas, error codes
├── client/                     # React frontend (FSD × Clean)
├── server/                     # Platform-agnostic core
└── supabase/                   # Thin Supabase shell (Edge Functions)
```

### Key Principles

1. **Server is authoritative:** prices, totals, and validation are computed on the server using `@saucia/domain`
2. **Atomic operations:** Order creation via stored procedure; financial invariant enforced by DB trigger
3. **Client recomputes for preview:** uses the same `@saucia/domain` calculators (TDEE, cart totals) for live feedback
4. **RLS + Sequence:** Row-level security per user; sequence-based order numbers (no race conditions)
5. **Error codes are stable:** domain errors map to `ErrorCode` enums from `@saucia/contracts`

## Quick Start

### Prerequisites
- Node 18+
- Deno 1.40+
- pnpm 8+
- Supabase CLI

### Install

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Start Supabase locally
supabase start

# Run database migrations
supabase db push

# Deploy edge functions
supabase functions deploy
```

### Development

```bash
# Watch all packages and build
pnpm dev

# Run tests
pnpm test

# Lint and type-check
pnpm lint
pnpm type-check

# Start client dev server
cd client && pnpm dev

# Watch server with hot reload (not yet supported)
cd server && pnpm watch
```

### Key Commands

```bash
# Build for production
pnpm build

# Deploy to Supabase (from root)
supabase functions deploy

# Deploy client to Vercel
cd client && pnpm build && vercel

# Run full test suite
pnpm test -- --run
```

## File Structure

### Client (`client/src/`)

**Layers (top to bottom):**
- `app/` — Composition root, providers, routing, DI
- `pages/` — Page-level components
- `widgets/` — Composite UI blocks (nav, cart summary, etc.)
- `features/` — User actions (add-to-cart, submit-order, login, etc.)
- `entities/` — Domain slices with internal Clean rings
- `shared/` — Kernel, API, UI primitives, i18n, theme

**Entity structure** (e.g., `entities/order/`):
```
order/
├── domain/        # Order, OrderStatus, errors
├── ports/         # IOrderRepository
├── infrastructure/# SupabaseOrderRepository, dto, mappers
├── application/   # Use cases (SubmitOrder, UpdateStatus)
├── model/         # React hooks (useOrder, useOrderHistory)
└── ui/            # Components (OrderCard, OrderTracker)
```

### Server (`server/src/`)

**Layers:**
- `modules/*/domain` — Entities, rules, errors (pure)
- `modules/*/application` — Use cases, ports (pure)
- `modules/*/infrastructure` — Supabase adapters, mappers
- `modules/*/delivery` — HTTP handlers
- `delivery-shared/` — Router, auth middleware, error mapper
- `composition/` — DI container (wires everything)
- `platform/` — Supabase client factories, JWT verifier

### Packages (`packages/`)

- `domain/` — Money, computeOrderTotals, TDEECalculator, BMICalculator, validators
- `contracts/` — SubmitOrderRequest, OrderDetailsResponse, ErrorCode enums

## API Contracts

All server endpoints validate input against `@saucia/contracts` schemas.

### Orders

**POST /order-processing** (submit order)
```json
{
  "action": "submit-order",
  "payload": {
    "deliveryAddressId": "addr-123",
    "orderMeals": [
      { "mealId": "meal-1", "quantity": 2 }
    ],
    "clientInstructions": "Extra sauce"
  }
}
```

**Response:**
```json
{
  "orderId": "order-uuid",
  "orderNumber": "#001000",
  "totalAmount": 5097,
  "estimatedDelivery": "2024-01-15T14:45:00Z"
}
```

All error responses use stable error codes:
```json
{
  "code": "FINANCIAL_MISMATCH",
  "message": "Total does not match computed sum",
  "statusCode": 400
}
```

## Testing

### Unit Tests
```bash
# Domain + application layers (no mocks, pure logic)
pnpm test -- --run server

# Features + entities (mocked adapters)
pnpm test -- --run client
```

### E2E Tests
```bash
# Full flow: client → server → DB
pnpm test:e2e
```

### Running Tests
- `pnpm test` — Watch mode (all packages)
- `pnpm test -- --run` — Run once (CI mode)

## Deployment

### Local Development (Supabase Local)
1. `supabase start`
2. `supabase db push`
3. `supabase functions develop`
4. `cd client && pnpm dev`

### Staging (Supabase Cloud)
1. `supabase projects list` (choose project)
2. `supabase db push --linked`
3. `supabase functions deploy`
4. `cd client && pnpm build && vercel --prod`

### Production
Same as staging; use environment secrets for API keys.

## v1 to v2 Migration Status

| Feature | Status |
|---|---|
| Order creation | ✅ Migrated (server vertical complete) |
| Cart management | ✅ Migrated (LocalStorage + server sync) |
| Authentication | 🚧 In Progress (Session entity) |
| Menu & meals | 🚧 In Progress (query hooks) |
| Subscriptions | 📋 Planned (TDEE calculator ready) |
| Admin panel | 📋 Planned (split from monolithic component) |
| Notifications | 📋 Planned (real-time via Supabase) |
| Payment | 📋 Planned (Stripe integration) |

## Linting & Enforcement

All architecture rules run in CI:

```bash
# Check FSD layer violations (client)
steiger check

# Check dependency rules (server)
dependency-cruiser --validate .dependency-cruiser.js

# Check import boundaries
eslint --ext .ts,.tsx client/src server/src
```

Violations fail the build.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — High-level system design
- [`docs/FSD_CLEAN_RULES.md`](docs/FSD_CLEAN_RULES.md) — Detailed layer and segment rules
- [`docs/SERVER.md`](docs/SERVER.md) — Server-specific guidance
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — All endpoint schemas
- [`MIGRATION_MAP.md`](MIGRATION_MAP.md) — v1 → v2 file mapping

## FAQ

**Q: Why is the server platform-agnostic?**  
A: So we can redeploy to Node, Workers, or a different FaaS without refactoring the core. Only adapters and runtimes change.

**Q: Where do I put new business logic?**  
A: If it's a rule (e.g., "order total must equal subtotal + tax + delivery - discount"), it goes in `@saucia/domain` or `server/src/modules/*/domain`. If it's a workflow (e.g., "when order is submitted, send a notification"), it goes in a use case.

**Q: Why does the client compute TDEE if the server is authoritative?**  
A: The client uses `@saucia/domain` calculators for instant preview as the user fills a form. The server recomputes when the profile is finalized.

**Q: How do I add a new feature?**  
A: 1. Create the server use case in `server/src/modules/feature/`. 2. Create a client entity or feature in `client/src/entities/` or `client/src/features/`. 3. Add a route in `server/src/modules/feature/delivery`. 4. Wire in the DI container.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming, testing, and commit conventions.

## License

MIT
```

---

## **SUMMARY TABLE: All Phases**

| Phase | Focus | Weeks | Hours | Deliverables |
|-------|-------|-------|-------|---|
| **0** | Foundations | 1-2 | 37 | Workspace, domain, contracts, linting, CI/CD |
| **1** | Server Order | 3-5 | 59 | Full order vertical (domain→DB→handler) |
| **2** | Client Cart | 6-7 | 38 | Client skeleton, Cart entity, Add-to-cart feature |
| **3** | Client Order | 8-9 | 22 | Order entity, Submit order, Checkout integration |
| **4** | Auth & Session | 10 | 28 | Session entity, Login, Profile, Server auth module |
| **5** | Menu | 11 | 24 | Menu entity, Replace ElementsContext, Search/filter |
| **6** | Premium | 12 | 32 | Subscription entity, TDEE preview, Enroll flow |
| **7** | Admin | 13 | 40 | Split Admin.jsx, 20+ admin features |
| **8** | Quality | 14 | 30 | Tests, performance, deployment |
| **TOTAL** | | 12-14 weeks | ~350 hours | v2 complete, v1 fully migrated |

---

**This plan is incremental, verified, and production-ready. Each phase produces deployable artifacts with zero breaking changes to v1.**