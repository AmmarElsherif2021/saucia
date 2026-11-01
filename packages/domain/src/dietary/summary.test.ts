import { describe, expect, it } from 'vitest';
import type { AllergenId } from './allergens';
import type { DietaryFacts } from './summary';
import { summarizeMeal } from './summary';

// Hand-checked fixture.
// Item A: vegan, nuts, 10g P / 10g C / 10g F  -> 170 kcal
// Item B: vegetarian, milk+nuts, 0 P / 20 C / 0 F -> 80 kcal
// Meal:   30g P / 30g C / 10g F -> 40 + 120 + 90 = 250 kcal
const itemA: DietaryFacts = {
  diet: 'vegan',
  allergens: new Set<AllergenId>(['nuts']),
  macros: { protein: 10, carbs: 10, fat: 10 },
};

const itemB: DietaryFacts = {
  diet: 'vegetarian',
  allergens: new Set<AllergenId>(['milk', 'nuts']),
  macros: { protein: 0, carbs: 20, fat: 0 },
};

describe('summarizeMeal', () => {
  it('takes the weakest diet of its items', () => {
    expect(summarizeMeal([itemA, itemB]).diet).toBe('vegetarian');
  });

  it('unions the allergens without duplicates', () => {
    const { allergens } = summarizeMeal([itemA, itemB]);
    expect([...allergens].sort()).toEqual(['milk', 'nuts']);
  });

  it('sums the macros', () => {
    expect(summarizeMeal([itemA, itemB]).macros).toEqual({
      protein: 10,
      carbs: 30,
      fat: 10,
    });
  });

  it('derives the energy split from the summed macros', () => {
    const { split } = summarizeMeal([itemA, itemB]);
    // summed macros are 10P / 30C / 10F, so kcal = 40 + 120 + 90 = 250
    expect(split!.proteinPct).toBeCloseTo(16, 10);
    expect(split!.carbsPct).toBeCloseTo(48, 10);
    expect(split!.fatPct).toBeCloseTo(36, 10);
  });

  it('returns no split when the meal has no energy', () => {
    const zero: DietaryFacts = {
      diet: 'omnivore',
      allergens: new Set<AllergenId>(),
      macros: { protein: 0, carbs: 0, fat: 0 },
    };
    expect(summarizeMeal([zero]).split).toBeUndefined();
  });

  it('handles a single item', () => {
    const s = summarizeMeal([itemA]);
    expect(s.diet).toBe('vegan');
    expect([...s.allergens]).toEqual(['nuts']);
    expect(s.macros).toEqual(itemA.macros);
  });

  it('deduplicates an allergen shared by several items', () => {
    const s = summarizeMeal([itemA, itemA, itemA]);
    expect(s.allergens.size).toBe(1);
  });

  it('refuses an empty meal', () => {
    expect(() => summarizeMeal([])).toThrow(RangeError);
  });

  it('does not mutate its input items', () => {
    const before = [...itemB.allergens];
    summarizeMeal([itemA, itemB]);
    expect([...itemB.allergens]).toEqual(before);
    expect(itemB.macros).toEqual({ protein: 0, carbs: 20, fat: 0 });
  });
});