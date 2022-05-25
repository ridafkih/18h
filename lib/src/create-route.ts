import { method } from "@/src/create-method";
import type { MethodName } from "@/@types/http";

/**
 * Creates a route object that takes in key-value method pairs.
 * @param methods The object of methods to register.
 * @returns An object containing the methods.
 */
export const route = (methods: {
  [K in MethodName]?: ReturnType<typeof method>;
}) => {
  return methods;
};
