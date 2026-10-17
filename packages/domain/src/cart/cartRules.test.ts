import { describe, expect, it } from 'vitest';
import { Money } from '../money/Money';
import {
  assertCartNotEmpty,
  assertValidCartQuantity,
  cartItemCount,
  cartSubtotal,
  isCartEmpty,
  isValidCartQuantity,
  lineTotal,
  withCartQuantity,
} from './cartRules';

const line = (cents: number, quantity: number) => ({
  unitPrice: Money.fromCents(cents),
  quantity,
});

describe('cart quantity rules', () => {
  it('accepts whole positive quantities', () => {
    expect(isValidCartQuantity(1)).toBe(true);
    expect(isValidCartQuantity(12)).toBe(true);
  });

  it('rejects zero, fractions, negatives and unsafe numbers', () => {
    expect(isValidCartQuantity(0)).toBe(false);
    expect(isValidCartQuantity(1.5)).toBe(false);
    expect(isValidCartQuantity(-1)).toBe(false);
    expect(isValidCartQuantity(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  });

  it('asserts a valid quantity', () => {
    expect(() => assertValidCartQuantity(0)).toThrow(RangeError);
    expect(() => assertValidCartQuantity(2)).not.toThrow();
  });
});

describe('cart totals', () => {
  it('computes a line total', () => {
    expect(lineTotal(line(1299, 3)).inCents).toBe(3897);
  });

  it('sums lines and counts units', () => {
    const lines = [line(1000, 2), line(250, 4)];
    expect(cartSubtotal(lines).inCents).toBe(3000);
    expect(cartItemCount(lines)).toBe(6);
  });

  it('treats an empty cart as zero and detects emptiness', () => {
    expect(cartSubtotal([]).inCents).toBe(0);
    expect(isCartEmpty([])).toBe(true);
    expect(isCartEmpty([line(100, 1)])).toBe(false);
  });

  it('requires at least one line for checkout', () => {
    expect(() => assertCartNotEmpty([])).toThrow(RangeError);
    expect(() => assertCartNotEmpty([line(100, 1)])).not.toThrow();
  });

  it('returns a new line when changing quantity', () => {
    const original = line(100, 1);
    const updated = withCartQuantity(original, 3);
    expect(updated.quantity).toBe(3);
    expect(original.quantity).toBe(1);
  });
});
