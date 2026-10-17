import { Money } from '../money/Money';

export const MIN_CART_QUANTITY = 1;

/** A cart line is a priced unit and a whole-number quantity. */
export interface CartLine {
  readonly unitPrice: Money;
  readonly quantity: number;
}

/** Quantities are whole numbers of at least one; zero means "remove". */
export function isValidCartQuantity(quantity: number): boolean {
  return Number.isSafeInteger(quantity) && quantity >= MIN_CART_QUANTITY;
}

export function assertValidCartQuantity(quantity: number): void {
  if (!isValidCartQuantity(quantity)) {
    throw new RangeError(
      `Cart quantity must be a safe integer of at least ${MIN_CART_QUANTITY}`,
    );
  }
}

/** Total for one line: unit price × quantity. */
export function lineTotal(line: CartLine): Money {
  assertValidCartQuantity(line.quantity);
  return line.unitPrice.multiply(line.quantity);
}

/** Sum of all line totals; an empty cart is worth zero. */
export function cartSubtotal(lines: readonly CartLine[]): Money {
  return lines.reduce((sum, line) => sum.add(lineTotal(line)), Money.zero());
}

/** Total number of units across all lines. */
export function cartItemCount(lines: readonly CartLine[]): number {
  return lines.reduce((count, line) => {
    assertValidCartQuantity(line.quantity);
    return count + line.quantity;
  }, 0);
}

export function isCartEmpty(lines: readonly CartLine[]): boolean {
  return lines.length === 0;
}

/** Checkout requires at least one line. */
export function assertCartNotEmpty(lines: readonly CartLine[]): void {
  if (isCartEmpty(lines)) {
    throw new RangeError('Cart must contain at least one line');
  }
}

/** Return the same line with a validated quantity (zero is not allowed here). */
export function withCartQuantity(line: CartLine, quantity: number): CartLine {
  assertValidCartQuantity(quantity);
  return { ...line, quantity };
}
