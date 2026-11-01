import type { AllergenId } from './allergens';
import { BYPRODUCT_ALLERGENS, FLESH_ALLERGENS } from './allergens';

export const DIET_CLASSES = ['vegan', 'vegetarian', 'omnivore'] as const;
export type DietClass = (typeof DIET_CLASSES)[number];

// Strictness order: vegan is a stricter form of vegetarian.
const STRICTNESS: Readonly<Record<DietClass, number>> = {
  omnivore: 0,
  vegetarian: 1,
  vegan: 2,
};

/** Can a food of class `item` be served to someone who requires `requirement`? */
export function isAcceptableFor(item: DietClass, requirement: DietClass): boolean {
  return STRICTNESS[item] >= STRICTNESS[requirement];
}

/**
 * A meal is only as strict as its least strict item (weakest link).
 * Throws on an empty list: an empty meal has no diet, and returning a default
 * would label it as the strictest class.
 */
export function mealDietClass(items: readonly DietClass[]): DietClass {
  if (items.length === 0) {
    throw new RangeError('mealDietClass requires at least one item');
  }
  return items.reduce((weakest, d) =>
    STRICTNESS[d] < STRICTNESS[weakest] ? d : weakest,
  );
}

/** Declared allergens that contradict the declared diet class. */
export function dietAllergenConflicts(
  diet: DietClass,
  allergens: ReadonlySet<AllergenId>,
): readonly AllergenId[] {
  const excluded: readonly AllergenId[] =
    diet === 'vegan' ? [...FLESH_ALLERGENS, ...BYPRODUCT_ALLERGENS]
    : diet === 'vegetarian' ? FLESH_ALLERGENS
    : [];
  return excluded.filter((a) => allergens.has(a));
}