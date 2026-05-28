import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../models/user.model';

const TOKEN_KEY = 'nexus_token';
const USER_KEY = 'nexus_user';
const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  private _user = signal<User | null>(
    (() => {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    })()
  );

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token() && !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this._token.set(response.token);
          this._user.set(response.user);
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }),
        catchError((err) => {
          const message =
            err.error?.error || 'Login failed. Please try again.';
          return throwError(() => new Error(message));
        })
      );
  }

  logout(): void {
    const token = this._token();
    if (token) {
      this.http
        .post(`${API_BASE}/auth/logout`, {})
        .subscribe({ error: () => {} });
    }
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  refreshUser(): Observable<User> {
    return this.http.get<User>(`${API_BASE}/auth/me`).pipe(
      tap((user) => {
        this._user.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }
}
