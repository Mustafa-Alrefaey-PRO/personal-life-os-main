// Authentication types matching the API DTOs

export interface LoginRequest {
  /** A username, or an email (anything containing "@"). */
  login: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  userName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  userName: string;
  email: string;
  fullName: string;
  expiresAt: string;
}

export interface User {
  /** Empty for a session saved before usernames existed. */
  userName: string;
  email: string;
  fullName: string;
  token: string;
}
