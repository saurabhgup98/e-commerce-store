import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Address } from '../../../shared/models/models';
import { CheckoutService } from '../../../core/checkout.service';

@Component({
  selector: 'app-address-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './address-page.component.html',
  styleUrl: './address-page.component.scss',
})
export class AddressPageComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  checkout = inject(CheckoutService);

  addresses = signal<Address[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', Validators.required],
    phone: ['', Validators.required],
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.http.get<{ addresses: Address[] }>('/api/addresses'));
      this.addresses.set(res.addresses);
      const selected = this.checkout.selectedAddressId();
      const preselect = res.addresses.find((a) => a._id === selected) ?? res.addresses.find((a) => a.isDefault) ?? res.addresses[0];
      if (preselect) this.checkout.setAddress(preselect._id);
      if (res.addresses.length === 0) this.showForm.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  select(addressId: string) {
    this.checkout.setAddress(addressId);
  }

  async saveNewAddress() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set('');
    try {
      const res = await firstValueFrom(
        this.http.post<{ address: Address }>('/api/addresses', this.form.getRawValue())
      );
      this.addresses.update((list) => [res.address, ...list]);
      this.checkout.setAddress(res.address._id);
      this.showForm.set(false);
      this.form.reset();
    } catch (err: any) {
      this.errorMessage.set(err?.error?.error || 'Could not save this address.');
    } finally {
      this.saving.set(false);
    }
  }

  continueToPayment() {
    if (!this.checkout.selectedAddressId()) {
      this.errorMessage.set('Please select or add a delivery address.');
      return;
    }
    this.router.navigateByUrl('/checkout/payment');
  }
}
