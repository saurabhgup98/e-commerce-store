import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { FavouritesService } from '../../core/favourites.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private favourites = inject(FavouritesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitting = signal(false);
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    mobile: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set('');
    try {
      const { mobile, password } = this.form.getRawValue();
      await this.auth.login(mobile, password);
      await Promise.all([this.cart.load(), this.favourites.load()]);
      const next = this.route.snapshot.queryParamMap.get('next') || '/products';
      this.router.navigateByUrl(next);
    } catch (err: any) {
      this.errorMessage.set(err?.error?.error || 'Login failed. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
