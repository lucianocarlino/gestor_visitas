/**
 * ConsumibleService - Business logic for Consumables and low stock alerts
 * Adheres strictly to SDD and Clean Code standards
 */

import { Consumible } from '../../types/domain';
import { ConflictError, NotFoundError, ValidationError } from '../../types/errors';
import { ConsumibleRepository, IConsumibleRepository } from '../repositories/ConsumibleRepository';
import { DatabaseStore } from '../repositories/DatabaseStore';

export interface LowStockAlert {
  consumible_id: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  deficit: number;
  es_critico: boolean;
}

export class ConsumibleService {
  private repo: IConsumibleRepository;
  private db = DatabaseStore.getInstance();

  constructor(repo?: IConsumibleRepository) {
    this.repo = repo || new ConsumibleRepository();
  }

  public getAll(): Consumible[] {
    return this.repo.findAll();
  }

  public getById(id: string): Consumible {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundError('Consumible', id);
    return item;
  }

  public create(data: Omit<Consumible, 'id'> & { id?: string }): Consumible {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new ValidationError('Nombre del consumible is required');
    }
    const id = data.id || `CSM-${Date.now()}`;
    if (this.repo.findById(id)) {
      throw new ConflictError(`Consumible with ID ${id} already exists`);
    }

    const item: Consumible = {
      id,
      nombre: data.nombre,
      stock: Math.max(0, data.stock || 0),
      es_critico: Boolean(data.es_critico),
      stock_minimo: Math.max(1, data.stock_minimo || 5),
    };
    const saved = this.repo.save(item);

    this.db.addAuditLog({
      userId: 'admin',
      userName: 'Administrador del Sistema',
      userRole: 'admin',
      category: 'consumable',
      action: 'CREATE',
      targetId: saved.id,
      targetName: saved.nombre,
      details: `Creación de nuevo consumible en catálogo con stock inicial de ${saved.stock} uds y mínimo de ${saved.stock_minimo} uds.`,
      previousValue: null,
      newValue: `${saved.stock} uds (Min: ${saved.stock_minimo})`,
    });

    return saved;
  }

  public update(id: string, data: Partial<Consumible>): Consumible {
    const existing = this.getById(id);
    const prevMin = existing.stock_minimo;
    const prevStock = existing.stock;
    const updated: Consumible = {
      ...existing,
      ...data,
      id: existing.id,
    };
    const saved = this.repo.save(updated);

    this.db.addAuditLog({
      userId: 'admin',
      userName: 'Administrador del Sistema',
      userRole: 'admin',
      category: 'consumable',
      action: data.stock_minimo !== undefined && data.stock_minimo !== prevMin ? 'THRESHOLD_CHANGE' : 'UPDATE',
      targetId: saved.id,
      targetName: saved.nombre,
      details: `Actualización de parámetros: Mínimo requerido modificado de ${prevMin} a ${saved.stock_minimo} uds. Stock en depósito: ${saved.stock} uds.`,
      previousValue: `${prevStock} uds (Min: ${prevMin})`,
      newValue: `${saved.stock} uds (Min: ${saved.stock_minimo})`,
    });

    return saved;
  }

  public delete(id: string): boolean {
    const item = this.getById(id);
    const res = this.repo.delete(id);
    if (res) {
      this.db.addAuditLog({
        userId: 'admin',
        userName: 'Administrador del Sistema',
        userRole: 'admin',
        category: 'consumable',
        action: 'DELETE',
        targetId: item.id,
        targetName: item.nombre,
        details: `Eliminación de consumible del catálogo maestro.`,
        previousValue: item.nombre,
        newValue: null,
      });
    }
    return res;
  }

  public toggleCritical(id: string): Consumible {
    const existing = this.getById(id);
    const prevCrit = existing.es_critico;
    existing.es_critico = !existing.es_critico;
    const saved = this.repo.save(existing);

    this.db.addAuditLog({
      userId: 'admin',
      userName: 'Administrador del Sistema',
      userRole: 'admin',
      category: 'consumable',
      action: 'CRITICAL_TOGGLE',
      targetId: saved.id,
      targetName: saved.nombre,
      details: `Modificación de prioridad crítica: ${prevCrit ? 'Desmarcado de crítico' : 'Marcado como Ítem Crítico'}.`,
      previousValue: prevCrit ? 'Crítico' : 'Estándar',
      newValue: saved.es_critico ? 'Crítico' : 'Estándar',
    });

    return saved;
  }

  public restock(id: string, amount: number): Consumible {
    if (amount <= 0) {
      throw new ValidationError('Restock amount must be greater than 0');
    }
    const existing = this.getById(id);
    const prevStock = existing.stock;
    existing.stock += amount;
    const saved = this.repo.save(existing);

    this.db.addAuditLog({
      userId: 'TEC-01',
      userName: 'Operador / Técnico',
      userRole: 'tecnico',
      category: 'consumable',
      action: 'RESTOCK',
      targetId: saved.id,
      targetName: saved.nombre,
      details: `Ingreso físico de stock: +${amount} unidades añadidas al depósito. Stock final: ${saved.stock} uds.`,
      previousValue: `${prevStock} uds`,
      newValue: `${saved.stock} uds`,
      metadata: { addedAmount: amount },
    });

    return saved;
  }

  public getLowStockAlerts(): LowStockAlert[] {
    const items = this.repo.findAll();
    const alerts: LowStockAlert[] = [];

    for (const item of items) {
      if (item.stock < item.stock_minimo) {
        alerts.push({
          consumible_id: item.id,
          nombre: item.nombre,
          stock_actual: item.stock,
          stock_minimo: item.stock_minimo,
          deficit: item.stock_minimo - item.stock,
          es_critico: item.es_critico,
        });
      }
    }

    // Critical low items first
    return alerts.sort((a, b) => {
      if (a.es_critico !== b.es_critico) return a.es_critico ? -1 : 1;
      return b.deficit - a.deficit;
    });
  }
}
