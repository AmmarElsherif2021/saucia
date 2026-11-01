//Branded ids: A MealId cannot be passed where an ItemId is expected and vice versa.
export type MealId = number & { readonly __brand: 'MealId' };
export type ItemId = number & { readonly __brand: 'ItemId' };


 // Boundary-only casts for the infrastructure mapper, which reads integers from the DB.
 // They do not validate. Validation happens in create() and reconstitute().
 
export const toMealId = (value: number): MealId => value as MealId;
export const toItemId = (value: number): ItemId => value as ItemId;