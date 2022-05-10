import { HTTPMethod } from "@/@types/http-method";
import { handleRoute } from "@/util/routing";

export type ParsedRouteController = ReturnType<typeof handleRoute>;

type UnionIntersect<U, QueryParams> = (
  U extends object ? (k: U) => void : object
) extends (k: infer I) => void
  ? I extends HTTPMethod<infer A, infer B, infer C>
    ? HTTPMethod<A, B, C, QueryParams>
    : object
  : object;

type Merge<A extends object[], QueryParams> = UnionIntersect<
  A[number],
  QueryParams
>;

export type RouteController<
  AllowedMethods extends object[] = [],
  QueryParams extends Record<string, string | undefined> = {}
> = Merge<AllowedMethods, QueryParams>;
