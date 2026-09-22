import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../../core/cart.service';
import { CheckoutService } from '../../../core/checkout.service';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  cart = inject(CartService);
  checkout = inject(CheckoutService);

  paying = signal(false);
  errorMessage = signal('');

  async ngOnInit() {
    if (!this.checkout.selectedAddressId() || this.cart.items().length === 0) {
      await this.cart.load();
    }
    if (!this.checkout.selectedAddressId()) {
      this.router.navigateByUrl('/checkout/address');
    }
  }

  async pay() {
    const addressId = this.checkout.selectedAddressId();
    if (!addressId) return;

    this.paying.set(true);
    this.errorMessage.set('');
    try {
      const createRes = await firstValueFrom(
        this.http.post<{ order: Order }>('/api/orders', { addressId })
      );
      const order = createRes.order;

      const payRes = await firstValueFrom(
        this.http.post<{ order: Order }>(`/api/orders/${order._id}`, { action: 'pay' })
      );

      this.cart.clearLocal();
      this.checkout.reset();
      this.router.navigateByUrl(`/order-confirmation/${payRes.order._id}`);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.error || 'Payment could not be completed. Please try again.');
    } finally {
      this.paying.set(false);
    }
  }
}
