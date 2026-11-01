import type { ItemId } from '../../domain/IDs';
import type { ItemRepository } from '../ports/ItemRepository';
import type { MealRepository } from '../ports/MealRepository';
import { DomainError, Err, Ok } from '../../../../kernel/index'
import type { ItemResult, ItemErrorCode } from '../../domain/Item';
export class SetItemAvailability {
  constructor(
    private readonly items: ItemRepository,
    private readonly meals: MealRepository,
  ) {}

  async execute(itemId: ItemId, isAvailable: boolean): Promise<ItemResult<void>> {
    const item = await this.items.findById(itemId);
    if (!item) return Err(new DomainError<ItemErrorCode>('ITEM_NOT_FOUND', `Item ${itemId} not found`));

    item.setAvailable(isAvailable);
    await this.items.save(item);

    // Hiding an item hides the selective meals that depend on it.
    if (!isAvailable) {
      const affected = await this.meals.findByItemsIds([itemId]);
      for (const meal of affected) {
        if (meal.isSelective && meal.isAvailable) {
          meal.setAvailable(false);
          await this.meals.save(meal);
        }
      }
    }
    return Ok(undefined);
  }
}