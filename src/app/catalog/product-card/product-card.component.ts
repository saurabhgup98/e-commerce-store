import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../shared/models/models';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { FavouritesService } from '../../core/favourites.service';
import { CompareService } from '../../core/compare.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private router = inject(Router);
  auth = inject(AuthService);
  cart = inject(CartService);
  favourites = inject(FavouritesService);
  compare = inject(CompareService);

  compareMessage = signal('');
  addingToCart = signal(false);

  private requireLogin() {
    this.router.navigate(['/login'], { queryParams: { next: `/products/${this.product._id}` } });
  }

  async toggleFavourite() {
    if (!this.auth.isLoggedIn()) {
      this.requireLogin();
      return;
    }
    await this.favourites.toggle(this.product);
  }

  toggleCompare() {
    if (this.compare.isSelected(this.product._id)) {
      this.compare.remove(this.product._id);
      return;
    }
    const error = this.compare.add(this.product);
    if (error) {
      this.compareMessage.set(error);
      setTimeout(() => this.compareMessage.set(''), 3000);
    }
  }

  async addToCart() {
    if (!this.auth.isLoggedIn()) {
      this.requireLogin();
      return;
    }
    this.addingToCart.set(true);
    try {
      await this.cart.add(this.product._id, 1);
    } finally {
      this.addingToCart.set(false);
    }
  }
}
