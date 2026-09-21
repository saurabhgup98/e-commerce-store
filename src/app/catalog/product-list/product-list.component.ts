import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product, ProductCategory, CATEGORY_LABELS } from '../../shared/models/models';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];
  products = signal<Product[]>([]);
  loading = signal(true);
  activeCategory = signal<ProductCategory | null>(null);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category') as ProductCategory | null;
      this.activeCategory.set(category);
      this.fetchProducts(category);
    });
  }

  selectCategory(category: ProductCategory | null) {
    this.router.navigate(['/products'], { queryParams: category ? { category } : {} });
  }

  private async fetchProducts(category: ProductCategory | null) {
    this.loading.set(true);
    try {
      const url = category ? `/api/products?category=${category}` : '/api/products';
      const res = await firstValueFrom(this.http.get<{ products: Product[] }>(url));
      this.products.set(res.products);
    } finally {
      this.loading.set(false);
    }
  }
}
