import { allergenConflicts } from '@saucia/domain';
import { Ok, type Result, DomainError, Err } from '../../../../kernel';
import type { UserAllergyReader } from '../ports/UserAllergyReader';

export type SafetyCode = 'UNSAFE_FOR_USER';

/**
 * Owner-only check. The caller passes the authenticated user id, and the
 * use case reads only that user's allergies. The verdict is returned,
 * not the raw profile.
 */
export class CheckMealSafety {
  constructor(private readonly allergies: UserAllergyReader) {}

  async execute(
    authenticatedUserId: string,
    mealAllergens: ReadonlySet<string>,
  ): Promise<Result<{ safe: true }, DomainError<SafetyCode>>> {
    const mine = await this.allergies.allergensOf(authenticatedUserId);
    const conflicts = allergenConflicts(mealAllergens, mine);
    if (conflicts.length > 0) {
      return Err(new DomainError('UNSAFE_FOR_USER', `Meal contains allergens ${conflicts.map((c) => c.allergenId).join(', ')}`));
    }
    return Ok({ safe: true as const });
  }
}