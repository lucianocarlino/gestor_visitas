/**
 * ConsumibleRepository - Data Access Layer for Spare Parts & Consumables
 */

import { Consumible } from '../../types/domain';
import { DatabaseStore } from './DatabaseStore';

export interface IConsumibleRepository {
  findAll(): Consumible[];
  findById(id: string): Consumible | null;
  save(consumible: Consumible): Consumible;
  delete(id: string): boolean;
  updateStock(id: string, newStock: number): Consumible | null;
}

export class ConsumibleRepository implements IConsumibleRepository {
  private store = DatabaseStore.getInstance();

  public findAll(): Consumible[] {
    return Array.from(this.store.consumibles.values());
  }

  public findById(id: string): Consumible | null {
    return this.store.consumibles.get(id) || null;
  }

  public save(consumible: Consumible): Consumible {
    this.store.consumibles.set(consumible.id, consumible);
    return consumible;
  }

  public delete(id: string): boolean {
    return this.store.consumibles.delete(id);
  }

  public updateStock(id: string, newStock: number): Consumible | null {
    const item = this.store.consumibles.get(id);
    if (!item) return null;
    item.stock = newStock;
    this.store.consumibles.set(id, item);
    return item;
  }
}
