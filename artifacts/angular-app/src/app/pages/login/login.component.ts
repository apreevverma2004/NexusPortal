import {
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatRippleModule,
  ],
  template: `
    <div class="login-root">
      <!-- Background shapes -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <div class="login-container fade-in">
        <!-- Branding Panel -->
        <div class="brand-panel">
          <div class="brand-content">
            <div class="brand-icon">
              <mat-icon>hub</mat-icon>
            </div>
            <h1 class="brand-name">NexusPortal</h1>
            <p class="brand-tagline">
              Unified access to your enterprise resources, insights, and tools.
            </p>
            <div class="brand-features">
              <div class="feature-item">
                <mat-icon>verified_user</mat-icon>
                <span>Role-based Access Control</span>
              </div>
              <div class="feature-item">
                <mat-icon>bolt</mat-icon>
                <span>Real-time Data Processing</span>
              </div>
              <div class="feature-item">
                <mat-icon>lock</mat-icon>
                <span>Enterprise-grade Security</span>
              </div>
            </div>
          </div>
          <div class="brand-footer">
            <span>© 2024 NexusPortal. All rights reserved.</span>
          </div>
        </div>

        <!-- Login Form Panel -->
        <div class="form-panel">
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <!-- Demo credentials hint -->
          <div class="demo-hint">
            <mat-icon>info</mat-icon>
            <div>
              <strong>Demo Credentials</strong>
              <span>Admin: <code>admin / admin123</code></span>
              <span>User: <code>alice / user123</code> (or bob, carol)</span>
            </div>
          </div>

          <!-- Progress bar -->
          @if (loading()) {
            <mat-progress-bar mode="indeterminate" class="progress-bar" />
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- User ID -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>User ID</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input
                matInput
                formControlName="userId"
                placeholder="Enter your user ID"
                autocomplete="username"
              />
              @if (loginForm.get('userId')?.invalid && loginForm.get('userId')?.touched) {
                <mat-error>User ID is required</mat-error>
              }
            </mat-form-field>

            <!-- Password -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input
                matInput
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePassword()"
              >
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <!-- Role -->
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Select Role</mat-label>
              <mat-icon matPrefix>badge</mat-icon>
              <mat-select formControlName="role">
                <mat-option value="General User">
                  <mat-icon class="role-icon">person_outline</mat-icon>
                  General User
                </mat-option>
                <mat-option value="Admin">
                  <mat-icon class="role-icon">admin_panel_settings</mat-icon>
                  Administrator
                </mat-option>
              </mat-select>
              @if (loginForm.get('role')?.invalid && loginForm.get('role')?.touched) {
                <mat-error>Role selection is required</mat-error>
              }
            </mat-form-field>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="error-alert fade-in">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Submit Button -->
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-btn"
              [disabled]="loginForm.invalid || loading()"
            >
              @if (loading()) {
                <mat-icon class="spin">autorenew</mat-icon>
                Signing in...
              } @else {
                <mat-icon>login</mat-icon>
                Sign In
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-root {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      .bg-shapes .shape {
        position: absolute;
        border-radius: 50%;
        opacity: 0.08;
        background: white;
      }
      .shape-1 {
        width: 400px;
        height: 400px;
        top: -150px;
        left: -100px;
      }
      .shape-2 {
        width: 300px;
        height: 300px;
        bottom: -100px;
        right: -50px;
        opacity: 0.05 !important;
      }
      .shape-3 {
        width: 200px;
        height: 200px;
        top: 50%;
        right: 20%;
        opacity: 0.04 !important;
      }

      .login-container {
        display: flex;
        width: 100%;
        max-width: 960px;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
        position: relative;
        z-index: 1;
      }

      /* Brand Panel */
      .brand-panel {
        flex: 1;
        background: linear-gradient(160deg, #1a237e 0%, #283593 50%, #1565c0 100%);
        color: white;
        padding: 48px 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 300px;
      }

      .brand-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .brand-icon {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .brand-icon mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: white;
      }

      .brand-name {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.5px;
      }

      .brand-tagline {
        font-size: 14px;
        opacity: 0.8;
        line-height: 1.6;
        margin: 0;
        max-width: 280px;
      }

      .brand-features {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 16px;
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        opacity: 0.85;
      }

      .feature-item mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.9;
      }

      .brand-footer {
        font-size: 12px;
        opacity: 0.5;
      }

      /* Form Panel */
      .form-panel {
        flex: 1;
        background: #ffffff;
        padding: 48px 40px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 380px;
      }

      .form-header h2 {
        font-size: 26px;
        font-weight: 700;
        color: #1a237e;
        margin: 0 0 6px;
      }

      .form-header p {
        font-size: 14px;
        color: #78909c;
        margin: 0;
      }

      .demo-hint {
        display: flex;
        gap: 10px;
        background: #e8eaf6;
        border-left: 3px solid #3f51b5;
        border-radius: 0 8px 8px 0;
        padding: 12px 16px;
        font-size: 12px;
        color: #283593;
        align-items: flex-start;
      }

      .demo-hint mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .demo-hint div {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .demo-hint strong {
        font-size: 12px;
        font-weight: 700;
        display: block;
        margin-bottom: 2px;
      }

      .demo-hint code {
        background: rgba(63, 81, 181, 0.15);
        padding: 1px 5px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
      }

      .progress-bar {
        border-radius: 4px;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-field {
        width: 100%;
      }

      .error-alert {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fce4ec;
        color: #c62828;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 13px;
        border-left: 3px solid #e53935;
      }

      .error-alert mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .submit-btn {
        width: 100%;
        padding: 14px 0 !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        letter-spacing: 0.03em;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spin {
        animation: spin 1s linear infinite;
      }

      .role-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-right: 6px;
        vertical-align: middle;
      }

      @media (max-width: 700px) {
        .login-container {
          flex-direction: column;
        }
        .brand-panel {
          min-width: unset;
          padding: 32px 24px;
        }
        .form-panel {
          min-width: unset;
          padding: 32px 24px;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  loginForm!: FormGroup;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loginForm = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      role: ['General User', Validators.required],
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
