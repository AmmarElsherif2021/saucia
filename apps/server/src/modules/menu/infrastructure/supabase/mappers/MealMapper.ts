import { Money } from '@saucia/domain';
import { toMealId, type MealId } from '../../../domain/IDs';
import type { MealPriceRow } from '../dto/MealRow';

/*
 1- Regarding Row to (id, list price). Money is converted once, here, at the boundary.
 2- Money.fromDollars rounds to the nearest cent, so no float arithmetic reaches the domain.
 */
export function toMealPrice(row: MealPriceRow): { readonly id: MealId; readonly price: Money } {
  const dollars = Number(row.base_price);
  if (!Number.isFinite(dollars)) {
    throw new Error(`Invalid meals.base_price for meal ${row.id}: ${row.base_price}`);
  }
  return { id: toMealId(row.id), price: Money.fromDollars(dollars) };
}