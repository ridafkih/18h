export interface RequestHandlerResult<ResponseBody> {
  headers?: Record<string, string | number | boolean>;
  code?: number;
  body: ResponseBody;
}
