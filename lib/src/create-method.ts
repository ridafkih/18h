import type { MethodHandlerFunction } from "@/@types/method";
import type { Middleware } from "koa";
import type {
  NonNullableValidStructure,
  ValidStructure,
} from "@/@types/valid-structure";

type MiddlewareStack = Array<Middleware>;

export type CreateMethodOptions<
  RequestSchema extends ValidStructure,
  ResponseSchema extends ValidStructure,
  URLParams extends Record<string, string>
> = {
  schema: {
    request: RequestSchema;
    response: ResponseSchema;
  };
  middleware?: {
    pre?: MiddlewareStack;
    post?: MiddlewareStack;
  };
  handler: MethodHandlerFunction<RequestSchema, ResponseSchema, URLParams>;
} & (RequestSchema extends NonNullableValidStructure
  ? {
      accepts: ("json" | "form")[];
    }
  : {
      accepts?: never;
    });

/**
 * Creates a routes method object.
 * @param options The parameters for the method on the route.
 * @returns The method object.
 */
export const method = <
  ResponseSchema extends ValidStructure,
  RequestSchema extends ValidStructure,
  URLParams extends Record<string, string>
>(
  options: CreateMethodOptions<RequestSchema, ResponseSchema, URLParams>
) => options;
