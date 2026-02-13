/**
 * Auth Service
 *
 * Orchestrates authentication workflows by calling API modules and managing tokens.
 * This is the layer that stores/components should call for auth operations.
 */

import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useAuthCookies } from "~/composables/useAuthCookies";
import {
  setRefreshTokenFn,
  isTokenExpiringSoon,
  clearRefreshState,
} from "~/lib/http";
import * as authApi from "~/api/auth";
import * as usersApi from "~/api/users";
import * as oauthService from "~/services/oauth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordCredentials,
  TokenResponse,
  User,
  OAuthProvider,
} from "~/types/auth";
import { debug } from "~/utils/debug";

interface JWTPayload {
  exp: number;
  iat?: number;
  sub?: string;
}

/**
 * Initialize the auth service.
 * Sets up the token refresh function for the HTTP client.
 * Call this once during app initialization.
 */
export function initializeAuthService(): void {
  setRefreshTokenFn(refreshTokens);
}

/**
 * Refresh tokens using the refresh token
 */
export async function refreshTokens(
  refreshToken: string,
): Promise<TokenResponse | null> {
  try {
    const response = await authApi.refreshToken(refreshToken);
    return response;
  } catch (error) {
    debug.error("[authService.refreshTokens] Failed to refresh:", error);
    return null;
  }
}

/**
 * Login a user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  // Get tokens from API
  const tokens = await authApi.login(credentials);

  // Store tokens in cookies
  const { setAccessToken, setRefreshToken } = useAuthCookies();
  setAccessToken(tokens.access);
  setRefreshToken(tokens.refresh);

  // Small delay to ensure cookies are set
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Fetch and return user data
  return usersApi.getMe();
}

/**
 * Register a new user and automatically log them in
 * The backend now returns JWT tokens with the registration response
 */
export async function registerAndLogin(
  credentials: RegisterCredentials,
  inviterId?: string,
): Promise<User> {
  // Register the user - backend returns user data with tokens
  const response = await usersApi.register(credentials, inviterId);

  // Store tokens in cookies (auto-login)
  const { setAccessToken, setRefreshToken } = useAuthCookies();
  setAccessToken(response.tokens.access);
  setRefreshToken(response.tokens.refresh);

  // Small delay to ensure cookies are set
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Return the user data (without the tokens field)
  const { tokens, ...user } = response;
  return user;
}

/**
 * Login with OAuth provider (Google or Apple)
 */
export async function loginWithOAuth(provider: OAuthProvider): Promise<User> {
  // Get the ID token from the OAuth provider
  const oauthResult = await oauthService.signInWithProvider(provider);

  let response;

  // Send the token to our backend
  if (provider === "google") {
    response = await authApi.loginWithGoogle(oauthResult.token);
  } else if (provider === "apple") {
    response = await authApi.loginWithApple(
      oauthResult.token,
      oauthResult.firstName,
      oauthResult.lastName,
      oauthResult.email,
    );
  } else {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // Store tokens in cookies
  const { setAccessToken, setRefreshToken } = useAuthCookies();
  setAccessToken(response.access);
  setRefreshToken(response.refresh);

  // Small delay to ensure cookies are set
  await new Promise((resolve) => setTimeout(resolve, 50));

  return response.user;
}

/**
 * Logout - clear tokens and reset state
 */
export function logout(): void {
  const { setAccessToken, setRefreshToken } = useAuthCookies();
  setAccessToken(null);
  setRefreshToken(null);
  clearRefreshState();
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<void> {
  await usersApi.forgotPassword(email);
}

/**
 * Reset password with token
 */
export async function resetPassword(
  credentials: ResetPasswordCredentials,
  userId: string,
  token: string,
): Promise<void> {
  await usersApi.resetPassword(credentials, userId, token);
}

/**
 * Get the current user from the API
 */
export async function fetchCurrentUser(): Promise<User> {
  return usersApi.getMe();
}

/**
 * Check if there are valid tokens and attempt to restore the session
 */
export async function tryRestoreSession(): Promise<User | null> {
  const { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } =
    useAuthCookies();

  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // No tokens at all
  if (!accessToken && !refreshToken) {
    debug.log("[authService.tryRestoreSession] No tokens found");
    return null;
  }

  // Check if access token is valid
  if (accessToken) {
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken);
      const isExpired = dayjs
        .unix(decoded.exp)
        .subtract(5, "minute")
        .isBefore(dayjs());

      if (!isExpired) {
        // Token appears valid, try to fetch user
        try {
          debug.log(
            "[authService.tryRestoreSession] Token valid, fetching user",
          );
          return await usersApi.getMe();
        } catch {
          // Token might be revoked, try refresh
          debug.log(
            "[authService.tryRestoreSession] Fetch failed, trying refresh",
          );
        }
      }
    } catch {
      // Invalid token format
      debug.log("[authService.tryRestoreSession] Invalid token format");
    }
  }

  // Try to refresh tokens
  if (refreshToken) {
    debug.log("[authService.tryRestoreSession] Attempting token refresh");
    const newTokens = await refreshTokens(refreshToken);

    if (newTokens) {
      setAccessToken(newTokens.access);
      setRefreshToken(newTokens.refresh);

      try {
        return await usersApi.getMe();
      } catch (error) {
        debug.error(
          "[authService.tryRestoreSession] Fetch after refresh failed:",
          error,
        );
      }
    }
  }

  // Could not restore session
  logout();
  return null;
}

/**
 * Get a valid access token, refreshing if necessary.
 * Used by the auth store to maintain the refresh interval.
 */
export async function ensureValidToken(): Promise<string | null> {
  const { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } =
    useAuthCookies();

  const accessToken = getAccessToken();

  // If we have a valid, non-expiring token, return it
  if (accessToken && !isTokenExpiringSoon(accessToken)) {
    return accessToken;
  }

  // Need to refresh
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const newTokens = await refreshTokens(refreshToken);
  if (newTokens) {
    setAccessToken(newTokens.access);
    setRefreshToken(newTokens.refresh);
    return newTokens.access;
  }

  return null;
}
