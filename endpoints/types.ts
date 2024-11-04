import { type AuthEndpoints } from "./auth";

export type RecursiveRecord = {
  [key: string]: string | RecursiveRecord;
};

export interface EndpointsStructure {
  auth: AuthEndpoints;
  // Add other endpoint categories here as needed
}

export interface GetEndpointParams {
  path: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
}
