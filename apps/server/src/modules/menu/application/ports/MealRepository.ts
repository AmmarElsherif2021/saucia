import type { ItemId, MealId } from '../../domain/IDs';
import type { Meal } from '../../domain/Meal';

/*
  1- Port owned by the menu application layer.
  2- Implemented by infrastructure/supabase/SupabaseMealRepository.ts.
  3- No table names, no row types, no client, and no partial writes:
     every write goes through a Meal entity that has passed its rules.
 */
export interface MealRepository {
  findById(id: MealId): Promise<Meal | undefined>;
  findAvailable(): Promise<readonly Meal[]>;
  findAllForAdmin(): Promise<readonly Meal[]>;
  findByNames(names: readonly string[]): Promise<readonly Meal[]>;
  /* Meals that reference at least one of the given items. Filter by flags in the use case. */
  findByItemsIds(itemIds: readonly ItemId[]): Promise<readonly Meal[]>;
  /* ----------------- Insert or update the whole aggregate --------------*/
  save(meal: Meal): Promise<void>;
  saveMany(meals: readonly Meal[]): Promise<void>; // should be ATOMIC
}