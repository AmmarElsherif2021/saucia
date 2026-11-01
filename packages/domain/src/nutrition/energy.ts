// Single home for energy and macro arithmetic. Imports nothing.

/** Grams per macronutrient. */
export interface MacroSplit {
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;
}

/** Percent of total energy per macronutrient. */
export interface EnergySplit {
  readonly proteinPct: number;
  readonly carbsPct: number;
  readonly fatPct: number;
}

/** Atwater general factors (kcal per gram). */
export const CALORIES_PER_GRAM: Readonly<Record<keyof MacroSplit, number>> = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const ZERO_MACROS: MacroSplit = { protein: 0, carbs: 0, fat: 0 };

export type MacroViolation = 'NON_FINITE_MACRO' | 'NEGATIVE_MACRO';

export function macroViolation(m: MacroSplit): MacroViolation | undefined {
  const values = [m.protein, m.carbs, m.fat];
  if (values.some((v) => !Number.isFinite(v))) return 'NON_FINITE_MACRO';
  if (values.some((v) => v < 0)) return 'NEGATIVE_MACRO';
  return undefined;
}

export function sumMacros(list: readonly MacroSplit[]): MacroSplit {
  return list.reduce<MacroSplit>(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    ZERO_MACROS,
  );
}

export function energyKcal(m: MacroSplit): number {
  return m.protein * CALORIES_PER_GRAM.protein
    + m.carbs * CALORIES_PER_GRAM.carbs
    + m.fat * CALORIES_PER_GRAM.fat;
}

/** Percent of energy per macro. Undefined when energy is zero. */
export function energySplit(m: MacroSplit): EnergySplit | undefined {
  const kcal = energyKcal(m);
  if (kcal === 0) return undefined;
  return {
    proteinPct: (m.protein * CALORIES_PER_GRAM.protein / kcal) * 100,
    carbsPct: (m.carbs * CALORIES_PER_GRAM.carbs / kcal) * 100,
    fatPct: (m.fat * CALORIES_PER_GRAM.fat / kcal) * 100,
  };
}

/**
 * Worst-axis deviation in percentage points between an actual and a target split.
 * A plan is met when this value is within its tolerance.
 */
export function splitDistance(actual: EnergySplit, target: EnergySplit): number {
  return Math.max(
    Math.abs(actual.proteinPct - target.proteinPct),
    Math.abs(actual.carbsPct - target.carbsPct),
    Math.abs(actual.fatPct - target.fatPct),
  );
}