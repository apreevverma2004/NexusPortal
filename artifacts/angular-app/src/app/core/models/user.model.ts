export interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: 'Admin' | 'General User';
  department: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface LoginRequest {
  userId: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}
