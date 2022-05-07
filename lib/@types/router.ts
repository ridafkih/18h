import { Context } from "koa";
import { HTTPMethod } from "@/@types/http";
import { Response } from "@/@types/response";

import { AnySchema } from "yup";

export type ParameterizedContext<
  RequestSchemaOutputType = {},
  URLParams = {}
> = Context & {
  params: URLParams;
  request: Context["request"] & { body?: RequestSchemaOutputType };
}

export type Route<RequestSchema = AnySchema, ResponseBody = {}, URLParams = {}> = ({
  method: HTTPMethod;
  handler: (
    context: ParameterizedContext<
      RequestSchema extends AnySchema ? RequestSchema["__outputType"] : null,
      URLParams
    >
  ) => Promise<Response<ResponseBody>>;
}) & (RequestSchema extends AnySchema
  ? {
      validation: RequestSchema;
    }
  : {});
