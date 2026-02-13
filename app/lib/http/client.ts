/**
 * HTTP Client - Transport Layer
 *
 * A single HTTP client that handles:
 * - Base URL construction
 * - Auth token injection (via token provider)
 * - Token refresh on expiry
 * - Response parsing and error normalization
 *
 * Does NOT depend on Pinia stores or UI concerns (toasts).
 */

import {
  ApiError,
  type HttpMethod,
  type RequestConfig,
  type TokenProvider,
  type RefreshTokenFn,
} from "./types";
import { createTokenProvider, getValidAccessToken } from "./auth";

// Module-level state for token refresh function
let _refreshTokenFn: RefreshTokenFn | null = null;

/**
 * Set the refresh token function. Called once during app initialization.
 * This allows the HTTP client to refresh tokens without circular dependencies.
 */
export function setRefreshTokenFn(fn: RefreshTokenFn): void {
  _refreshTokenFn = fn;
}

/**
 * Parse response body based on content type
 */
async function parseResponseBody(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");

  if (response.status === 204) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return null;
}

/**
 * Extract error message from response body
 */
function extractErrorMessage(body: any, status: number): string {
  if (!body) {
    return getDefaultErrorMessage(status);
  }

  // Django REST Framework style errors
  if (body.detail) return body.detail;
  if (body.error) return body.error;
  if (body.message) return body.message;

  // Non-field errors array
  if (body.non_field_errors?.length) {
    return body.non_field_errors[0];
  }

  return getDefaultErrorMessage(status);
}

/**
 * Get default error message for status code
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "You need to be logged in to do this.";
    case 403:
      return "You don't have permission to do this.";
    case 404:
      return "The requested resource was not found.";
    case 422:
      return "Validation error. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An error occurred while processing the request.";
  }
}

/**
 * Extract field-level errors from response body (for validation errors)
 */
function extractErrorDetails(body: any): Record<string, string[]> | null {
  if (!body || typeof body !== "object") return null;

  const details: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(body)) {
    // Skip known message fields
    if (["detail", "error", "message"].includes(key)) continue;

    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      details[key] = value;
    } else if (typeof value === "string") {
      details[key] = [value];
    }
  }

  return Object.keys(details).length > 0 ? details : null;
}

/**
 * Create the HTTP client
 */
export function createHttpClient(baseUrl: string) {
  const tokenProvider = createTokenProvider();

  /**
   * Construct full URL with path and query params
   */
  function constructUrl(endpoint: string, config: RequestConfig = {}): string {
    let url = endpoint;

    // Replace path parameters like <id> or :id
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        url = url.replace(`<${key}>`, value);
        url = url.replace(`:${key}`, value);
      }
    }

    // Add query parameters
    if (config.queryParams) {
      const queryString = new URLSearchParams(config.queryParams).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return `${baseUrl}${url}`;
  }

  /**
   * Make an HTTP request
   */
  async function request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    const url = constructUrl(endpoint, config);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    // Inject auth token if not skipped
    if (!config.skipAuth && _refreshTokenFn) {
      const token = await getValidAccessToken(tokenProvider, _refreshTokenFn);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (data !== undefined && data !== null) {
      fetchOptions.body = JSON.stringify(data);
    }

    let response: Response;

    if (config.server) {
      // Use $fetch for SSR-compatible requests
      try {
        const result = await $fetch(url, {
          method,
          headers,
          body: data,
        });
        return result as T;
      } catch (error: any) {
        // $fetch throws FetchError with data property
        if (error.data) {
          const message = extractErrorMessage(error.data, error.status || 500);
          const details = extractErrorDetails(error.data);
          throw new ApiError(
            message,
            error.status || 500,
            error.statusText || "",
            details,
          );
        }
        throw new ApiError(
          error.message || "Network error",
          0,
          "Network Error",
        );
      }
    }

    // Standard fetch for client-side
    try {
      response = await fetch(url, fetchOptions);
    } catch (error) {
      throw new ApiError(
        "Network error. Please check your connection.",
        0,
        "Network Error",
      );
    }

    const body = await parseResponseBody(response);

    if (!response.ok) {
      const message = extractErrorMessage(body, response.status);
      const details = extractErrorDetails(body);
      throw new ApiError(
        message,
        response.status,
        response.statusText,
        details,
      );
    }

    return body as T;
  }

  /**
   * Make a streaming POST request
   *
   * Returns the raw Response object so the caller can consume the body stream.
   * Supports AbortController via config.signal for cancellation.
   *
   * Note: Streaming is only supported client-side (config.server must not be true).
   */
  async function stream(
    endpoint: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<Response> {
    if (config.server) {
      throw new ApiError(
        "Streaming is not supported with server-side requests",
        0,
        "Not Supported",
      );
    }

    const url = constructUrl(endpoint, config);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    // Inject auth token if not skipped
    if (!config.skipAuth && _refreshTokenFn) {
      const token = await getValidAccessToken(tokenProvider, _refreshTokenFn);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const fetchOptions: RequestInit = {
      method: "POST",
      headers,
      signal: config.signal,
    };

    if (data !== undefined && data !== null) {
      fetchOptions.body = JSON.stringify(data);
    }

    let response: Response;

    try {
      response = await fetch(url, fetchOptions);
    } catch (error: any) {
      // Check if this was an abort
      if (error.name === "AbortError") {
        throw error; // Re-throw AbortError as-is
      }
      throw new ApiError(
        "Network error. Please check your connection.",
        0,
        "Network Error",
      );
    }

    if (!response.ok) {
      // For streaming endpoints, try to read error as JSON
      const contentType = response.headers.get("content-type");
      let body = null;

      if (contentType?.includes("application/json")) {
        try {
          body = await response.json();
        } catch {
          // Ignore JSON parse errors
        }
      }

      const message = extractErrorMessage(body, response.status);
      const details = extractErrorDetails(body);
      throw new ApiError(
        message,
        response.status,
        response.statusText,
        details,
      );
    }

    return response;
  }

  return {
    get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
      return request<T>("GET", endpoint, undefined, config);
    },

    post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
      return request<T>("POST", endpoint, data, config);
    },

    put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
      return request<T>("PUT", endpoint, data, config);
    },

    patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
      return request<T>("PATCH", endpoint, data, config);
    },

    delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
      return request<T>("DELETE", endpoint, undefined, config);
    },

    /**
     * Make a streaming POST request.
     * Returns raw Response for consuming the body stream.
     */
    stream(
      endpoint: string,
      data?: any,
      config?: RequestConfig,
    ): Promise<Response> {
      return stream(endpoint, data, config);
    },

    /**
     * Get the token provider for direct token access (e.g., in auth service)
     */
    getTokenProvider(): TokenProvider {
      return tokenProvider;
    },
  };
}

/**
 * Type for the HTTP client instance
 */
export type HttpClient = ReturnType<typeof createHttpClient>;
