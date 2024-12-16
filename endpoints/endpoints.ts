import { authEndpoints } from "./auth";
import { type GetEndpointParams, type RecursiveRecord } from "./types";

export const endpoints: Record<string, Record<string, Endpoint>> = {
  auth: authEndpoints,
};

export function getEndpoint({
  path,
  params = {},
  queryParams = {},
}: GetEndpointParams): string {
  /**
   * Generates a full URL for a given API endpoint.
   *
   * This function takes a path string that represents an endpoint in the `endpoints` object,
   * replaces any dynamic parts with provided parameters, and appends query parameters if any.
   * It then prepends the base URL to create a complete API endpoint URL.
   *
   * @param {string} path - A dot-notation string representing the path to the endpoint in the `endpoints` object.
   *                        For example: 'auth.login' or 'projects.get'.
   * @param {Object} [params={}] - An object containing values for dynamic parts of the URL.
   *                                Keys should match placeholders in the endpoint string (without < >).
   *                                For example: { id: '123' } for an endpoint like 'projects/<id>/'.
   * @param {Object} [queryParams={}] - An object representing query parameters to be appended to the URL.
   *                                    For example: { page: 1, limit: 10 }.
   *
   * @returns {string} The complete URL for the API endpoint.
   *
   * @throws {Error} If the endpoint is not found in the `endpoints` object.
   * @throws {Error} If the final value in the `endpoints` object is not a string.
   * @throws {Error} If required dynamic parameters are missing.
   *
   * @example
   * // Static endpoint
   * getEndpoint('auth.login') // returns: 'https://api.example.com/users/token/'
   *
   * // Dynamic endpoint
   * getEndpoint('projects.get', { id: '123' }) // returns: 'https://api.example.com/projects/123/'
   *
   * // With query parameters
   * getEndpoint('projects.list', {}, { page: 1, limit: 10 })
   * // returns: 'https://api.example.com/projects/?page=1&limit=10'
   *
   * // Dynamic endpoint with query parameters
   * getEndpoint('tasks.list', { projectId: '456' }, { status: 'active' })
   * // returns: 'https://api.example.com/projects/456/tasks/?status=active'
   */
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiUrl;

  const parts = path.split(".");
  let current: any = endpoints;

  // Navigate through the endpoints object
  for (const part of parts) {
    if (!current || typeof current !== "object") {
      throw new Error(`Invalid endpoint path: ${path}`);
    }

    current = current[part];
    if (current === undefined) {
      throw new Error(`Endpoint not found: ${path}`);
    }
  }

  // Check if we found an Endpoint object
  if (!current || typeof current !== "object" || !("url" in current)) {
    throw new Error(`Invalid endpoint: ${path} (not an Endpoint object)`);
  }

  let endpoint = current.url;

  for (const [key, value] of Object.entries(params)) {
    const placeholder = `<${key}>`;
    if (endpoint.includes(placeholder)) {
      endpoint = endpoint.replace(placeholder, value);
    } else {
      console.warn(`Warning: Unused parameter '${key}' for endpoint '${path}'`);
    }
  }

  // Check if there are any remaining placeholders
  const remainingPlaceholders = endpoint.match(/<\w+>/g);
  if (remainingPlaceholders) {
    throw new Error(
      `Missing required parameters for endpoint '${path}': ${remainingPlaceholders.join(
        ", "
      )}`
    );
  }

  // Append query parameters
  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = `${baseUrl}${endpoint}${
    queryString ? `?${queryString}` : ""
  }`;

  return fullUrl;
}
