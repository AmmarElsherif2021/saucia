import type { Money } from 'packages/domain/src/money/Money';
import { DomainError, Err, Ok, type Result } from '../../../kernel';

export interface Item{
     readonly id: string;
     readonly unitPrice: Money;
     readonly maxFreeUnits: number; // For DIY meals
     readonly storageUnits: number; // Inventory system could be added in future
     // rest od old db props
}

// Errors
export type ItemErrorCode =
  | 'PRICE_ZERO'
  | 'INVALID_STORAGE_QUANTITY';
export type MealErrorCode='PRICE_ZERO'| 'NO_ITEMS';

//Creating items/orders results:
export type CreateItemResult<T> = Result<T, DomainError<ItemErrorCode>>;
export type CreatingMealResult<T> = Result<T, DomainError<MealErrorCode>>;

// create item and meal props:
export interface CreateItemProps {
     readonly id: string;
     readonly unitPrice: Money;
     readonly maxFreeUnits: number; // For DIY meals
     readonly storageUnits: number; 
}
export interface CreateMealProps {
  readonly id: string;
  readonly items: readonly Item[];
  readonly mealPrice: Money;
  // rest of old db props
}

export interface PersistedMealProps {
  readonly id: string;
  readonly items: Item[];
  readonly mealPrice: Money;
  // rest of db props
}

export class Meal {
  private constructor(
    readonly id: string,
    readonly items: readonly Item[],
    readonly mealPrice: Money
  ) {}

  /** Place a new order. Totals are computed once and kept as a snapshot. */
  static create(props: CreateMealProps): CreatingMealResult<Meal> {
    if (props.mealPrice.isZero() === true) {
      return fail('EMPTY_ORDER', 'Order must contain at least one line');
    }

    for (const item of props.items) {
      if (!Number.isSafeInteger(item.storageUnits) || item.storageUnits <= 0) {
        return fail(
          'INVALID_QUANTITY',
          `Quantity for meal ${line.mealId} must be a positive integer`,
        );
      }
    }

    try {
      const totals = computeOrderTotals(
        sumLines(props.lines),
        props.taxAmount,
        props.deliveryFee,
        props.discountAmount,
      );
      return Ok(
        new Order(props.id, props.customerId, props.lines, totals, INITIAL_STATUS),
      );
    } catch (error) {
      // Shared rules throw RangeError (negative amount, discount above balance).
      // The domain converts it, so callers never need try/catch.
      return fail('INVALID_TOTALS', errorMessage(error));
    }
  }

  /** Rebuild from storage. The stored snapshot is checked, not trusted. */
  static reconstitute(props: PersistedOrderProps): OrderResult<Order> {
    const check = validateOrderTotals(props.totals);
    if (!check.isValid) {
      return fail('INVALID_TOTALS', check.error ?? 'Invalid stored totals');
    }

    if (!sumLines(props.lines).equals(props.totals.subtotal)) {
      return fail(
        'INVALID_TOTALS',
        'Stored subtotal does not match the order lines',
      );
    }

    return Ok(
      new Order(props.id, props.customerId, props.lines, props.totals, props.status),
    );
  }

  get status(): OrderStatus {
    return this.currentStatus;
  }

  get totalAmount(): Money {
    return this.totals.totalAmount;
  }

  get itemCount(): number {
    return this.lines.reduce((count, line) => count + line.quantity, 0);
  }

  updateStatus(next: OrderStatus): OrderResult<void> {
    if (!canTransition(this.currentStatus, next)) {
      return fail(
        'INVALID_TRANSITION',
        `Cannot transition order from ${this.currentStatus} to ${next}`,
      );
    }
    this.currentStatus = next;
    return Ok(undefined);
  }
}

function fail(code: OrderErrorCode, internalMessage: string): OrderResult<never> {
  return Err(new DomainError(code, internalMessage));
}

function sumLines(lines: readonly OrderLine[]): Money {
  return lines.reduce(
    (sum, line) => sum.add(line.unitPrice.multiply(line.quantity)),
    Money.zero(),
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid order totals';
}