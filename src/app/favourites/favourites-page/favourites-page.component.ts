import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavouritesService } from '../../core/favourites.service';
import { ProductCardComponent } from '../../catalog/product-card/product-card.component';

@Component({
  selector: 'app-favourites-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './favourites-page.component.html',
  styleUrl: './favourites-page.component.scss',
})
export class FavouritesPageComponent implements OnInit {
  favourites = inject(FavouritesService);
  loading = signal(true);

  async ngOnInit() {
    this.loading.set(true);
    try {
      await this.favourites.load();
    } finally {
      this.loading.set(false);
    }
  }
}
