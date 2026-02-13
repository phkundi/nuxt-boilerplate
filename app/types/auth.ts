export type OAuthProvider = "google" | "apple";

export interface User {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  is_staff: boolean;
  // Add other user properties here
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  first_name: string;
  password2: string;
  accept_terms: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export interface ResetPasswordCredentials {
  password1: string;
  password2: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
