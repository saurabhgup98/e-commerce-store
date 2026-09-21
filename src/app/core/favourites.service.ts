import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class FavouritesService {
  private http = inject(HttpClient);

  private readonly _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();
  readonly ids = computed(() => new Set(this._products().map((p) => p._id)));

  async load(): Promise<void> {
    const res = await firstValueFrom(this.http.get<{ products: Product[] }>('/api/favourites'));
    this._products.set(res.products);
  }

  isFavourite(productId: string): boolean {
    return this.ids().has(productId);
  }

  async toggle(product: Product): Promise<void> {
    const wasFavourite = this.isFavourite(product._id);
    // Optimistic update, rolled back if the request fails.
    if (wasFavourite) {
      this._products.update((list) => list.filter((p) => p._id !== product._id));
    } else {
      this._products.update((list) => [...list, product]);
    }

    try {
      if (wasFavourite) {
        await firstValueFrom(this.http.delete(`/api/favourites/${product._id}`));
      } else {
        await firstValueFrom(this.http.post('/api/favourites', { productId: product._id }));
      }
    } catch (err) {
      if (wasFavourite) {
        this._products.update((list) => [...list, product]);
      } else {
        this._products.update((list) => list.filter((p) => p._id !== product._id));
      }
      throw err;
    }
  }

  clearLocal(): void {
    this._products.set([]);
  }
}
