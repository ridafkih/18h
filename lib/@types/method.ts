import { Context } from "koa";
import { SomeZodObject, ZodNull, infer as ZodInfer } from "zod";

interface OverrideBody<T> extends Exclude<Context["request"], "body"> {
  body: T;
}

interface OverrideRequest<T> extends Exclude<Context, "body"> {
  request: OverrideBody<T>;
}

export type ExtendedContext<
  RequestBody extends SomeZodObject | ZodNull = ZodNull
> = OverrideRequest<
  RequestBody extends SomeZodObject
    ? ZodInfer<RequestBody>
    : Record<string, never>
>;

type MethodContext<RequestSchema extends SomeZodObject | ZodNull> =
  ExtendedContext<RequestSchema>;

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
  ResponseSchema extends SomeZodObject | ZodNull
> = (
  context: MethodContext<RequestSchema>
) => Promise<MethodHandlerFunctionResponse<ResponseSchema>>;
