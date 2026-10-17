import { describe, expect, it } from 'vitest';
import { Money } from '../money/Money';
import { computeOrderTotals, validateOrderTotals } from './computeOrderTotals';

const cents = (value: number) => Money.fromCents(value);

describe('computeOrderTotals', () => {
  it('sums subtotal, tax and delivery, then subtracts discount', () => {
    const totals = computeOrderTotals(cents(5000), cents(750), cents(1500), cents(500));
    expect(totals.subtotal.inCents).toBe(5000);
    expect(totals.taxAmount.inCents).toBe(750);
    expect(totals.deliveryFee.inCents).toBe(1500);
    expect(totals.discountAmount.inCents).toBe(500);
    expect(totals.totalAmount.inCents).toBe(6750);
  });

  it('allows a zero discount', () => {
    const totals = computeOrderTotals(cents(1000), cents(0), cents(0), cents(0));
    expect(totals.totalAmount.inCents).toBe(1000);
  });

  it('rejects negative components', () => {
    expect(() =>
      computeOrderTotals(cents(-1), cents(0), cents(0), cents(0)),
    ).toThrow(RangeError);
  });

  it('rejects a discount larger than the balance', () => {
    expect(() =>
      computeOrderTotals(cents(1000), cents(0), cents(0), cents(1001)),
    ).toThrow(RangeError);
  });
});

describe('validateOrderTotals', () => {
  it('accepts a consistent snapshot', () => {
    const totals = computeOrderTotals(cents(5000), cents(750), cents(1500), cents(500));
    expect(validateOrderTotals(totals)).toEqual({ isValid: true });
  });

  it('reports a total mismatch', () => {
    const totals = {
      ...computeOrderTotals(cents(5000), cents(750), cents(1500), cents(500)),
      totalAmount: cents(1),
    };
    const result = validateOrderTotals(totals);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Total mismatch');
  });

  it('reports invalid components without throwing', () => {
    const totals = {
      subtotal: cents(1000),
      taxAmount: cents(0),
      deliveryFee: cents(0),
      discountAmount: cents(1001),
      totalAmount: cents(0),
    };
    expect(validateOrderTotals(totals).isValid).toBe(false);
  });
});
