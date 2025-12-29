import { useAuthStore } from "~/app/store/auth";
import type { HttpMethod, RequestConfig } from "~/app/types/api";
import { handleResponseData } from "~/app/utils/api";

export function useApi() {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiUrl;

  /**
   * Constructs the full URL for an API request by combining the base URL with the endpoint path.
   * Also handles query parameters and path parameters.
   *
   * @param {string} endpoint - The endpoint path
   * @param {RequestConfig} config - Configuration object containing params and queryParams
   * @returns {string} The complete URL for the API request
   */
  const constructUrl = (
    endpoint: string,
    config: RequestConfig = {}
  ): string => {
    let url = endpoint;

    // Replace path parameters
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        url = url.replace(`<${key}>`, value);
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
  };

  /**
   * Handles API requests based on method and authentication requirements.
   *
   * @param {string} endpoint - The endpoint path
   * @param {string} method - The HTTP method
   * @param {Object|null} data - The request payload
   * @param {Object} config - Additional fetch configuration
   * @returns {Promise<any>} - The response data
   */
  const handleRequest = async <T>(
    endpoint: string,
    method: string,
    data: any = null,
    config: RequestConfig = {}
  ): Promise<T> => {
    try {
      config.headers = {
        "Content-Type": "application/json",
        ...config.headers,
      };

      const url = constructUrl(endpoint, config);

      let response: Response;

      if (authStore.isAuthenticated) {
        switch (method.toUpperCase()) {
          case "GET":
            response = await authStore.authedGet(url, config);
            break;
          case "POST":
            response = await authStore.authedPost(
              url,
              JSON.stringify(data),
              config
            );
            break;
          case "PUT":
            response = await authStore.authedPut(
              url,
              JSON.stringify(data),
              config
            );
            break;
          case "PATCH":
            response = await authStore.authedPatch(
              url,
              JSON.stringify(data),
              config
            );
            break;
          case "DELETE":
            response = await authStore.authedDelete(url, config);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
      } else {
        // For non-authenticated requests
        if (config.server) {
          const fetchResponse = await $fetch(url, {
            method: method.toUpperCase() as HttpMethod,
            headers: {
              "Content-Type": "application/json",
              ...config.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
          });
          // Create a simple Response object with the fetch result
          response = new Response(JSON.stringify(fetchResponse));
        } else {
          response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              ...config.headers,
            },
            body: data ? JSON.stringify(data) : null,
            ...config,
          });
        }
      }

      return await handleResponseData(response);
    } catch (err) {
      const { error: errorToast } = useToast();
      if (err instanceof Error) {
        errorToast(err.message, "Error");
      } else {
        errorToast("An unexpected error occurred.", "Error");
      }
      throw err;
    }
  };

  const get = <T>(
    endpoint: string,
    config: RequestConfig = {},
    server: boolean = false
  ): Promise<T> => {
    if (server) {
      return getSsr<T>(endpoint, config);
    }

    return handleRequest<T>(endpoint, "GET", null, config);
  };

  const getSsr = <T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpoint, "GET", null, {
      ...config,
      server: true,
    });
  };

  const post = <T>(
    endpoint: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpoint, "POST", data, config);
  };

  const put = <T>(
    endpoint: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpoint, "PUT", data, config);
  };

  const patch = <T>(
    endpoint: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpoint, "PATCH", data, config);
  };

  const del = <T>(endpoint: string, config: RequestConfig = {}): Promise<T> => {
    return handleRequest<T>(endpoint, "DELETE", null, config);
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del, // 'delete' is a reserved keyword, so alias it as 'del'
  };
}
