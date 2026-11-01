import type { Database } from '@saucia/db-types';

export type MealRow = Partial<Database['public']['Tables']['meals']['Row']>
/** Only the columns the price reader reads. The full row stays in the generated type. */
export type MealPriceRow = Pick<
  Database['public']['Tables']['meals']['Row'],
  'id' | 'base_price' | 'is_available'
>;