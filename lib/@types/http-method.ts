import { Context, Middleware } from "koa";
import { RequestHandlerResult } from "@/@types/request-handler";
import { AnySchema, ObjectSchema } from "yup";
import { ObjectShape } from "yup/lib/object";
import bodyParser from "koa-bodyparser";

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

interface OverrideBody<T> extends Exclude<Context["request"], "body"> {
  body: T;
}

interface OverrideRequest<T, RouteParams> extends Exclude<Context, "body"> {
  request: OverrideBody<T>;
  params: RouteParams;
}

export type ExtendedContext<
  RequestBody extends ObjectShape | null = null,
  RouteParams = Record<string, string | undefined>
> = OverrideRequest<
  RequestBody extends ObjectShape
    ? RecursivePartial<ObjectSchema<RequestBody>["__outputType"]>
    : Record<string, never>,
  RouteParams
>;

export type RouteHandlerRules<
  ResponseBody = unknown,
  RequestBody extends ObjectShape | null = null,
  RouteParams = Record<string, string | undefined>
> = {
  handler(
    context: ExtendedContext<RequestBody, RouteParams>
  ): Promise<RequestHandlerResult<ResponseBody>>;
  middleware?: {
    pre?: Middleware[];
    post?: Middleware[];
  };
} & (RequestBody extends null
  ? {
      accept?: never;
      validation?: AnySchema;
    }
  : {
      accept: ("json" | "form")[];
      validation: ObjectSchema<
        RequestBody extends ObjectShape ? RequestBody : Record<string, never>
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

export type MethodController<
  ResponseBody = null,
  RequestBody extends ObjectShape | null = null,
  RouteParams = Record<string, string | undefined>
> = RouteHandlerRules<ResponseBody, RequestBody, RouteParams>;
