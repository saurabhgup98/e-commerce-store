import { Injectable, signal } from '@angular/core';

// Holds the in-progress checkout selection between the address and payment
// steps. Deliberately just in-memory (a page refresh mid-checkout restarts
// at the cart) — this is a throwaway sandbox flow, not a production wizard.
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  readonly selectedAddressId = signal<string | null>(null);

  setAddress(addressId: string) {
    this.selectedAddressId.set(addressId);
  }

  reset() {
    this.selectedAddressId.set(null);
  }
}
