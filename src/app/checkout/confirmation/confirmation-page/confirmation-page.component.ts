import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './confirmation-page.component.html',
  styleUrl: './confirmation-page.component.scss',
})
export class ConfirmationPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = signal(true);

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) return;
    try {
      const res = await firstValueFrom(this.http.get<{ order: Order }>(`/api/orders/${orderId}`));
      this.order.set(res.order);
    } finally {
      this.loading.set(false);
    }
  }
}
