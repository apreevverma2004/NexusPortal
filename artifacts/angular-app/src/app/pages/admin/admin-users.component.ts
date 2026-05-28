import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import {
  UserService,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

// ─── Inline Dialog Component ─────────────────────────────────────────────────
import {
  Component as DialogComp,
  Inject,
  signal as dSignal,
  inject as dInject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@DialogComp({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="dialog-root">
      <div class="dialog-header">
        <mat-icon>{{ data.mode === 'create' ? 'person_add' : 'edit' }}</mat-icon>
        <h2>{{ data.mode === 'create' ? 'Add New User' : 'Edit User' }}</h2>
      </div>

      @if (saving()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (errorMsg()) {
        <div class="error-msg">
          <mat-icon>error_outline</mat-icon>
          {{ errorMsg() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSave()" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>User ID</mat-label>
            <input matInput formControlName="userId" [readonly]="data.mode === 'edit'" />
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ data.mode === 'create' ? 'Password' : 'New Password (optional)' }}</mat-label>
            <input matInput formControlName="password" type="password" />
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <input matInput formControlName="department" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="General User">General User</mat-option>
              <mat-option value="Admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="onCancel()">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || saving()"
          >
            {{ data.mode === 'create' ? 'Create User' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-root {
      min-width: 560px;
      overflow: hidden;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 16px;
      background: linear-gradient(135deg, #1a237e, #1565c0);
      color: white;
    }
    .dialog-header mat-icon { font-size: 26px; width: 26px; height: 26px; }
    .dialog-header h2 { margin: 0; font-size: 18px; font-weight: 700; }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fce4ec;
      color: #c62828;
      padding: 10px 24px;
      font-size: 13px;
    }
    .error-msg mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .dialog-form {
      padding: 20px 24px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 0 20px;
      border-top: 1px solid #e0e7f0;
      margin-top: 8px;
    }
    @media (max-width: 600px) {
      .dialog-root { min-width: 320px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class UserDialogComponent {
  dialogRef = dInject(MatDialogRef<UserDialogComponent>);
  userService = dInject(UserService);
  @Inject(MAT_DIALOG_DATA) data: { mode: 'create' | 'edit'; user?: User } = dInject(MAT_DIALOG_DATA);
  private fb = dInject(FormBuilder);

  saving = dSignal(false);
  errorMsg = dSignal('');

  form = this.fb.group({
    userId: [this.data.user?.userId ?? '', Validators.required],
    name: [this.data.user?.name ?? '', Validators.required],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    password: [
      '',
      this.data.mode === 'create' ? Validators.required : [],
    ],
    department: [this.data.user?.department ?? '', Validators.required],
    role: [this.data.user?.role ?? 'General User', Validators.required],
    status: [this.data.user?.status ?? 'active', Validators.required],
  });

  onSave(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const val = this.form.value;

    if (this.data.mode === 'create') {
      const payload: CreateUserPayload = {
        userId: val.userId!,
        name: val.name!,
        email: val.email!,
        password: val.password!,
        department: val.department!,
        role: val.role!,
        status: val.status!,
      };
      this.userService.createUser(payload).subscribe({
        next: (user) => { this.saving.set(false); this.dialogRef.close(user); },
        error: (err) => {
          this.saving.set(false);
          this.errorMsg.set(err.error?.error ?? 'Failed to create user');
        },
      });
    } else {
      const payload: UpdateUserPayload = {
        name: val.name!,
        email: val.email!,
        department: val.department!,
        role: val.role!,
        status: val.status!,
      };
      if (val.password) payload.password = val.password;
      this.userService.updateUser(this.data.user!.userId, payload).subscribe({
        next: (user) => { this.saving.set(false); this.dialogRef.close(user); },
        error: (err) => {
          this.saving.set(false);
          this.errorMsg.set(err.error?.error ?? 'Failed to update user');
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

// ─── Admin Users Main Component ───────────────────────────────────────────────
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="admin-root">
      <!-- Navbar -->
      <mat-toolbar class="navbar">
        <div class="navbar-left">
          <button mat-icon-button routerLink="/dashboard" matTooltip="Back to Dashboard" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-icon class="logo-icon">hub</mat-icon>
          <span class="logo-text">NexusPortal</span>
          <span class="page-sep">|</span>
          <span class="page-title">User Management</span>
        </div>
        <div class="navbar-right">
          <div class="admin-badge">
            <mat-icon>admin_panel_settings</mat-icon>
            Admin Console
          </div>
        </div>
      </mat-toolbar>

      <div class="admin-body">
        <!-- Page Header -->
        <div class="page-header fade-in">
          <div class="page-header-info">
            <h1>User Management</h1>
            <p>Manage user accounts, roles, and access levels across the platform.</p>
          </div>
          <button mat-raised-button color="primary" (click)="openCreateDialog()" class="create-btn">
            <mat-icon>person_add</mat-icon>
            Add User
          </button>
        </div>

        <!-- Stats Row -->
        <div class="stats-row fade-in" style="animation-delay: 0.05s">
          <div class="stat-card">
            <div class="stat-icon blue">
              <mat-icon>group</mat-icon>
            </div>
            <div>
              <div class="stat-num">{{ users().length }}</div>
              <div class="stat-lbl">Total Users</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div>
              <div class="stat-num">{{ activeCount() }}</div>
              <div class="stat-lbl">Active</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div>
              <div class="stat-num">{{ adminCount() }}</div>
              <div class="stat-lbl">Admins</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">
              <mat-icon>people_outline</mat-icon>
            </div>
            <div>
              <div class="stat-num">{{ generalCount() }}</div>
              <div class="stat-lbl">General Users</div>
            </div>
          </div>
        </div>

        <!-- Users Table Card -->
        <mat-card class="table-card fade-in" style="animation-delay: 0.1s">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar mode="indeterminate" class="top-bar" />
            }

            <div class="table-toolbar">
              <div class="search-wrap">
                <mat-icon>search</mat-icon>
                <input
                  class="search-input"
                  [(ngModel)]="searchQuery"
                  placeholder="Search users by name, email, department..."
                />
                @if (searchQuery) {
                  <button class="clear-btn" (click)="searchQuery = ''">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </div>
              <span class="user-count">{{ filteredUsers().length }} of {{ users().length }} users</span>
            </div>

            <div class="table-wrapper">
              <table mat-table [dataSource]="filteredUsers()" class="users-table">

                <!-- Avatar + Name -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>User</th>
                  <td mat-cell *matCellDef="let u">
                    <div class="user-cell">
                      <div class="user-avatar" [class.admin]="u.role === 'Admin'">
                        {{ nameInitials(u.name) }}
                      </div>
                      <div>
                        <div class="user-name">{{ u.name }}</div>
                        <div class="user-id">&#64;{{ u.userId }}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Email -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let u">{{ u.email }}</td>
                </ng-container>

                <!-- Role -->
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let u">
                    <span class="role-badge" [class.admin]="u.role === 'Admin'">
                      <mat-icon>{{ u.role === 'Admin' ? 'admin_panel_settings' : 'person_outline' }}</mat-icon>
                      {{ u.role }}
                    </span>
                  </td>
                </ng-container>

                <!-- Department -->
                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let u">{{ u.department }}</td>
                </ng-container>

                <!-- Status -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let u">
                    <span class="status-badge {{ u.status === 'active' ? 'completed' : 'rejected' }}">
                      <mat-icon>{{ u.status === 'active' ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ u.status | titlecase }}
                    </span>
                  </td>
                </ng-container>

                <!-- Created -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Joined</th>
                  <td mat-cell *matCellDef="let u">{{ u.createdAt }}</td>
                </ng-container>

                <!-- Actions -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let u">
                    <div class="action-btns">
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="openEditDialog(u)"
                        matTooltip="Edit user"
                        [disabled]="u.userId === 'admin'"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        color="warn"
                        (click)="deleteUser(u)"
                        matTooltip="Delete user"
                        [disabled]="u.userId === 'admin'"
                      >
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns" class="table-row"></tr>
              </table>

              @if (!loading() && filteredUsers().length === 0) {
                <div class="empty-state">
                  <mat-icon>search_off</mat-icon>
                  <p>No users match your search</p>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-root {
      min-height: 100vh;
      background: #f0f4f8;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: #1a237e;
      color: white;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(26,35,126,0.4);
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .back-btn { color: rgba(255,255,255,0.8) !important; }
    .logo-icon { font-size: 24px; width: 24px; height: 24px; color: #90caf9; }
    .logo-text { font-size: 18px; font-weight: 700; }
    .page-sep { opacity: 0.3; font-size: 20px; }
    .page-title { font-size: 15px; font-weight: 500; opacity: 0.9; }

    .navbar-right { display: flex; align-items: center; }
    .admin-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(124, 77, 255, 0.2);
      border: 1px solid rgba(179, 136, 255, 0.4);
      color: #ce93d8;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .admin-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .admin-body {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 20px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-header-info h1 {
      font-size: 26px;
      font-weight: 800;
      color: #1a237e;
      margin: 0 0 4px;
    }

    .page-header-info p {
      font-size: 13px;
      color: #78909c;
      margin: 0;
    }

    .create-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 12px !important;
      font-weight: 600 !important;
    }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(26,35,126,0.06);
      border: 1px solid rgba(26,35,126,0.05);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .stat-icon.blue { background: #e8eaf6; color: #3f51b5; }
    .stat-icon.green { background: #e8f5e9; color: #388e3c; }
    .stat-icon.purple { background: #ede7f6; color: #7c4dff; }
    .stat-icon.orange { background: #fff3e0; color: #f57c00; }

    .stat-num {
      font-size: 28px;
      font-weight: 800;
      color: #1a237e;
      line-height: 1;
    }

    .stat-lbl {
      font-size: 12px;
      color: #78909c;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    /* Table Card */
    .table-card {
      border-radius: 20px !important;
      box-shadow: 0 4px 20px rgba(26,35,126,0.08) !important;
      border: 1px solid rgba(26,35,126,0.06);
      overflow: hidden;
    }

    .top-bar { border-radius: 0; }

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0 12px;
      gap: 12px;
    }

    .search-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f5f7ff;
      border: 1px solid #e8eaf6;
      border-radius: 12px;
      padding: 8px 14px;
      flex: 1;
      max-width: 440px;
    }

    .search-wrap mat-icon { color: #90a4ae; font-size: 20px; width: 20px; height: 20px; }

    .search-input {
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: #37474f;
      flex: 1;
      font-family: 'Inter', sans-serif;
    }

    .clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      color: #90a4ae;
    }

    .clear-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .user-count {
      font-size: 13px;
      color: #78909c;
      white-space: nowrap;
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e0e7f0;
    }

    .users-table {
      width: 100%;
      background: white;
    }

    .users-table th {
      background: #f5f7ff;
      color: #3f51b5;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 14px 16px;
      border-bottom: 2px solid #e8eaf6;
    }

    .users-table td {
      padding: 14px 16px;
      font-size: 13px;
      color: #37474f;
      border-bottom: 1px solid #f0f4f8;
    }

    .table-row:hover td { background: #f8faff; }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1a237e, #1565c0);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-avatar.admin {
      background: linear-gradient(135deg, #6a1b9a, #7c4dff);
    }

    .user-name { font-weight: 600; color: #1a237e; font-size: 13px; }
    .user-id { font-size: 11px; color: #90a4ae; }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      background: #e3f2fd;
      color: #1565c0;
    }

    .role-badge.admin {
      background: #ede7f6;
      color: #7c4dff;
    }

    .role-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .action-btns {
      display: flex;
      gap: 4px;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #90a4ae;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #cfd8dc;
    }
  `],
})
export class AdminUsersComponent implements OnInit {
  auth = inject(AuthService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  loading = signal(false);
  users = signal<User[]>([]);
  searchQuery = '';

  columns = ['name', 'email', 'role', 'department', 'status', 'createdAt', 'actions'];

  activeCount = computed(() => this.users().filter((u) => u.status === 'active').length);
  adminCount = computed(() => this.users().filter((u) => u.role === 'Admin').length);
  generalCount = computed(() => this.users().filter((u) => u.role === 'General User').length);

  filteredUsers = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.users();
    return this.users().filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserDialogComponent, {
      data: { mode: 'create' },
      disableClose: true,
    });
    ref.afterClosed().subscribe((user: User | null) => {
      if (user) {
        this.users.update((u) => [...u, user]);
        this.snack.open(`User "${user.name}" created successfully`, 'Dismiss', { duration: 3000 });
      }
    });
  }

  openEditDialog(user: User): void {
    const ref = this.dialog.open(UserDialogComponent, {
      data: { mode: 'edit', user },
      disableClose: true,
    });
    ref.afterClosed().subscribe((updated: User | null) => {
      if (updated) {
        this.users.update((list) =>
          list.map((u) => (u.userId === updated.userId ? updated : u))
        );
        this.snack.open(`User "${updated.name}" updated`, 'Dismiss', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    this.userService.deleteUser(user.userId).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.userId !== user.userId));
        this.snack.open(`User "${user.name}" deleted`, 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err.error?.error ?? 'Failed to delete user', 'Dismiss', { duration: 4000 });
      },
    });
  }

  nameInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
