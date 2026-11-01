import type { MealId } from '../../domain/IDs';

export interface ReviewRepository {
  save(review: { mealId: MealId; stars: number }): Promise<void>;
  /** Average and count over published reviews only. */
  summaryFor(mealId: MealId): Promise<{ average: number; count: number }>;
}