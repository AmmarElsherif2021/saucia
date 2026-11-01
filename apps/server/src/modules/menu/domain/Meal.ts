import { Money } from '@saucia/domain';
import { DomainError, Err, Ok, type Result } from '../../../kernel';
import type { ItemId, MealId } from './IDs';

export type MealErrorCode =
  | 'INVALID_ID'
  | 'NEGATIVE_PRICE'
  | 'NO_ITEMS'
  | 'INVALID_ITEM_ID'
  | 'INVALID_RATING'
  | 'DUPLICATE_ITEM'
  | 'MEAL_NOT_FOUND';

// MealResult<T> is a Result type that can either be a success containing a value of type T or a failure containing a DomainError with a MealErrorCode. This allows for robust error handling when working with Meal entities in the application.
export type MealResult<T> = Result<T, DomainError<MealErrorCode>>;

export interface MealProps {
  readonly id: MealId;
  readonly name: string;                   // legacy meals.name
  readonly basePrice: Money;              // legacy meals.base_price; discounts are applied in pricing
  readonly itemIds: readonly ItemId[];    // references to Item aggregates, never Item objects
  readonly isSelective: boolean;          // legacy meals.is_selective (customizable meal)
  readonly isAvailable: boolean;          // legacy meals.is_available, set by admins
}

// Returns the first rule violated, or undefined when the props are valid. 
function firstViolation(p: MealProps): DomainError<MealErrorCode> | undefined {
  if (!Number.isSafeInteger(p.id) || p.id <= 0) {
    return new DomainError('INVALID_ID', `Meal id ${p.id} must be a positive integer`);
  }
  if (p.basePrice.isNegative()) {
    return new DomainError('NEGATIVE_PRICE', `Meal ${p.id} has a negative base price`);
  }
  if (p.itemIds.length === 0) {
    return new DomainError('NO_ITEMS', `Meal ${p.id} must reference at least one item`);
  }

  const seen = new Set<number>();
  for (const itemId of p.itemIds) {
    if (!Number.isSafeInteger(itemId) || itemId <= 0) {
      return new DomainError('INVALID_ITEM_ID', `Meal ${p.id} contains an invalid item id ${itemId}`);
    }
    if (seen.has(itemId)) {
      return new DomainError('DUPLICATE_ITEM', `Meal ${p.id} lists item ${itemId} more than once`);
    }
    seen.add(itemId);
  }
  return undefined;
}

export class Meal {
  private constructor(private props: MealProps) {}

  /*
   IMPORTANT: Checks the shape and internal rules only. Whether each item exists and is
   available is I/O, so the use case checks it through an ItemReader port.
   */
  static create(props: MealProps): MealResult<Meal> {
    const violation = firstViolation(props);
    // Copy the array so later changes to the caller's array cannot alter the entity.
    return violation
      ? Err(violation)
      : Ok(new Meal({ ...props, itemIds: [...props.itemIds] }));
  }

  // Stored data is not trusted: rebuilding runs the same checks as creating.
  static reconstitute(props: MealProps): MealResult<Meal> {
    return Meal.create(props);
  }

  get id(): MealId { return this.props.id; }
  get basePrice(): Money { return this.props.basePrice; }
  get itemIds(): readonly ItemId[] { return this.props.itemIds; }
  get isSelective(): boolean { return this.props.isSelective; }
  get isAvailable(): boolean { return this.props.isAvailable; }

  hasItem(itemId: ItemId): boolean {
    return this.props.itemIds.includes(itemId);
  }

  setAvailable(next: boolean): void {
    this.props = { ...this.props, isAvailable: next };
  }

  applyRating(summary: { average: number; count: number }): void {

    // This method would typically update the meal's rating based on the summary provided.
    // Implementation details would depend on how ratings are stored and managed within the Meal entity.
    // For example, you might store the average rating and count as part of the MealProps or in a separate property.
  }

  changeBasePrice(next: Money): MealResult<void> {
    if (next.isNegative()) {
      return Err(new DomainError('NEGATIVE_PRICE', `Meal ${this.props.id} cannot have a negative base price`));
    }
    this.props = { ...this.props, basePrice: next };
    return Ok(undefined);
  }
}