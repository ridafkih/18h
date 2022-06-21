import type { Context } from "koa";
import type { SomeZodObject, ZodNull, infer as ZodInfer } from "zod";

interface OverrideBody<T> extends Exclude<Context["request"], "body"> {
  body: T;
}

interface OverrideRequest<T> extends Exclude<Context, "body"> {
  request: OverrideBody<T>;
}

export type ExtendedContext<
  RequestBody extends SomeZodObject | ZodNull = ZodNull,
  URLParams extends Record<string, string> = Record<string, never>
> = OverrideRequest<
  RequestBody extends SomeZodObject
    ? ZodInfer<RequestBody>
    : Record<string, never>
> & {
  params: URLParams;
};

type MethodContext<
  RequestSchema extends SomeZodObject | ZodNull,
  URLParams extends Record<string, string> = Record<string, never>
> = ExtendedContext<RequestSchema, URLParams>;

type MethodHandlerFunctionResponse<ResponseSchema> = {
  headers?: Record<string, string>;
  status?: number;
} & (ResponseSchema extends SomeZodObject
  ? {
      body: ZodInfer<ResponseSchema>;
    }
  : Record<string, never>);

export type MethodHandlerFunction<
  RequestSchema extends SomeZodObject | ZodNull,
  ResponseSchema extends SomeZodObject | ZodNull,
  URLParams extends Record<string, string>
> = (
  context: MethodContext<RequestSchema, URLParams>
) => Promise<MethodHandlerFunctionResponse<ResponseSchema>>;
