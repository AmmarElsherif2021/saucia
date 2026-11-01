import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@saucia/db-types';
import type { UserAllergyReader } from '../application/ports/UserAllergyReader';

export class SupabaseUserAllergyReader implements UserAllergyReader {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async allergensOf(userId: string): Promise<ReadonlySet<string>> {
    // Table name and columns are assumptions; confirm against the P3.6 migration.
    const { data, error } = await this.db
      .from('user_allergies')
      .select('allergen_id')
      .eq('user_id', userId);
    if (error) throw new Error(`allergy read failed: ${error.message}`);
    return new Set((data ?? []).map((r) => String(r.allergen_id)));
  }
}