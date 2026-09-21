import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Product, CATEGORY_LABELS } from '../../shared/models/models';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { FavouritesService } from '../../core/favourites.service';
import { CompareService } from '../../core/compare.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, KeyValuePipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  auth = inject(AuthService);
  cart = inject(CartService);
  favourites = inject(FavouritesService);
  compare = inject(CompareService);

  categoryLabels = CATEGORY_LABELS;
  product = signal<Product | null>(null);
  loading = signal(true);
  notFound = signal(false);
  compareMessage = signal('');
  working = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.fetchProduct(id);
  }

  private async fetchProduct(id: string) {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.http.get<{ product: Product }>(`/api/products/${id}`));
      this.product.set(res.product);
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private requireLogin(next: string) {
    this.router.navigate(['/login'], { queryParams: { next } });
  }

  async toggleFavourite() {
    const product = this.product();
    if (!product) return;
    if (!this.auth.isLoggedIn()) {
      this.requireLogin(`/products/${product._id}`);
      return;
    }
    await this.favourites.toggle(product);
  }

  toggleCompare() {
    const product = this.product();
    if (!product) return;
    if (this.compare.isSelected(product._id)) {
      this.compare.remove(product._id);
      return;
    }
    const error = this.compare.add(product);
    if (error) {
      this.compareMessage.set(error);
      setTimeout(() => this.compareMessage.set(''), 3000);
    }
  }

  async addToCart() {
    const product = this.product();
    if (!product) return;
    if (!this.auth.isLoggedIn()) {
      this.requireLogin(`/products/${product._id}`);
      return;
    }
    this.working.set(true);
    try {
      await this.cart.add(product._id, 1);
    } finally {
      this.working.set(false);
    }
  }

  async buyNow() {
    const product = this.product();
    if (!product) return;
    if (!this.auth.isLoggedIn()) {
      this.requireLogin(`/products/${product._id}`);
      return;
    }
    this.working.set(true);
    try {
      await this.cart.add(product._id, 1);
      this.router.navigateByUrl('/checkout/address');
    } finally {
      this.working.set(false);
    }
  }
}
