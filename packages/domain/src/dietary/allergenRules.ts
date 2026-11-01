import type { AllergenId } from './allergens';

export interface AllergenConflict {
  readonly allergenId: AllergenId;
}

/** Allergens the user must avoid that also appear in the item. Empty means safe. */
export function allergenConflicts(
  itemAllergens: ReadonlySet<AllergenId>,
  userAllergens: ReadonlySet<AllergenId>,
): readonly AllergenConflict[] {
  const conflicts: AllergenConflict[] = [];
  for (const id of userAllergens) {
    if (itemAllergens.has(id)) conflicts.push({ allergenId: id });
  }
  return conflicts;
}