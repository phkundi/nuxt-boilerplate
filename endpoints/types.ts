export interface Endpoint {
  url: string;
  requireAuth: boolean;
}

export type RecursiveRecord = {
  [key: string]: string | RecursiveRecord;
};

export interface GetEndpointParams {
  path: string;
  params?: Record<string, string>;
  queryParams?: Record<string, string>;
}
