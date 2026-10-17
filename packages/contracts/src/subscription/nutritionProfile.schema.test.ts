import { describe, expect, it } from 'vitest';
import { nutritionProfileSchema } from './nutritionProfile.schema';

describe('nutritionProfileSchema', () => {
  it('accepts a complete profile in whole grams and kcal', () => {
    const parsed = nutritionProfileSchema.parse({
      bmr: 1780,
      tdee: 2759,
      targetCalories: 2759,
      macros: { protein: 172, carbs: 345, fat: 77 },
    });
    expect(parsed.macros.fat).toBe(77);
  });

  it('rejects fractional or negative values', () => {
    expect(
      nutritionProfileSchema.safeParse({
        bmr: 1780,
        tdee: 2759,
        targetCalories: 2759,
        macros: { protein: 172.5, carbs: 345, fat: 77 },
      }).success,
    ).toBe(false);
    expect(
      nutritionProfileSchema.safeParse({
        bmr: 1780,
        tdee: 2759,
        targetCalories: -1,
        macros: { protein: 172, carbs: 345, fat: 77 },
      }).success,
    ).toBe(false);
  });
});
