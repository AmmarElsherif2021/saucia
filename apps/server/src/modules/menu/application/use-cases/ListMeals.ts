import type { MealRepository } from '../ports/MealRepository';
import type { Meal } from '../../domain/Meal';

/*
 - Customer catalog: available meals only.
 - Note: Admin listings use a separate path (findAllForAdmin) so disabled meals
   cannot leak into the customer view.
 */
export class ListMealsForCustomer {
  constructor(private readonly meals: MealRepository) {}

  async execute(): Promise<readonly Meal[]> {
    return this.meals.findAvailable();
  }
}