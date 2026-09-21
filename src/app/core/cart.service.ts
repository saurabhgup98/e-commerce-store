import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartItem } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly itemCount = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.productId.price * item.quantity, 0)
  );

  async load(): Promise<void> {
    const res = await firstValueFrom(this.http.get<{ items: CartItem[] }>('/api/cart'));
    this._items.set(res.items);
  }

  async add(productId: string, quantity = 1): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ items: CartItem[] }>('/api/cart', { productId, quantity })
    );
    this._items.set(res.items);
  }

  async setQuantity(productId: string, quantity: number): Promise<void> {
    const res = await firstValueFrom(
      this.http.patch<{ items: CartItem[] }>(`/api/cart/${productId}`, { quantity })
    );
    this._items.set(res.items);
  }

  async remove(productId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/cart/${productId}`));
    this._items.update((items) => items.filter((item) => item.productId._id !== productId));
  }

  clearLocal(): void {
    this._items.set([]);
  }
}
