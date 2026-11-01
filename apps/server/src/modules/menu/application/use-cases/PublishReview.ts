import type { MealId } from '../../domain/IDs';
import type { MealRepository } from '../ports/MealRepository';
import type { ReviewRepository } from '../ports/ReviewRepository';
import { DomainError, Err, Ok } from '../../../../kernel/index';
import type { MealResult, MealErrorCode } from '../../domain/Meal';
import type { Meal } from '../../domain/Meal';
export class PublishReview {
  constructor(
    private readonly meals: MealRepository,
    private readonly reviews: ReviewRepository,
  ) {}

  async execute(mealId: MealId, stars: number): Promise<MealResult<Meal>> {
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return Err(new DomainError<MealErrorCode>('INVALID_RATING', 'Stars must be an integer from 1 to 5'));
    }
    const meal = await this.meals.findById(mealId);
    if (!meal) return Err(new DomainError<MealErrorCode>('MEAL_NOT_FOUND', `Meal ${mealId} not found`));

    await this.reviews.save({ mealId, stars });
    const summary = await this.reviews.summaryFor(mealId); // published reviews only

    meal.applyRating(summary); 
    await this.meals.save(meal);
    return Ok(meal);
  }
}