import { useAuthStore } from "~/store/auth";
import { getEndpoint, endpoints } from "~/api/endpoints/endpoints";
import type { RequestConfig, HttpMethod } from "~/types/api";
import { handleResponseData } from "~/utils/api";

export function useApi() {
  const authStore = useAuthStore();

  /**
   * Resolves the endpoint details including URL and authentication requirement.
   *
   * @param {string} endpointId - The dot-notated identifier for the endpoint.
   * @returns {Object} - An object containing the URL and requireAuth flag.
   *
   * @throws {Error} - If the endpoint is not found or improperly configured.
   */
  const resolveEndpoint = (
    endpointId: string,
    config: RequestConfig = {}
  ): string => {
    const parts = endpointId.split(".");
    let current: any = endpoints;

    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(`Endpoint not found: ${endpointId}`);
      }
      current = current[part];
    }

    if (typeof current !== "string") {
      throw new Error(`Invalid endpoint configuration for: ${endpointId}`);
    }

    return getEndpoint({
      path: endpointId,
      params: config.params || {},
      queryParams: config.queryParams || {},
    });
  };

  /**
   * Handles API requests based on method and authentication requirements.
   *
   * @param {string} endpointId - The endpoint identifier.
   * @param {string} method - The HTTP method.
   * @param {Object|null} data - The request payload.
   * @param {Object} config - Additional fetch configuration.
   * @returns {Promise<any>} - The response data.
   */
  const handleRequest = async <T>(
    endpointId: string,
    method: string,
    data: any = null,
    config: RequestConfig = {}
  ): Promise<T> => {
    try {
      config.headers = {
        "Content-Type": "application/json",
        ...config.headers,
      };

      const url = resolveEndpoint(endpointId, config);

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
    endpointId: string,
    config: RequestConfig = {},
    server: boolean = false
  ): Promise<T> => {
    if (server) {
      return getSsr<T>(endpointId, config);
    }

    return handleRequest<T>(endpointId, "GET", null, config);
  };

  const getSsr = <T>(
    endpointId: string,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "GET", null, {
      ...config,
      server: true,
    });
  };

  const post = <T>(
    endpointId: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "POST", data, config);
  };

  const put = <T>(
    endpointId: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "PUT", data, config);
  };

  const patch = <T>(
    endpointId: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "PATCH", data, config);
  };

  const del = <T>(
    endpointId: string,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "DELETE", null, config);
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del, // 'delete' is a reserved keyword, so alias it as 'del'
  };
}
