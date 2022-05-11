export type RequestHandlerResult<ResponseBody> = {
  headers?: Record<string, string | number | boolean>;
  code?: number;
} & (ResponseBody extends null
  ? {
      body?: never;
    }
  : {
      body: ResponseBody;
    });
