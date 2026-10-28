import {
  Money,
  canTransition,
  computeOrderTotals,
  validateOrderTotals,
  type OrderStatus,
  type OrderTotals,
} from '@saucia/domain';
import { DomainError, Err, Ok, type Result } from '../../../kernel';

export type OrderErrorCode =
  | 'EMPTY_ORDER'
  | 'INVALID_QUANTITY'
  | 'INVALID_TOTALS'
  | 'INVALID_TRANSITION';

export type OrderResult<T> = Result<T, DomainError<OrderErrorCode>>;

const INITIAL_STATUS: OrderStatus = 'pending';

export interface OrderLine {
  readonly mealId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
}

export interface CreateOrderProps {
  readonly id: string;
  readonly customerId: string;
  readonly lines: readonly OrderLine[];
  readonly taxAmount: Money;
  readonly deliveryFee: Money;
  readonly discountAmount: Money;
}

export interface PersistedOrderProps {
  readonly id: string;
  readonly customerId: string;
  readonly lines: readonly OrderLine[];
  readonly totals: OrderTotals;
  readonly status: OrderStatus;
}

export class Order {
  private constructor(
    readonly id: string,
    readonly customerId: string,
    readonly lines: readonly OrderLine[],
    readonly totals: OrderTotals,
    private currentStatus: OrderStatus,
  ) {}

  /** Place a new order. Totals are computed once and kept as a snapshot. */
  static create(props: CreateOrderProps): OrderResult<Order> {
    if (props.lines.length === 0) {
      return fail('EMPTY_ORDER', 'Order must contain at least one line');
    }

    for (const line of props.lines) {
      if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
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