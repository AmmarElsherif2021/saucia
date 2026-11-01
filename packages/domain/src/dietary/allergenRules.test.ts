import { describe, expect, it } from 'vitest';
import { allergenConflicts } from './allergenRules';
import type { AllergenId } from './allergens';

describe('allergenConflicts', () => {
  it('returns the allergens the user must avoid that the item contains', () => {
    const result = allergenConflicts(
      new Set<AllergenId>(['milk', 'nuts']),
      new Set<AllergenId>(['nuts']),
    );
    expect(result).toEqual([{ allergenId: 'nuts' }]);
  });

  it('returns nothing when there is no overlap', () => {
    expect(
      allergenConflicts(new Set<AllergenId>(['milk']), new Set<AllergenId>(['nuts'])),
    ).toEqual([]);
  });

  it('returns nothing when the user has no allergies', () => {
    expect(
      allergenConflicts(new Set<AllergenId>(['milk', 'nuts']), new Set<AllergenId>()),
    ).toEqual([]);
  });

  it('returns nothing when the item has no allergens', () => {
    expect(
      allergenConflicts(new Set<AllergenId>(), new Set<AllergenId>(['nuts'])),
    ).toEqual([]);
  });

  it('reports every shared allergen', () => {
    const result = allergenConflicts(
      new Set<AllergenId>(['milk', 'eggs', 'gluten']),
      new Set<AllergenId>(['eggs', 'milk']),
    );
    expect(result.map((c) => c.allergenId).sort()).toEqual(['eggs', 'milk']);
  });

  it('is directional: only the user set drives the result', () => {
    // An item allergen the user does not list is not a conflict.
    const result = allergenConflicts(
      new Set<AllergenId>(['sesame']),
      new Set<AllergenId>(['nuts']),
    );
    expect(result).toEqual([]);
  });
});