import { Money } from '../money/Money';

/** The financial components of an order, all in the same currency. */
export interface OrderTotals {
  readonly subtotal: Money;
  readonly taxAmount: Money;
  readonly deliveryFee: Money;
  readonly discountAmount: Money;
  readonly totalAmount: Money;
}

function assertNonNegative(label: string, amount: Money): void {
  if (amount.isNegative()) {
    throw new RangeError(`${label} must not be negative`);
  }
}

/**
 * Compute the order total from its components.
 *
 * Invariant: totalAmount = subtotal + tax + delivery - discount.
 * `Money.subtract` throws when the discount exceeds the balance, which keeps
 * an invalid total from being persisted.
 */
export function computeOrderTotals(
  subtotal: Money,
  taxAmount: Money,
  deliveryFee: Money,
  discountAmount: Money,
): OrderTotals {
  assertNonNegative('subtotal', subtotal);
  assertNonNegative('taxAmount', taxAmount);
  assertNonNegative('deliveryFee', deliveryFee);
  assertNonNegative('discountAmount', discountAmount);

  const totalAmount = subtotal
    .add(taxAmount)
    .add(deliveryFee)
    .subtract(discountAmount);

  return { subtotal, taxAmount, deliveryFee, discountAmount, totalAmount };
}

/**
 * Check a persisted or received totals snapshot against the invariant.
 *
 * Returns a result instead of throwing so callers can map a malformed payload
 * to a contract error without a try/catch.
 */
export function validateOrderTotals(totals: OrderTotals): {
  readonly isValid: boolean;
  readonly error?: string;
} {
  try {
    const computed = computeOrderTotals(
      totals.subtotal,
      totals.taxAmount,
      totals.deliveryFee,
      totals.discountAmount,
    );

    if (!computed.totalAmount.equals(totals.totalAmount)) {
      return {
        isValid: false,
        error: `Total mismatch: expected ${computed.totalAmount.inCents} cents, got ${totals.totalAmount.inCents} cents`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid order totals',
    };
  }
}
