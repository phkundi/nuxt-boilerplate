/**
 * Auth Token Management for HTTP Transport Layer
 * Provides token access and refresh strategy without depending on Pinia.
 */

import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useAuthCookies } from "~/composables/useAuthCookies";
import type { TokenProvider, RefreshTokenFn } from "./types";

interface JWTPayload {
  exp: number;
  iat?: number;
  sub?: string;
}

/**
 * Creates a token provider that reads/writes tokens from cookies.
 * This is the default implementation used by the HTTP client.
 */
export function createTokenProvider(): TokenProvider {
  const cookies = useAuthCookies();

  return {
    getAccessToken: () => cookies.getAccessToken() ?? null,
    getRefreshToken: () => cookies.getRefreshToken() ?? null,
    setAccessToken: (token) => cookies.setAccessToken(token),
    setRefreshToken: (token) => cookies.setRefreshToken(token),
  };
}

/**
 * Check if a JWT token is expired or expiring soon (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return dayjs.unix(decoded.exp).diff(dayjs(), "minute") < 5;
  } catch {
    return true; // If we can't decode, treat as expired
  }
}

/**
 * Check if a JWT token is already expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return dayjs.unix(decoded.exp).isBefore(dayjs());
  } catch {
    return true;
  }
}

// Module-level state to prevent concurrent refresh attempts
let refreshPromise: Promise<{ access: string; refresh: string } | null> | null =
  null;

/**
 * Get a valid access token, refreshing if necessary.
 * Handles concurrent refresh attempts by deduplicating.
 */
export async function getValidAccessToken(
  tokenProvider: TokenProvider,
  refreshFn: RefreshTokenFn,
): Promise<string | null> {
  const accessToken = tokenProvider.getAccessToken();

  // If we have a valid, non-expiring token, use it
  if (accessToken && !isTokenExpiringSoon(accessToken)) {
    return accessToken;
  }

  // Need to refresh - check if we have a refresh token
  const refreshToken = tokenProvider.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  // Deduplicate concurrent refresh attempts
  if (refreshPromise) {
    const result = await refreshPromise;
    return result?.access ?? null;
  }

  try {
    refreshPromise = refreshFn(refreshToken);
    const newTokens = await refreshPromise;

    if (newTokens) {
      tokenProvider.setAccessToken(newTokens.access);
      tokenProvider.setRefreshToken(newTokens.refresh);
      return newTokens.access;
    }

    return null;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Clear the refresh promise (useful for testing or logout)
 */
export function clearRefreshState(): void {
  refreshPromise = null;
}
