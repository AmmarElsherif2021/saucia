import type { AllergenId } from './allergens';
import type { DietClass } from './diet';
import { mealDietClass } from './diet';
import type { EnergySplit, MacroSplit } from '../nutrition/energy';
import { energySplit, sumMacros } from '../nutrition/energy';

export interface DietaryFacts {
  readonly diet: DietClass;
  readonly allergens: ReadonlySet<AllergenId>;
  readonly macros: MacroSplit;
}

export interface MealDietarySummary {
  readonly diet: DietClass;
  readonly allergens: ReadonlySet<AllergenId>;
  readonly macros: MacroSplit;
  readonly split: EnergySplit | undefined;
}

/**
 * Derives a meal's view from its items. Assumes one serving per item;
 * quantities belong in the input once Meal carries them.
 * Throws if `items` is empty (via mealDietClass).
 */
export function summarizeMeal(items: readonly DietaryFacts[]): MealDietarySummary {
  const allergens = new Set<AllergenId>();
  for (const i of items) {
    for (const a of i.allergens) allergens.add(a);
  }
  const macros = sumMacros(items.map((i) => i.macros));
  return {
    diet: mealDietClass(items.map((i) => i.diet)),
    allergens,
    macros,
    split: energySplit(macros),
  };
}