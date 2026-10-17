import { describe, expect, it } from 'vitest';
import {
  TDEECalculator,
  isCompleteHealthProfile,
  type HealthProfile,
} from './TDEECalculator';

const male: HealthProfile = {
  age: 30,
  gender: 'M',
  weight_kg: 80,
  height_cm: 180,
  activityLevel: 'moderate',
  goal: 'maintain',
};

const female: HealthProfile = {
  age: 30,
  gender: 'F',
  weight_kg: 60,
  height_cm: 165,
  activityLevel: 'sedentary',
  goal: 'lose',
};

describe('TDEECalculator', () => {
  it('calculates Mifflin-St Jeor BMR for men and women', () => {
    expect(TDEECalculator.calculateBMR(male)).toBe(1780);
    expect(TDEECalculator.calculateBMR(female)).toBe(1320);
  });

  it('applies activity multipliers', () => {
    expect(TDEECalculator.calculateTDEE(male)).toBe(2759);
    expect(TDEECalculator.calculateTDEE(female)).toBe(1584);
  });

  it('applies goal adjustments', () => {
    expect(TDEECalculator.calculateTargetCalories(male)).toBe(2759);
    expect(TDEECalculator.calculateTargetCalories(female)).toBe(1084);
    expect(
      TDEECalculator.calculateTargetCalories({ ...male, goal: 'gain' }),
    ).toBe(3059);
  });

  it('rejects invalid profiles', () => {
    expect(() => TDEECalculator.calculateBMR({ ...male, age: 0 })).toThrow(
      RangeError,
    );
    expect(() =>
      TDEECalculator.calculateBMR({ ...male, weight_kg: -1 }),
    ).toThrow(RangeError);
    expect(() =>
      TDEECalculator.calculateBMR({
        ...male,
        activityLevel: 'invalid' as HealthProfile['activityLevel'],
      }),
    ).toThrow(RangeError);
  });

  it('detects complete health profiles', () => {
    expect(isCompleteHealthProfile(male)).toBe(true);
    expect(isCompleteHealthProfile({ ...male, height_cm: undefined })).toBe(
      false,
    );
    expect(isCompleteHealthProfile({ ...male, goal: undefined })).toBe(false);
  });
});
