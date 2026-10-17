import {
  TDEECalculator,
  type FitnessGoal,
  type HealthProfile,
} from './TDEECalculator';

export interface MacroSplit {
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
}

export interface NutritionProfile {
  readonly bmr: number;
  readonly tdee: number;
  readonly targetCalories: number;
  readonly macros: MacroSplit;
}

/**
 * Macro ratios by goal, carried over from the v1 nutrition calculator.
 * Protein/carbs are 4 kcal/g; fat is 9 kcal/g.
 */
export const MACRO_RATIOS: Readonly<
  Record<FitnessGoal, Readonly<Record<keyof MacroSplit, number>>>
> = {
  lose: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  maintain: { protein: 0.25, carbs: 0.5, fat: 0.25 },
  gain: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

export const CALORIES_PER_GRAM: Readonly<Record<keyof MacroSplit, number>> = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

function assertTargetCalories(targetCalories: number): void {
  if (!Number.isFinite(targetCalories) || targetCalories < 0) {
    throw new RangeError('targetCalories must be a non-negative finite number');
  }
}

/** Convert a daily calorie target into grams of protein, carbs and fat. */
export function calculateMacros(
  targetCalories: number,
  goal: FitnessGoal,
): MacroSplit {
  assertTargetCalories(targetCalories);
  const ratios = MACRO_RATIOS[goal];
  if (ratios === undefined) {
    throw new RangeError(`Unknown fitness goal: ${String(goal)}`);
  }

  return {
    protein: Math.round(
      (targetCalories * ratios.protein) / CALORIES_PER_GRAM.protein,
    ),
    carbs: Math.round(
      (targetCalories * ratios.carbs) / CALORIES_PER_GRAM.carbs,
    ),
    fat: Math.round((targetCalories * ratios.fat) / CALORIES_PER_GRAM.fat),
  };
}

/** Full BMR → TDEE → target calories → macros pipeline. */
export function calculateNutritionProfile(
  profile: HealthProfile,
): NutritionProfile {
  const bmr = TDEECalculator.calculateBMR(profile);
  const tdee = TDEECalculator.calculateTDEE(profile);
  const targetCalories = TDEECalculator.calculateTargetCalories(profile);

  return {
    bmr,
    tdee,
    targetCalories,
    macros: calculateMacros(targetCalories, profile.goal),
  };
}
