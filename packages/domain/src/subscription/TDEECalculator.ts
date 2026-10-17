export const GENDERS = ['M', 'F'] as const;
export type Gender = (typeof GENDERS)[number];

export const ACTIVITY_LEVELS = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'veryActive',
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const FITNESS_GOALS = ['lose', 'maintain', 'gain'] as const;
export type FitnessGoal = (typeof FITNESS_GOALS)[number];

export interface HealthProfile {
  readonly age: number;
  readonly gender: Gender;
  readonly weight_kg: number;
  readonly height_cm: number;
  readonly activityLevel: ActivityLevel;
  readonly goal: FitnessGoal;
}

/** Standard TDEE activity multipliers. */
export const ACTIVITY_MULTIPLIERS: Readonly<Record<ActivityLevel, number>> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

/** Daily calorie adjustment in kcal, applied after TDEE. */
export const CALORIE_ADJUSTMENTS: Readonly<Record<FitnessGoal, number>> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

function assertProfile(profile: HealthProfile): void {
  if (!Number.isFinite(profile.age) || profile.age <= 0) {
    throw new RangeError('age must be a positive finite number');
  }
  if (!Number.isFinite(profile.weight_kg) || profile.weight_kg <= 0) {
    throw new RangeError('weight_kg must be a positive finite number');
  }
  if (!Number.isFinite(profile.height_cm) || profile.height_cm <= 0) {
    throw new RangeError('height_cm must be a positive finite number');
  }
  if (!GENDERS.includes(profile.gender)) {
    throw new RangeError(`gender must be one of: ${GENDERS.join(', ')}`);
  }
  if (!ACTIVITY_LEVELS.includes(profile.activityLevel)) {
    throw new RangeError(
      `activityLevel must be one of: ${ACTIVITY_LEVELS.join(', ')}`,
    );
  }
  if (!FITNESS_GOALS.includes(profile.goal)) {
    throw new RangeError(`goal must be one of: ${FITNESS_GOALS.join(', ')}`);
  }
}

/**
 * Mifflin-St Jeor energy calculations.
 *
 * BMR is rounded before TDEE because the product is presented in whole kcal;
 * this mirrors the legacy calculator and keeps client/server previews equal.
 */
export class TDEECalculator {
  static calculateBMR(profile: HealthProfile): number {
    assertProfile(profile);
    const base =
      10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age;
    return Math.round(base + (profile.gender === 'M' ? 5 : -161));
  }

  static calculateTDEE(profile: HealthProfile): number {
    const bmr = TDEECalculator.calculateBMR(profile);
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
  }

  static calculateTargetCalories(profile: HealthProfile): number {
    return TDEECalculator.calculateTDEE(profile) + CALORIE_ADJUSTMENTS[profile.goal];
  }
}

/** True when a profile has every field the calculators require. */
export function isCompleteHealthProfile(
  profile: Partial<HealthProfile>,
): profile is HealthProfile {
  return (
    Number.isFinite(profile.age) &&
    profile.age! > 0 &&
    (profile.gender === 'M' || profile.gender === 'F') &&
    Number.isFinite(profile.weight_kg) &&
    profile.weight_kg! > 0 &&
    Number.isFinite(profile.height_cm) &&
    profile.height_cm! > 0 &&
    ACTIVITY_LEVELS.includes(profile.activityLevel as ActivityLevel) &&
    FITNESS_GOALS.includes(profile.goal as FitnessGoal)
  );
}
