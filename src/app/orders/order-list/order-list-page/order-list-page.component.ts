import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './order-list-page.component.html',
  styleUrl: './order-list-page.component.scss',
})
export class OrderListPageComponent implements OnInit {
  private http = inject(HttpClient);

  orders = signal<Order[]>([]);
  loading = signal(true);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.http.get<{ orders: Order[] }>('/api/orders'));
      this.orders.set(res.orders);
    } finally {
      this.loading.set(false);
    }
  }
}
