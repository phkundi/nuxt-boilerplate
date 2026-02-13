/**
 * HTTP Transport Layer
 *
 * Exports:
 * - ApiError: Normalized error class for API errors
 * - createHttpClient: Factory to create HTTP client instances
 * - setRefreshTokenFn: Set the token refresh function (called during app init)
 * - Token utilities for auth management
 */

export {
  ApiError,
  type RequestConfig,
  type TokenProvider,
  type RefreshTokenFn,
  type HttpMethod,
} from "./types";
export { createHttpClient, setRefreshTokenFn, type HttpClient } from "./client";
export {
  createTokenProvider,
  getValidAccessToken,
  isTokenExpired,
  isTokenExpiringSoon,
  clearRefreshState,
} from "./auth";
