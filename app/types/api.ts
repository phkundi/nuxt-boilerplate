export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ExtendedRequestInit extends RequestInit {
  data?: any;
  server?: boolean;
}

export interface ApiErrorResponse {
  [key: string]: string[]; // Each field can have multiple error messages
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
  [key: string]: any;
}
