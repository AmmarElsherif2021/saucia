import type { ItemId } from '../../domain/IDs';

/*============== Read projection: item id to allergen ids. Public catalog data. ================ */
export interface ItemAllergenIndex {
  allergensForItems(itemIds: readonly ItemId[]): Promise<ReadonlyMap<ItemId, ReadonlySet<string>>>;
}