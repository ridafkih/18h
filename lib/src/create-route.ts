import { CreateMethodOptions } from "@/src/create-method";
import type { MethodName } from "@/@types/http";
import type { SomeZodObject, ZodNull } from "zod";

/**
 * Creates a route object that takes in key-value method pairs.
 * @param methods The object of methods to register.
 * @returns An object containing the methods.
 */
export const route = <
  URLParams extends Record<string, string> = Record<string, never>
>(methods: {
  [K in MethodName]?: CreateMethodOptions<
    SomeZodObject | ZodNull,
    SomeZodObject | ZodNull,
    URLParams
  >;
}) => methods;
