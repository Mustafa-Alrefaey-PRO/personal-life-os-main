import api from './api';
import type { LoginRequest, RegisterRequest, ChangePasswordRequest, UpdateProfileRequest, AuthResponse, User } from '../types/auth';
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

/** Stores the token and user; the API's response is the only source of both. */
function saveSession(auth: AuthResponse) {
  localStorage.setItem('token', auth.token);
  localStorage.setItem('user', JSON.stringify({
    userName: auth.userName,
    email: auth.email,
    fullName: auth.fullName,
    token: auth.token,
  } satisfies User));
}

export const authService = {
  // Register a new user
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

    if (response.data.success && response.data.data) saveSession(response.data.data);

    return response.data;
  },

  // Login user
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);

    if (response.data.success && response.data.data) saveSession(response.data.data);

    return response.data;
  },

  // Change the signed-in user's password; the API returns a fresh token
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/change-password', data);
    if (response.data.success && response.data.data) saveSession(response.data.data);
    return response.data;
  },

  // Update name, username and email; the API returns a fresh token with the new details
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.put<ApiResponse<AuthResponse>>('/auth/profile', data);
    if (response.data.success && response.data.data) saveSession(response.data.data);
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
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr) as Partial<User>;
    return { userName: '', email: '', fullName: '', token: '', ...user };
  },
};
