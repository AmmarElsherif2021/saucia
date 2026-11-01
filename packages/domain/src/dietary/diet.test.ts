import { describe, expect, it } from 'vitest';
import type { AllergenId } from './allergens';
import {
  DIET_CLASSES,
  dietAllergenConflicts,
  isAcceptableFor,
  mealDietClass,
  type DietClass,
} from './diet';

describe('DIET_CLASSES', () => {
  it('lists the three classes', () => {
    expect([...DIET_CLASSES].sort()).toEqual(['omnivore', 'vegan', 'vegetarian']);
  });
});

describe('isAcceptableFor', () => {
  it('lets a stricter food serve a looser requirement', () => {
    expect(isAcceptableFor('vegan', 'vegetarian')).toBe(true);
    expect(isAcceptableFor('vegan', 'omnivore')).toBe(true);
    expect(isAcceptableFor('vegetarian', 'omnivore')).toBe(true);
  });

  it('refuses a looser food for a stricter requirement', () => {
    expect(isAcceptableFor('omnivore', 'vegetarian')).toBe(false);
    expect(isAcceptableFor('omnivore', 'vegan')).toBe(false);
    expect(isAcceptableFor('vegetarian', 'vegan')).toBe(false);
  });

  it('accepts every class for its own requirement', () => {
    for (const d of DIET_CLASSES) expect(isAcceptableFor(d, d)).toBe(true);
  });
});

describe('mealDietClass', () => {
  it('refuses to classify an empty meal', () => {
    expect(() => mealDietClass([])).toThrow(RangeError);
  });

  it('returns the class of a single item', () => {
    expect(mealDietClass(['omnivore'])).toBe('omnivore');
    expect(mealDietClass(['vegan'])).toBe('vegan');
  });

  it('is only as strict as its least strict item', () => {
    expect(mealDietClass(['vegan', 'vegetarian'])).toBe('vegetarian');
    expect(mealDietClass(['vegan', 'omnivore'])).toBe('omnivore');
    expect(mealDietClass(['vegetarian', 'omnivore', 'vegan'])).toBe('omnivore');
  });

  it('stays vegan when every item is vegan', () => {
    expect(mealDietClass(['vegan', 'vegan', 'vegan'])).toBe('vegan');
  });

  it('does not depend on item order', () => {
    const a: DietClass[] = ['vegan', 'vegetarian', 'vegan'];
    const b: DietClass[] = ['vegan', 'vegan', 'vegetarian'];
    expect(mealDietClass(a)).toBe(mealDietClass(b));
  });
});

describe('dietAllergenConflicts', () => {
  it('flags flesh and by-products for a vegan item', () => {
    expect(dietAllergenConflicts('vegan', new Set<AllergenId>(['fish']))).toEqual(['fish']);
    expect(dietAllergenConflicts('vegan', new Set<AllergenId>(['milk']))).toEqual(['milk']);
    expect(dietAllergenConflicts('vegan', new Set<AllergenId>(['eggs']))).toEqual(['eggs']);
  });

  it('allows non-animal allergens for a vegan item', () => {
    expect(dietAllergenConflicts('vegan', new Set<AllergenId>(['nuts', 'gluten', 'soy']))).toEqual([]);
  });

  it('flags only flesh for a vegetarian item', () => {
    expect(dietAllergenConflicts('vegetarian', new Set<AllergenId>(['shellfish']))).toEqual(['shellfish']);
    expect(dietAllergenConflicts('vegetarian', new Set<AllergenId>(['milk', 'eggs']))).toEqual([]);
  });

  it('flags nothing for an omnivore item', () => {
    expect(
      dietAllergenConflicts('omnivore', new Set<AllergenId>(['fish', 'milk', 'eggs'])),
    ).toEqual([]);
  });

  it('reports every conflict for a vegan item', () => {
    expect(
      dietAllergenConflicts('vegan', new Set<AllergenId>(['milk', 'eggs', 'fish', 'nuts'])),
    ).toEqual(['fish', 'milk', 'eggs']);
  });

  it('returns nothing for an empty allergen set', () => {
    expect(dietAllergenConflicts('vegan', new Set<AllergenId>())).toEqual([]);
  });
});