import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

const API_BASE = '/api';

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface CreateUserPayload {
  userId: string;
  password: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  password?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${API_BASE}/admin/users`);
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${API_BASE}/admin/users`, payload);
  }

  updateUser(userId: string, payload: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(`${API_BASE}/admin/users/${userId}`, payload);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/admin/users/${userId}`);
  }
}
