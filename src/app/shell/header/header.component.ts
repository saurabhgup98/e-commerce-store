import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { FavouritesService } from '../../core/favourites.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  favourites = inject(FavouritesService);
  private router = inject(Router);

  displayName = computed(() => {
    const user = this.auth.currentUser();
    return user ? `${user.firstName}` : '';
  });

  async ngOnInit() {
    await this.auth.loadCurrentUser();
    if (this.auth.isLoggedIn()) {
      await Promise.all([this.cart.load(), this.favourites.load()]);
    }
  }

  async logout() {
    await this.auth.logout();
    this.cart.clearLocal();
    this.favourites.clearLocal();
    this.router.navigateByUrl('/');
  }
}
