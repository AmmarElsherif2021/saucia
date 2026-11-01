import { Money } from '@saucia/domain';
import { DomainError, Err, Ok, type Result } from '../../../kernel';
import type { ItemId } from './IDs';
import { dietAllergenConflicts, macroViolation } from '@saucia/domain';
import type { AllergenId, DietClass, MacroSplit } from '@saucia/domain';

//Errors and Results
export type ItemErrorCode = 'INVALID_ID' | 'NEGATIVE_PRICE' | 'INVALID_FREE_ALLOWANCE' |'ITEM_NOT_FOUND';
export type ItemResult<T> = Result<T, DomainError<ItemErrorCode>>;

// props for creating or reconstituting an Item
export interface ItemProps {
  readonly id: ItemId;
  readonly unitPrice: Money;
  readonly maxFreePerMeal: number;
  readonly isAdditive: boolean;
  readonly isAvailable: boolean;
  readonly diet: DietClass;               // items.diet_class
  readonly allergens: ReadonlySet<AllergenId>; // item_allergens
  readonly macros: MacroSplit;                // items.protein_g / carbs_g / fat_g
}

//Returns the first rule violated, or undefined when the props are valid
function firstViolation(p: ItemProps): DomainError<ItemErrorCode> | undefined {
  if (!Number.isSafeInteger(p.id) || p.id <= 0) {
    return new DomainError('INVALID_ID', `Item id ${p.id} must be a positive integer`);
  }
  if (p.unitPrice.isNegative()) {
    return new DomainError('NEGATIVE_PRICE', `Item ${p.id} has a negative unit price`);
  }
  if (!Number.isSafeInteger(p.maxFreePerMeal) || p.maxFreePerMeal < 0) {
    return new DomainError('INVALID_FREE_ALLOWANCE', `Item ${p.id} free allowance must be a non-negative integer`);
  }
  return undefined;
}

export class Item {
  private constructor(private props: ItemProps) {}

  static create(props: ItemProps): ItemResult<Item> {
    const violation = firstViolation(props);
    return violation ? Err(violation) : Ok(new Item({ ...props }));
  }

  // IMPORTANT: Stored data is not trusted: rebuilding runs the same checks as creating. */
  static reconstitute(props: ItemProps): ItemResult<Item> {
    return Item.create(props);
  }

  get id(): ItemId { return this.props.id; }
  get unitPrice(): Money { return this.props.unitPrice; }
  get maxFreePerMeal(): number { return this.props.maxFreePerMeal; }
  get isAdditive(): boolean { return this.props.isAdditive; }
  get isAvailable(): boolean { return this.props.isAvailable; }
  get diet(): DietClass { return this.props.diet; }
  get allergens(): ReadonlySet<AllergenId> { return this.props.allergens; }
  get macros(): MacroSplit { return this.props.macros; }
  setAvailable(next: boolean): void {
    this.props = { ...this.props, isAvailable: next };
  }
}