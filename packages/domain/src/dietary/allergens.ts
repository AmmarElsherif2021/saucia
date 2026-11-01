// Canonical list of allergens.
export const ALLERGENS = [
  'milk', 'eggs', 'fish', 'shellfish', 'nuts', 'gluten', 'soy', 'sesame', 'mustard',
] as const;

export type AllergenId = (typeof ALLERGENS)[number];

// Animal flesh: excluded by vegetarian and vegan.
export const FLESH_ALLERGENS = ['fish', 'shellfish'] as const satisfies readonly AllergenId[];

// Animal by-products: excluded by vegan only.
export const BYPRODUCT_ALLERGENS = ['milk', 'eggs'] as const satisfies readonly AllergenId[];