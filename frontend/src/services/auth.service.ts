import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import type { ApiResponse } from '../types/api';

/** Reads the JWT `exp` claim; malformed tokens count as expired. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export const authService = {
  // Register a new user
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

    // If registration successful, save token and user data
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.data.data.email,
        fullName: response.data.data.fullName,
        token: response.data.data.token,
      }));
    }

    return response.data;
  },

  // Login user
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);

    // If login successful, save token and user data
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.data.data.email,
        fullName: response.data.data.fullName,
        token: response.data.data.token,
      }));
    }

    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if a non-expired token is stored
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
