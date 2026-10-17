import { describe, expect, it } from 'vitest';
import { Money } from './Money';

describe('Money', () => {
  it('stores integer cents and renders dollars', () => {
    const money = Money.fromCents(1299);
    expect(money.inCents).toBe(1299);
    expect(money.inDollars).toBe(12.99);
    expect(money.toString()).toBe('12.99');
  });

  it('rounds dollar input to the nearest cent', () => {
    expect(Money.fromDollars(12.99).inCents).toBe(1299);
    expect(Money.fromDollars(12.995).inCents).toBe(1300);
    expect(Money.fromDollars(-12.995).inCents).toBe(-1300);
  });

  it('rejects non-integer and non-finite amounts', () => {
    expect(() => Money.fromCents(1.5)).toThrow(RangeError);
    expect(() => Money.fromCents(Number.NaN)).toThrow(RangeError);
    expect(() => Money.fromDollars(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it('adds, subtracts, and multiplies exactly', () => {
    const ten = Money.fromCents(1000);
    const twoFifty = Money.fromCents(250);
    expect(ten.add(twoFifty).inCents).toBe(1250);
    expect(ten.subtract(twoFifty).inCents).toBe(750);
    expect(twoFifty.multiply(3).inCents).toBe(750);
    expect(Money.zero().inCents).toBe(0);
  });

  it('refuses subtraction below zero', () => {
    expect(() => Money.fromCents(100).subtract(Money.fromCents(101))).toThrow(
      RangeError,
    );
  });

  it('refuses fractional or negative multipliers', () => {
    expect(() => Money.fromCents(100).multiply(1.5)).toThrow(RangeError);
    expect(() => Money.fromCents(100).multiply(-1)).toThrow(RangeError);
  });

  it('compares by value', () => {
    expect(Money.fromCents(100).equals(Money.fromCents(100))).toBe(true);
    expect(Money.fromCents(100).equals(Money.fromCents(101))).toBe(false);
    expect(Money.fromCents(0).isZero()).toBe(true);
    expect(Money.fromCents(-1).isNegative()).toBe(true);
  });
});
