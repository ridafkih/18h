import { z } from "zod";
import type { MethodHandlerFunction } from "@/@types/method";
import type { SomeZodObject, ZodNull } from "zod";

type MiddlewareStack = Array<MiddlewareStack>;

type CreateMethodOptions<
  RequestSchema extends SomeZodObject | ZodNull,
  ResponseSchema extends SomeZodObject | ZodNull
> = {
  schema: {
    request: RequestSchema;
    response: ResponseSchema;
  };
  middleware?: {
    pre?: MiddlewareStack;
    post?: MiddlewareStack;
  };
  handler: MethodHandlerFunction<RequestSchema, ResponseSchema>;
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
  RequestSchema extends SomeZodObject | ZodNull
>(
  options: CreateMethodOptions<RequestSchema, ResponseSchema>
) => {
  return options;
};

method({
  accepts: ["json"],
  schema: {
    request: z.object({ a: z.string().optional() }),
    response: z.null(),
  },
  async handler(context) {
    return {};
  },
});
