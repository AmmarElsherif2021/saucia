import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@saucia/db-types';
import type { Money } from '@saucia/domain';
import { toMealId, type MealId } from '../../domain/ids';
import { moneyFromNumeric } from './mappers/MealMapper';

/**
 * Implements the MealPriceReader port declared in modules/order/application/ports.
 * Matched structurally: this class does not import the order module.
 *
 * Contract:
 * - Returns list prices (integer cents) for available meals only.
 * - A requested id that is missing or unavailable is absent from the Map.
 *   The caller (SubmitOrder) reports it as MEAL_NOT_FOUND.
 * - Throws on database failure. Failures are not business outcomes.
 */
export class MenuPriceReader {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async getUnitPrices(ids: readonly MealId[]): Promise<Map<MealId, Money>> {
    const prices = new Map<MealId, Money>();
    if (ids.length === 0) return prices;

    const { data, error } = await this.db
      .from('meals')
      .select('id, base_price, is_available')
      .in('id', [...ids])
      .eq('is_available', true);

    if (error) {
      throw new Error(`MenuPriceReader failed: ${error.message}`);
    }

    for (const row of data ?? []) {
      prices.set(toMealId(row.id), moneyFromNumeric(row.base_price));
    }

    return prices;
  }
}