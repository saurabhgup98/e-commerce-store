import { Injectable, signal } from '@angular/core';
import { Product } from '../shared/models/models';

const STORAGE_KEY = 'es_compare_tray';
const MAX_ITEMS = 4;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly _selected = signal<Product[]>(this.readFromStorage());
  readonly selected = this._selected.asReadonly();

  private readFromStorage(): Product[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Product[]) : [];
    } catch {
      return [];
    }
  }

  private persist(products: Product[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // sessionStorage unavailable (private browsing etc) — tray still works
      // for the current page via the in-memory signal, just won't survive reload.
    }
  }

  isSelected(productId: string): boolean {
    return this._selected().some((p) => p._id === productId);
  }

  /** Returns an error message if the product couldn't be added, or null on success. */
  add(product: Product): string | null {
    const current = this._selected();
    if (current.some((p) => p._id === product._id)) return null;
    if (current.length > 0 && current[0].category !== product.category) {
      return 'Clear the tray to compare a different category.';
    }
    if (current.length >= MAX_ITEMS) {
      return `You can compare up to ${MAX_ITEMS} products at a time.`;
    }
    const next = [...current, product];
    this._selected.set(next);
    this.persist(next);
    return null;
  }

  remove(productId: string): void {
    const next = this._selected().filter((p) => p._id !== productId);
    this._selected.set(next);
    this.persist(next);
  }

  clear(): void {
    this._selected.set([]);
    this.persist([]);
  }
}
