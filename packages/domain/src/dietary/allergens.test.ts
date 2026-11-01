import { describe, expect, it } from 'vitest';
import { ALLERGENS, BYPRODUCT_ALLERGENS, FLESH_ALLERGENS } from './allergens';

describe('allergen registry', () => {
  it('has no duplicate ids', () => {
    expect(new Set(ALLERGENS).size).toBe(ALLERGENS.length);
  });

  it('contains every flesh allergen', () => {
    for (const a of FLESH_ALLERGENS) expect(ALLERGENS).toContain(a);
  });

  it('contains every by-product allergen', () => {
    for (const a of BYPRODUCT_ALLERGENS) expect(ALLERGENS).toContain(a);
  });

  it('classifies fish and shellfish as flesh, milk and eggs as by-products', () => {
    expect([...FLESH_ALLERGENS].sort()).toEqual(['fish', 'shellfish']);
    expect([...BYPRODUCT_ALLERGENS].sort()).toEqual(['eggs', 'milk']);
  });

  it('keeps the two groups disjoint', () => {
    const overlap = FLESH_ALLERGENS.filter((a) =>
      (BYPRODUCT_ALLERGENS as readonly string[]).includes(a),
    );
    expect(overlap).toEqual([]);
  });
});