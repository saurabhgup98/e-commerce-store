import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent implements OnInit {
  cart = inject(CartService);
  private router = inject(Router);

  loading = signal(true);

  async ngOnInit() {
    this.loading.set(true);
    try {
      await this.cart.load();
    } finally {
      this.loading.set(false);
    }
  }

  async updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    await this.cart.setQuantity(productId, quantity);
  }

  async remove(productId: string) {
    await this.cart.remove(productId);
  }

  checkout() {
    this.router.navigateByUrl('/checkout/address');
  }
}
