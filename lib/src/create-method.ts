import { z } from "zod";
import type { MethodHandlerFunction } from "@/@types/method";
import type { SomeZodObject, ZodNull } from "zod";

type MiddlewareStack = Array<MiddlewareStack>;

export type CreateMethodOptions<
  RequestSchema extends SomeZodObject | ZodNull,
  ResponseSchema extends SomeZodObject | ZodNull,
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
} & (RequestSchema extends SomeZodObject
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
  ResponseSchema extends SomeZodObject | ZodNull,
  RequestSchema extends SomeZodObject | ZodNull,
  URLParams extends Record<string, string>
>(
  options: CreateMethodOptions<RequestSchema, ResponseSchema, URLParams>
) => options;
