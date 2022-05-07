import { Context } from "koa";
import { HTTPMethod } from "@/@types/http";
import { Response } from "@/@types/response";

import { AnySchema } from "yup";

export type ParameterizedContext<RequestSchema = {}, URLParams = {}> = Context & {
  params: URLParams;
  body: RequestSchema;
};

export type Route<RequestSchema extends AnySchema = AnySchema, ResponseBody = {}, URLParams = {}> = {
  method: HTTPMethod;
  handler: (
    context: ParameterizedContext<RequestSchema["__outputType"], URLParams>
  ) => Promise<Response<ResponseBody>>;
  validation?: RequestSchema;
};
