import { Err, Ok, DomainError, isFailure } from '../../../../kernel';
import type { ItemRepository } from '../ports/ItemRepository';
import type { MealRepository } from '../ports/MealRepository';
import { Meal, type MealProps, type MealResult, type MealErrorCode } from '../../domain/Meal';

export class CreateMeal {
  constructor(
    private readonly meals: MealRepository,
    private readonly items: ItemRepository,
  ) {}

  async execute(props: MealProps): Promise<MealResult<Meal>> {
    // 1. Shape and internal rules first. No I/O yet.
    const created = Meal.create(props);
    if (isFailure(created)) return created;

    // 2. Existence is I/O, so it comes after the shape check.
    const found = await this.items.findByIds(props.itemIds);
    if (found.length !== props.itemIds.length) {
      return Err(new DomainError<MealErrorCode>('INVALID_ITEM_ID', 'One or more items do not exist'));
    }

    await this.meals.save(created.value);
    return Ok(created.value);
  }
}