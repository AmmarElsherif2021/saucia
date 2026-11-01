import type { ItemId } from '../../domain/IDs';
import { Item } from '../../domain/Item';
export interface ItemRepository {
  findById(id: ItemId): Promise<Item | undefined>;
  findByIds(ids: readonly ItemId[]): Promise<readonly Item[]>;
  save(item: Item): Promise<void>;
}