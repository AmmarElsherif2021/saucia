import type { MealId } from '../../domain/IDs';
import {Meal} from '../../domain/Meal';
import {Money} from '@saucia/domain';
import type { MealRepository } from '../ports/MealRepository';
import { DomainError, Err, isFailure, Ok } from '../../../../kernel/index';
import type { MealResult, MealErrorCode } from '../../domain/Meal';
export class ChangeMealBasePrice {
  constructor(private readonly meals: MealRepository) {}

  async execute(mealId: MealId, basePrice: Money): Promise<MealResult<Meal>> {
    const meal = await this.meals.findById(mealId);
    if (!meal) return Err(new DomainError<MealErrorCode>('MEAL_NOT_FOUND', `Meal ${mealId} not found`));

    const changed = meal.changeBasePrice(basePrice); // entity guards the rule
    if (isFailure(changed)) return changed;

    await this.meals.save(meal);
    return Ok(meal);
  }
}