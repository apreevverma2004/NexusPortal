import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { AuthService } from '../../core/services/auth.service';
import { RecordsService } from '../../core/services/records.service';
import { DataRecord } from '../../core/models/record.model';

@Component({
  selector: 'app-dashboard',
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
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSliderModule,
  ],
  template: `
    <div class="dashboard-root">
      <!-- Top Navbar -->
      <mat-toolbar class="navbar">
        <div class="navbar-left">
          <mat-icon class="logo-icon">hub</mat-icon>
          <span class="logo-text">NexusPortal</span>
        </div>
        <div class="navbar-right">
          @if (auth.isAdmin()) {
            <button mat-stroked-button color="primary" routerLink="/admin" class="admin-btn">
              <mat-icon>admin_panel_settings</mat-icon>
              User Management
            </button>
          }

          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-btn">
            <div class="avatar">{{ initials() }}</div>
          </button>
          <mat-menu #userMenu="matMenu" xPosition="before">
            <div class="user-menu-header">
              <div class="menu-avatar">{{ initials() }}</div>
              <div>
                <div class="menu-name">{{ auth.user()?.name }}</div>
                <div class="menu-role">{{ auth.user()?.role }}</div>
              </div>
            </div>
            <mat-divider />
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Sign Out
            </button>
          </mat-menu>
        </div>
      </mat-toolbar>

      <div class="dashboard-body">

        <!-- User Profile Card -->
        <div class="profile-section fade-in">
          <mat-card class="profile-card">
            <mat-card-content>
              <div class="profile-layout">
                <div class="profile-avatar-wrap">
                  <div class="profile-avatar">{{ initials() }}</div>
                  <div class="status-dot" [class.admin]="auth.isAdmin()"></div>
                </div>
                <div class="profile-info">
                  <h2>{{ auth.user()?.name }}</h2>
                  <div class="profile-meta">
                    <span class="role-chip" [class.admin]="auth.isAdmin()">
                      <mat-icon>{{ auth.isAdmin() ? 'admin_panel_settings' : 'person_outline' }}</mat-icon>
                      {{ auth.user()?.role }}
                    </span>
                    <span class="dept-chip">
                      <mat-icon>business</mat-icon>
                      {{ auth.user()?.department }}
                    </span>
                  </div>
                  <div class="profile-details">
                    <div class="detail-item">
                      <mat-icon>alternate_email</mat-icon>
                      <span>{{ auth.user()?.userId }}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>email</mat-icon>
                      <span>{{ auth.user()?.email }}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>calendar_today</mat-icon>
                      <span>Member since {{ auth.user()?.createdAt }}</span>
                    </div>
                  </div>
                </div>
                <div class="profile-stats">
                  <div class="stat-box">
                    <div class="stat-value">{{ totalRecords() }}</div>
                    <div class="stat-label">Total Records</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">{{ completedCount() }}</div>
                    <div class="stat-label">Completed</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-value">{{ inProgressCount() }}</div>
                    <div class="stat-label">In Progress</div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Records Section -->
        <div class="records-section fade-in" style="animation-delay: 0.1s">
          <mat-card class="records-card">
            <mat-card-header>
              <div class="records-header">
                <div class="records-title">
                  <mat-icon>table_rows</mat-icon>
                  <div>
                    <h3>{{ auth.isAdmin() ? 'All Records' : 'My Records' }}</h3>
                    <p>{{ auth.isAdmin() ? 'System-wide access — viewing all records' : 'Showing records assigned to you' }}</p>
                  </div>
                </div>
                <div class="records-actions">
                  <!-- Delay Slider -->
                  <div class="delay-control">
                    <div class="delay-label">
                      <mat-icon>timer</mat-icon>
                      <span>API Delay: {{ delayMs() }}ms</span>
                      <span class="delay-hint" matTooltip="Simulates async API processing delay">
                        <mat-icon>help_outline</mat-icon>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="500"
                      [value]="delayMs()"
                      (input)="onDelayChange($event)"
                      class="delay-slider"
                    />
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    (click)="loadRecords()"
                    [disabled]="loading()"
                    class="refresh-btn"
                  >
                    <mat-icon [class.spin]="loading()">refresh</mat-icon>
                    {{ loading() ? 'Loading...' : 'Refresh' }}
                  </button>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content>
              <!-- Loading State -->
              @if (loading()) {
                <div class="loading-state">
                  <mat-progress-bar mode="indeterminate" />
                  <div class="shimmer-rows">
                    @for (i of [1,2,3,4,5]; track i) {
                      <div class="shimmer-row">
                        <div class="shimmer shimmer-cell w-40"></div>
                        <div class="shimmer shimmer-cell w-20"></div>
                        <div class="shimmer shimmer-cell w-16"></div>
                        <div class="shimmer shimmer-cell w-16"></div>
                        <div class="shimmer shimmer-cell w-24"></div>
                      </div>
                    }
                  </div>
                  <div class="loading-msg">
                    <mat-progress-spinner diameter="24" mode="indeterminate" />
                    <span>Fetching records{{ delayMs() > 0 ? ' (delay: ' + delayMs() + 'ms)' : '' }}...</span>
                  </div>
                </div>
              }

              <!-- Records Table -->
              @if (!loading() && records().length > 0) {
                <div class="filter-bar">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search records</mat-label>
                    <mat-icon matPrefix>search</mat-icon>
                    <input matInput [(ngModel)]="searchQuery" placeholder="Title, category, department..." />
                    @if (searchQuery) {
                      <button mat-icon-button matSuffix (click)="searchQuery = ''">
                        <mat-icon>close</mat-icon>
                      </button>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Filter by status</mat-label>
                    <mat-select [(ngModel)]="statusFilter">
                      <mat-option value="">All Statuses</mat-option>
                      <mat-option value="pending">Pending</mat-option>
                      <mat-option value="in-progress">In Progress</mat-option>
                      <mat-option value="completed">Completed</mat-option>
                      <mat-option value="rejected">Rejected</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <div class="record-count">
                    <mat-icon>info_outline</mat-icon>
                    {{ filteredRecords().length }} of {{ records().length }} records
                  </div>
                </div>

                <div class="table-wrapper">
                  <table mat-table [dataSource]="filteredRecords()" class="records-table">

                    <!-- ID -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>#</th>
                      <td mat-cell *matCellDef="let row">{{ row.id }}</td>
                    </ng-container>

                    <!-- Title -->
                    <ng-container matColumnDef="title">
                      <th mat-header-cell *matHeaderCellDef>Title</th>
                      <td mat-cell *matCellDef="let row">
                        <div class="title-cell">
                          <span class="record-title">{{ row.title }}</span>
                          <span class="record-desc">{{ row.description }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Category -->
                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>Category</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="category-tag">{{ row.category }}</span>
                      </td>
                    </ng-container>

                    <!-- Status -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="status-badge {{ row.status }}">
                          <mat-icon>{{ statusIcon(row.status) }}</mat-icon>
                          {{ row.status | titlecase }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Priority -->
                    <ng-container matColumnDef="priority">
                      <th mat-header-cell *matHeaderCellDef>Priority</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="priority-badge {{ row.priority }}">{{ row.priority | uppercase }}</span>
                      </td>
                    </ng-container>

                    <!-- Department -->
                    <ng-container matColumnDef="department">
                      <th mat-header-cell *matHeaderCellDef>Department</th>
                      <td mat-cell *matCellDef="let row">{{ row.department }}</td>
                    </ng-container>

                    <!-- Access Level -->
                    <ng-container matColumnDef="accessLevel">
                      <th mat-header-cell *matHeaderCellDef>Access</th>
                      <td mat-cell *matCellDef="let row">
                        <span class="access-badge {{ row.accessLevel }}">
                          <mat-icon>{{ accessIcon(row.accessLevel) }}</mat-icon>
                          {{ row.accessLevel | titlecase }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Updated -->
                    <ng-container matColumnDef="updatedAt">
                      <th mat-header-cell *matHeaderCellDef>Last Updated</th>
                      <td mat-cell *matCellDef="let row">{{ row.updatedAt }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr
                      mat-row
                      *matRowDef="let row; columns: displayedColumns"
                      class="table-row"
                    ></tr>
                  </table>
                </div>
              }

              <!-- Empty State -->
              @if (!loading() && records().length === 0) {
                <div class="empty-state">
                  <mat-icon>inbox</mat-icon>
                  <h4>No records found</h4>
                  <p>No records have been assigned to your account yet.</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-root {
        min-height: 100vh;
        background: #f0f4f8;
        display: flex;
        flex-direction: column;
      }

      /* Navbar */
      .navbar {
        background: #1a237e;
        color: white;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 12px rgba(26, 35, 126, 0.4);
      }

      .navbar-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #90caf9;
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.3px;
      }

      .navbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .admin-btn {
        color: #90caf9 !important;
        border-color: rgba(144, 202, 249, 0.4) !important;
        font-size: 13px !important;
      }

      .user-btn {
        padding: 0 !important;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #42a5f5, #7c4dff);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }

      .user-menu-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        min-width: 220px;
      }

      .menu-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #42a5f5, #7c4dff);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 700;
        flex-shrink: 0;
      }

      .menu-name {
        font-weight: 600;
        font-size: 14px;
        color: #1a1a2e;
      }

      .menu-role {
        font-size: 12px;
        color: #78909c;
      }

      /* Dashboard Body */
      .dashboard-body {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px 20px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* Profile Card */
      .profile-card {
        border-radius: 20px !important;
        box-shadow: 0 4px 20px rgba(26, 35, 126, 0.08) !important;
        border: 1px solid rgba(26, 35, 126, 0.06);
      }

      .profile-layout {
        display: flex;
        align-items: flex-start;
        gap: 24px;
        padding: 8px 0;
      }

      .profile-avatar-wrap {
        position: relative;
        flex-shrink: 0;
      }

      .profile-avatar {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: linear-gradient(135deg, #1a237e, #1565c0);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
      }

      .status-dot {
        position: absolute;
        bottom: 4px;
        right: 4px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #43a047;
        border: 2px solid white;
      }

      .status-dot.admin {
        background: #7c4dff;
      }

      .profile-info {
        flex: 1;
        min-width: 0;
      }

      .profile-info h2 {
        font-size: 22px;
        font-weight: 700;
        color: #1a237e;
        margin: 0 0 10px;
      }

      .profile-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .role-chip,
      .dept-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      .role-chip {
        background: #e8eaf6;
        color: #3f51b5;
      }

      .role-chip.admin {
        background: #ede7f6;
        color: #6a1b9a;
      }

      .role-chip mat-icon,
      .dept-chip mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .dept-chip {
        background: #e3f2fd;
        color: #1565c0;
      }

      .profile-details {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #546e7a;
      }

      .detail-item mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #90a4ae;
      }

      .profile-stats {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
      }

      .stat-box {
        background: linear-gradient(135deg, #f5f7ff, #eef2ff);
        border: 1px solid #c5cae9;
        border-radius: 12px;
        padding: 16px 20px;
        text-align: center;
        min-width: 80px;
      }

      .stat-value {
        font-size: 26px;
        font-weight: 800;
        color: #1a237e;
        line-height: 1;
      }

      .stat-label {
        font-size: 11px;
        color: #78909c;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 4px;
      }

      /* Records Card */
      .records-card {
        border-radius: 20px !important;
        box-shadow: 0 4px 20px rgba(26, 35, 126, 0.08) !important;
        border: 1px solid rgba(26, 35, 126, 0.06);
      }

      .records-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        padding: 4px 0;
        gap: 16px;
        flex-wrap: wrap;
      }

      .records-title {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .records-title mat-icon {
        color: #1a237e;
        font-size: 28px;
        width: 28px;
        height: 28px;
        margin-top: 4px;
      }

      .records-title h3 {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 700;
        color: #1a237e;
      }

      .records-title p {
        margin: 0;
        font-size: 12px;
        color: #78909c;
      }

      .records-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .delay-control {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 220px;
      }

      .delay-label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #546e7a;
        font-weight: 500;
      }

      .delay-label mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }

      .delay-hint mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #90a4ae;
        cursor: help;
      }

      .delay-slider {
        width: 100%;
        accent-color: #1a237e;
        cursor: pointer;
      }

      .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }

      /* Loading */
      .loading-state {
        padding: 16px 0;
      }

      .shimmer-rows {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .shimmer-row {
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f4f8;
      }

      .shimmer-cell {
        height: 18px;
        flex-shrink: 0;
      }

      .w-40 { width: 40%; }
      .w-20 { width: 15%; }
      .w-16 { width: 12%; }
      .w-24 { width: 18%; }

      .loading-msg {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 24px;
        font-size: 13px;
        color: #78909c;
      }

      /* Filter Bar */
      .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 220px;
        max-width: 400px;
      }

      .filter-field {
        min-width: 180px;
      }

      .record-count {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #78909c;
        margin-left: auto;
        white-space: nowrap;
      }

      .record-count mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      /* Table */
      .table-wrapper {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid #e0e7f0;
      }

      .records-table {
        width: 100%;
        border-collapse: separate;
        background: white;
      }

      .records-table th {
        background: #f5f7ff;
        color: #3f51b5;
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 14px 16px;
        border-bottom: 2px solid #e8eaf6;
      }

      .records-table td {
        padding: 14px 16px;
        font-size: 13px;
        color: #37474f;
        border-bottom: 1px solid #f0f4f8;
        vertical-align: middle;
      }

      .table-row:hover td {
        background: #f8faff;
      }

      .title-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-width: 280px;
      }

      .record-title {
        font-weight: 600;
        color: #1a237e;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .record-desc {
        font-size: 11px;
        color: #90a4ae;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .category-tag {
        background: #f5f7ff;
        color: #3f51b5;
        padding: 3px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      .status-badge mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }

      .access-badge mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }

      /* Empty State */
      .empty-state {
        padding: 60px 20px;
        text-align: center;
        color: #90a4ae;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #cfd8dc;
      }

      .empty-state h4 {
        font-size: 18px;
        margin: 12px 0 8px;
        color: #546e7a;
      }

      .empty-state p {
        font-size: 14px;
        margin: 0;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spin {
        animation: spin 1s linear infinite;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private recordsService = inject(RecordsService);

  loading = signal(false);
  records = signal<DataRecord[]>([]);
  delayMs = signal(0);

  searchQuery = '';
  statusFilter = '';

  displayedColumns = [
    'id',
    'title',
    'category',
    'status',
    'priority',
    'department',
    'accessLevel',
    'updatedAt',
  ];

  totalRecords = computed(() => this.records().length);
  completedCount = computed(
    () => this.records().filter((r) => r.status === 'completed').length
  );
  inProgressCount = computed(
    () => this.records().filter((r) => r.status === 'in-progress').length
  );

  filteredRecords = computed(() => {
    let data = this.records();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter) {
      data = data.filter((r) => r.status === this.statusFilter);
    }
    return data;
  });

  initials = computed(() => {
    const name = this.auth.user()?.name ?? '';
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading.set(true);
    this.recordsService.getRecords(this.delayMs()).subscribe({
      next: (res) => {
        this.records.set(res.records);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onDelayChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.delayMs.set(parseInt(target.value, 10));
  }

  logout(): void {
    inject(AuthService).logout();
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      'in-progress': 'autorenew',
      completed: 'check_circle',
      rejected: 'cancel',
    };
    return icons[status] ?? 'circle';
  }

  accessIcon(level: string): string {
    const icons: Record<string, string> = {
      public: 'public',
      restricted: 'lock_open',
      confidential: 'lock',
    };
    return icons[level] ?? 'security';
  }
}
