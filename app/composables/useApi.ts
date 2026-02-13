/**
 * useApi Composable
 *
 * Provides a convenient API client for use in components/services.
 * This is a thin wrapper around the HTTP transport client.
 * Auth token injection is handled by the transport layer.
 */

import {
  createHttpClient,
  type RequestConfig,
  type HttpClient,
} from "~/lib/http";

// Singleton HTTP client instance
let _httpClient: HttpClient | null = null;

/**
 * Get or create the HTTP client singleton
 */
function getHttpClient(): HttpClient {
  if (!_httpClient) {
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiUrl as string;
    _httpClient = createHttpClient(baseUrl);
  }
  return _httpClient;
}

/**
 * Reset the HTTP client (useful for testing)
 */
export function resetHttpClient(): void {
  _httpClient = null;
}

/**
 * useApi composable - returns methods for making API requests.
 *
 * Usage:
 * ```ts
 * const api = useApi();
 * const user = await api.get<User>("users/me/");
 * ```
 */
export function useApi() {
  const client = getHttpClient();

  return {
    /**
     * Make a GET request
     */
    get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
      return client.get<T>(endpoint, config);
    },

    /**
     * Make a GET request with SSR support
     */
    getSsr<T>(endpoint: string, config?: RequestConfig): Promise<T> {
      return client.get<T>(endpoint, { ...config, server: true });
    },

    /**
     * Make a POST request
     */
    post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
      return client.post<T>(endpoint, data, config);
    },

    /**
     * Make a PUT request
     */
    put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
      return client.put<T>(endpoint, data, config);
    },

    /**
     * Make a PATCH request
     */
    patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
      return client.patch<T>(endpoint, data, config);
    },

    /**
     * Make a DELETE request
     */
    delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
      return client.delete<T>(endpoint, config);
    },

    /**
     * Get the underlying HTTP client (for advanced use cases)
     */
    getClient(): HttpClient {
      return client;
    },
  };
}
