import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'products',
    loadComponent: () =>
      import('./catalog/product-list/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./catalog/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'compare',
    loadComponent: () =>
      import('./compare/compare-page/compare-page.component').then((m) => m.ComparePageComponent),
  },
  {
    path: 'favourites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./favourites/favourites-page/favourites-page.component').then(
        (m) => m.FavouritesPageComponent
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./cart/cart-page/cart-page.component').then((m) => m.CartPageComponent),
  },
  {
    path: 'checkout/address',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./checkout/address/address-page/address-page.component').then(
        (m) => m.AddressPageComponent
      ),
  },
  {
    path: 'checkout/payment',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./checkout/payment/payment-page/payment-page.component').then(
        (m) => m.PaymentPageComponent
      ),
  },
  {
    path: 'order-confirmation/:orderId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./checkout/confirmation/confirmation-page/confirmation-page.component').then(
        (m) => m.ConfirmationPageComponent
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./orders/order-list/order-list-page/order-list-page.component').then(
        (m) => m.OrderListPageComponent
      ),
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./orders/order-detail/order-detail-page/order-detail-page.component').then(
        (m) => m.OrderDetailPageComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  { path: '**', redirectTo: 'products' },
];
