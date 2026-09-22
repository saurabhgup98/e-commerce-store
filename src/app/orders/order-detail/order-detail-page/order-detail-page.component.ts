import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.scss',
})
export class OrderDetailPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = signal(true);
  working = signal(false);
  errorMessage = signal('');

  canCancel = computed(() => {
    const status = this.order()?.status;
    return status === 'pending_payment' || status === 'confirmed';
  });
  canReturn = computed(() => this.order()?.status === 'confirmed');

  async ngOnInit() {
    await this.fetchOrder();
  }

  private async fetchOrder() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.http.get<{ order: Order }>(`/api/orders/${id}`));
      this.order.set(res.order);
    } finally {
      this.loading.set(false);
    }
  }

  async cancelOrder() {
    const order = this.order();
    if (!order) return;
    this.working.set(true);
    this.errorMessage.set('');
    try {
      const res = await firstValueFrom(
        this.http.post<{ order: Order }>(`/api/orders/${order._id}`, { action: 'cancel' })
      );
      this.order.set(res.order);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.error || 'Could not cancel this order.');
    } finally {
      this.working.set(false);
    }
  }

  async returnOrder() {
    const order = this.order();
    if (!order) return;
    this.working.set(true);
    this.errorMessage.set('');
    try {
      const res = await firstValueFrom(
        this.http.post<{ order: Order }>(`/api/orders/${order._id}`, { action: 'return' })
      );
      this.order.set(res.order);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.error || 'Could not start a return for this order.');
    } finally {
      this.working.set(false);
    }
  }
}
