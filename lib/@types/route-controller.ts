import { MethodController, MethodName } from "@/@types/http-method";
import { handleRoute } from "@/util/routing";

export type ParsedRouteController = ReturnType<typeof handleRoute>;

export type RouteController<
  AllowedMethods extends { [K in MethodName]?: object } | null = null,
  RouteParams extends Record<string, string | undefined> = Record<string, never>
> = AllowedMethods extends null
  ? Record<string, never>
  : {
      [K in keyof AllowedMethods]: AllowedMethods[K] extends MethodController<
        infer A,
        infer B
      >
        ? MethodController<A, B, RouteParams>
        : unknown;
    };
