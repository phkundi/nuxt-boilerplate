/**
 * HTTP Transport Layer Types
 * These types are used by the transport client and do not depend on any other layers.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Normalized API error that the transport layer throws.
 * UI/service layers can catch and handle this consistently.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly details: Record<string, string[]> | null;
  public readonly isAuthError: boolean;

  constructor(
    message: string,
    status: number,
    statusText: string = "",
    details: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.details = details;
    this.isAuthError = status === 401 || status === 403;
  }

  /**
   * Get the first error message for a specific field (useful for form validation)
   */
  getFieldError(field: string): string | null {
    return this.details?.[field]?.[0] ?? null;
  }

  /**
   * Check if this is a validation error (400)
   */
  get isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if this is a not found error (404)
   */
  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if this is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>; // Path params, e.g. /users/<id>
  queryParams?: Record<string, string>; // Query params, e.g. ?page=1
  /**
   * If true, skip auth token injection (for login/register endpoints)
   */
  skipAuth?: boolean;
  /**
   * If true, use $fetch for SSR-compatible requests
   */
  server?: boolean;
  /**
   * AbortSignal for request cancellation (e.g., from AbortController)
   */
  signal?: AbortSignal;
}

/**
 * Token provider interface - allows the HTTP client to get tokens without depending on Pinia
 */
export interface TokenProvider {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setAccessToken(token: string | null): void;
  setRefreshToken(token: string | null): void;
}

/**
 * Token refresh function signature
 */
export type RefreshTokenFn = (refreshToken: string) => Promise<{
  access: string;
  refresh: string;
} | null>;
