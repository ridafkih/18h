import { Context, Middleware } from "koa";
import { RequestHandlerResult } from "@/@types/request-handler";
import { AnySchema, ObjectSchema } from "yup";
import { ObjectShape } from "yup/lib/object";

export type ExtendedContext<
  RequestBody extends ObjectShape | null = null,
  QueryParams = Record<string, string | undefined>
> = Context & {
  body: RequestBody extends ObjectShape
    ? ObjectSchema<RequestBody>["__outputType"]
    : null;
  params: QueryParams;
};

export type HTTPMethodRules<
  ResponseBody = {},
  RequestBody extends ObjectShape | null = null,
  QueryParams = Record<string, string | undefined>
> = {
  handler(
    context: ExtendedContext<RequestBody, QueryParams>
  ): Promise<RequestHandlerResult<ResponseBody>>;
  middleware?: {
    pre?: Middleware[];
    post?: Middleware[];
  };
} & (RequestBody extends null
  ? {
      validation?: AnySchema;
    }
  : {
      validation: ObjectSchema<
        RequestBody extends ObjectShape ? RequestBody : {}
      >;
    });

export type MethodName =
  | "any"
  | "delete"
  | "get"
  | "delete"
  | "patch"
  | "post"
  | "put";

export type HTTPMethod<
  Method extends MethodName,
  ResponseBody,
  RequestBody extends ObjectShape | null = null,
  QueryParams = Record<string, string | undefined>
> = Record<Method, HTTPMethodRules<ResponseBody, RequestBody, QueryParams>>;

export type ANY<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null
> = HTTPMethod<"any", ResponseBody, RequestBody>;

export type DELETE<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null
> = HTTPMethod<"delete", ResponseBody, RequestBody>;

export type GET<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null
> = HTTPMethod<"get", ResponseBody, RequestBody>;

export type PATCH<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null
> = HTTPMethod<"patch", ResponseBody, RequestBody>;

export type POST<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null
> = HTTPMethod<"post", ResponseBody, RequestBody>;

export type PUT<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null
> = HTTPMethod<"put", ResponseBody, RequestBody>;
