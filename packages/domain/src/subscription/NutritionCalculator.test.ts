import { describe, expect, it } from 'vitest';
import {
  CALORIES_PER_GRAM,
  MACRO_RATIOS,
  calculateMacros,
  calculateNutritionProfile,
} from './NutritionCalculator';
import type { HealthProfile } from './TDEECalculator';

const profile: HealthProfile = {
  age: 30,
  gender: 'M',
  weight_kg: 80,
  height_cm: 180,
  activityLevel: 'moderate',
  goal: 'maintain',
};

describe('calculateMacros', () => {
  it('splits target calories into grams by goal', () => {
    expect(calculateMacros(2759, 'maintain')).toEqual({
      protein: 172,
      carbs: 345,
      fat: 77,
    });
  });

  it('uses the deficit ratios for weight loss', () => {
    expect(calculateMacros(1084, 'lose')).toEqual({
      protein: 81,
      carbs: 108,
      fat: 36,
    });
  });

  it('rejects invalid targets and goals', () => {
    expect(() => calculateMacros(-1, 'maintain')).toThrow(RangeError);
    expect(() =>
      calculateMacros(2000, 'bulk' as HealthProfile['goal']),
    ).toThrow(RangeError);
  });

  it('keeps ratio and calorie constants internally consistent', () => {
    for (const goal of Object.keys(MACRO_RATIOS) as HealthProfile['goal'][]) {
      const ratio = MACRO_RATIOS[goal];
      expect(ratio.protein + ratio.carbs + ratio.fat).toBeCloseTo(1);
    }
    expect(CALORIES_PER_GRAM.protein).toBe(4);
    expect(CALORIES_PER_GRAM.carbs).toBe(4);
    expect(CALORIES_PER_GRAM.fat).toBe(9);
  });
});

describe('calculateNutritionProfile', () => {
  it('returns the full pipeline for a profile', () => {
    expect(calculateNutritionProfile(profile)).toEqual({
      bmr: 1780,
      tdee: 2759,
      targetCalories: 2759,
      macros: { protein: 172, carbs: 345, fat: 77 },
    });
  });
});
