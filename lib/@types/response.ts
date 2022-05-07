export interface Response<Body> {
  code?: number;
  headers?: Record<string, string>;
  body?: Body;
}