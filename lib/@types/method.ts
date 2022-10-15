import type { Context } from "koa";
import type { ZodNull, infer as ZodInfer } from "zod";
import type {
  NonNullableValidStructure,
  ValidStructure,
} from "@/@types/valid-structure";

interface OverrideBody<T extends Record<string, unknown> | undefined> extends Exclude<Context["request"], "body"> {
  body: T;
}

interface OverrideRequest<T extends Record<string, unknown> | undefined> extends Exclude<Context, "body"> {
  request: OverrideBody<T>;
}

export type ExtendedContext<
  RequestBody extends ValidStructure = ZodNull,
  URLParams extends Record<string, string> = Record<string, never>
> = OverrideRequest<
  RequestBody extends NonNullableValidStructure
    ? ZodInfer<RequestBody>
    : Record<string, never>
> & {
  params: URLParams;
};

type MethodContext<
  RequestSchema extends ValidStructure,
  URLParams extends Record<string, string> = Record<string, never>
> = ExtendedContext<RequestSchema, URLParams>;

type MethodHandlerFunctionResponse<ResponseSchema> =
  ResponseSchema extends NonNullableValidStructure
    ? {
        headers?: Record<string, string>;
        status?: number;
        body: ZodInfer<ResponseSchema>;
      }
    : {
        headers?: Record<string, string>;
        status?: number;
      };

export type MethodHandlerFunction<
  RequestSchema extends ValidStructure,
  ResponseSchema extends ValidStructure,
  URLParams extends Record<string, string>
> = (
  context: MethodContext<RequestSchema, URLParams>
) => Promise<MethodHandlerFunctionResponse<ResponseSchema>>;
