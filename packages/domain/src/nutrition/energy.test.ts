import { describe, expect, it } from 'vitest';
import {
  CALORIES_PER_GRAM,
  ZERO_MACROS,
  energyKcal,
  energySplit,
  macroViolation,
  splitDistance,
  sumMacros,
  type EnergySplit,
} from './energy';

describe('CALORIES_PER_GRAM', () => {
  it('uses the Atwater general factors', () => {
    expect(CALORIES_PER_GRAM).toEqual({ protein: 4, carbs: 4, fat: 9 });
  });
});

describe('macroViolation', () => {
  it('accepts zero and positive finite grams', () => {
    expect(macroViolation(ZERO_MACROS)).toBeUndefined();
    expect(macroViolation({ protein: 10, carbs: 0, fat: 2.5 })).toBeUndefined();
  });

  it('rejects negative grams', () => {
    expect(macroViolation({ protein: -1, carbs: 0, fat: 0 })).toBe('NEGATIVE_MACRO');
  });

  it('rejects NaN and infinite grams', () => {
    expect(macroViolation({ protein: Number.NaN, carbs: 0, fat: 0 })).toBe('NON_FINITE_MACRO');
    expect(macroViolation({ protein: 0, carbs: Number.POSITIVE_INFINITY, fat: 0 })).toBe('NON_FINITE_MACRO');
  });

  it('reports non-finite before negative when both apply', () => {
    // Order matters for the error the caller sees: NaN is checked first.
    expect(macroViolation({ protein: Number.NaN, carbs: -1, fat: 0 })).toBe('NON_FINITE_MACRO');
  });
});

describe('sumMacros', () => {
  it('adds grams per macro', () => {
    expect(
      sumMacros([
        { protein: 10, carbs: 20, fat: 30 },
        { protein: 1, carbs: 2, fat: 3 },
      ]),
    ).toEqual({ protein: 11, carbs: 22, fat: 33 });
  });

  it('returns zero for an empty list', () => {
    expect(sumMacros([])).toEqual(ZERO_MACROS);
  });

  it('does not mutate its inputs', () => {
    const a = { protein: 1, carbs: 1, fat: 1 };
    sumMacros([a, a]);
    expect(a).toEqual({ protein: 1, carbs: 1, fat: 1 });
  });
});

describe('energyKcal', () => {
  it('applies the per-macro factors', () => {
    expect(energyKcal({ protein: 1, carbs: 0, fat: 0 })).toBe(4);
    expect(energyKcal({ protein: 0, carbs: 1, fat: 0 })).toBe(4);
    expect(energyKcal({ protein: 0, carbs: 0, fat: 1 })).toBe(9);
  });

  it('sums the three contributions', () => {
    // 10*4 + 10*4 + 10*9 = 170
    expect(energyKcal({ protein: 10, carbs: 10, fat: 10 })).toBe(170);
  });

  it('is zero for zero grams', () => {
    expect(energyKcal(ZERO_MACROS)).toBe(0);
  });
});

describe('energySplit', () => {
  it('returns percentages that sum to 100', () => {
    const s = energySplit({ protein: 10, carbs: 10, fat: 10 })!;
    expect(s.proteinPct + s.carbsPct + s.fatPct).toBeCloseTo(100, 10);
  });

  it('computes each share of energy, not of grams', () => {
    // 40 / 170, 40 / 170, 90 / 170 of total kcal
    const s = energySplit({ protein: 10, carbs: 10, fat: 10 })!;
    expect(s.proteinPct).toBeCloseTo(23.53, 2);
    expect(s.carbsPct).toBeCloseTo(23.53, 2);
    expect(s.fatPct).toBeCloseTo(52.94, 2);
  });

  it('gives 100% to a single macro', () => {
    expect(energySplit({ protein: 0, carbs: 0, fat: 10 })).toEqual({
      proteinPct: 0,
      carbsPct: 0,
      fatPct: 100,
    });
  });

  it('is undefined when there is no energy', () => {
    expect(energySplit(ZERO_MACROS)).toBeUndefined();
  });
});

describe('splitDistance', () => {
  const target: EnergySplit = { proteinPct: 30, carbsPct: 40, fatPct: 30 };

  it('is zero for identical splits', () => {
    expect(splitDistance(target, target)).toBe(0);
  });

  it('returns the largest per-axis deviation', () => {
    const actual: EnergySplit = { proteinPct: 25, carbsPct: 50, fatPct: 25 };
    // deviations: 5, 10, 5
    expect(splitDistance(actual, target)).toBe(10);
  });

  it('is symmetric', () => {
    const actual: EnergySplit = { proteinPct: 35, carbsPct: 35, fatPct: 30 };
    expect(splitDistance(actual, target)).toBe(splitDistance(target, actual));
  });
});