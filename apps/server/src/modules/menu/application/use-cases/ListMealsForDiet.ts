import { Ok, type Result, DomainError } from '../../../../kernel';
import { allergenConflicts } from '@saucia/domain';
import type { MealRepository } from '../ports/MealRepository';
import type { ItemAllergenIndex } from '../ports/ItemAllergenIndex';
import type { Meal } from '../../domain/Meal';

/**
 * Available meals, each with the allergen ids it contains.
 * The catalog returns product facts only. No user data enters this use case.
 */
export class ListMealsForDiet {
  constructor(
    private readonly meals: MealRepository,
    private readonly allergens: ItemAllergenIndex,
  ) {}

  async execute(): Promise<readonly { meal: Meal; allergens: ReadonlySet<string> }[]> {
    const meals = await this.meals.findAvailable();
    const itemIds = [...new Set(meals.flatMap((m) => [...m.itemIds]))];
    const byItem = await this.allergens.allergensForItems(itemIds);

    return meals.map((meal) => {
      const set = new Set<string>();
      for (const id of meal.itemIds) {
        for (const a of byItem.get(id) ?? []) set.add(a);
      }
      return { meal, allergens: set };
    });
  }
}