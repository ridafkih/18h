import type { CreateMethodOptions } from "@/src/create-method";
import type { MethodName } from "@/@types/http";
import type { ValidStructure } from "@/@types/valid-structure";

/**
 * Creates a route object that takes in key-value method pairs.
 * @param methods The object of methods to register.
 * @returns An object containing the methods.
 */
export const route = <
  URLParams extends Record<string, string> = Record<string, never>,
  RequestBody extends ValidStructure = ValidStructure,
  ResponseBody extends ValidStructure = ValidStructure
>(methods: {
  [K in MethodName]?: CreateMethodOptions<
    RequestBody,
    ResponseBody,
    URLParams
  >;
}) => methods;
