import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly _currentUser = signal<User | null>(null);
  private readonly _loaded = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly loaded = this._loaded.asReadonly();

  async loadCurrentUser(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<{ user: User | null }>('/api/auth/me'));
      this._currentUser.set(res.user);
    } catch {
      this._currentUser.set(null);
    } finally {
      this._loaded.set(true);
    }
  }

  async login(mobile: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ user: User }>('/api/auth/login', { mobile, password })
    );
    this._currentUser.set(res.user);
  }

  async signup(mobile: string, password: string, firstName: string, lastName: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ user: User }>('/api/auth/signup', { mobile, password, firstName, lastName })
    );
    this._currentUser.set(res.user);
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {}));
    this._currentUser.set(null);
  }
}
