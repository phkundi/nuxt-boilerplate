import { useAuthStore } from "~/store/auth";
import { getEndpoint, endpoints } from "~/endpoints/endpoints";

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  [key: string]: any;
}

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
  ): { url: string; requireAuth: boolean } => {
    const parts = endpointId.split(".");
    let current: any = endpoints;

    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(`Endpoint not found: ${endpointId}`);
      }
      current = current[part];
    }

    if (typeof current.url !== "string") {
      throw new Error(`Invalid endpoint configuration for: ${endpointId}`);
    }

    return {
      url: getEndpoint({
        path: endpointId,
        params: config.params || {},
        queryParams: config.queryParams || {},
      }),
      requireAuth: current.requireAuth || false,
    };
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

      const { url, requireAuth } = resolveEndpoint(endpointId, config);

      let response: Response;

      if (requireAuth) {
        if (!authStore.isAuthenticated) {
          throw new Error("Authentication required. Please log in.");
        }

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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail ||
            responseData.error ||
            "An error occurred while processing the request."
        );
      }

      return responseData;
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

  /**
   * Performs a GET request.
   *
   * @param {string} endpointId - The endpoint identifier.
   * @param {Object} config - Additional fetch configuration.
   * @returns {Promise<any>} - The response data.
   */
  const get = <T>(
    endpointId: string,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "GET", null, config);
  };

  /**
   * Performs a POST request.
   *
   * @param {string} endpointId - The endpoint identifier.
   * @param {Object} data - The request payload.
   * @param {Object} config - Additional fetch configuration.
   * @returns {Promise<any>} - The response data.
   */
  const post = <T>(
    endpointId: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "POST", data, config);
  };

  /**
   * Performs a PUT request.
   *
   * @param {string} endpointId - The endpoint identifier.
   * @param {Object} data - The request payload.
   * @param {Object} config - Additional fetch configuration.
   * @returns {Promise<any>} - The response data.
   */
  const put = <T>(
    endpointId: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "PUT", data, config);
  };

  /**
   * Performs a PATCH request.
   *
   * @param {string} endpointId - The endpoint identifier.
   * @param {Object} data - The request payload.
   * @param {Object} config - Additional fetch configuration.
   * @returns {Promise<any>} - The response data.
   */
  const patch = <T>(
    endpointId: string,
    data: any,
    config: RequestConfig = {}
  ): Promise<T> => {
    return handleRequest<T>(endpointId, "PATCH", data, config);
  };

  /**
   * Performs a DELETE request.
   *
   * @param {string} endpointId - The endpoint identifier.
   * @param {Object} config - Additional fetch configuration.
   * @returns {Promise<any>} - The response data.
   */
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
