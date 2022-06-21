import Router from "koa-router";
import { Errors } from "@/@types/errors";
import { getParsingMiddleware } from "@/util/middleware";
import type { route } from "@/src/create-route";
import type { ExtendedContext } from "@/@types/method";
import type { Middleware, Next } from "koa";

type MethodRegistrationFunction = (
  route: string,
  ...middleware: ((context: ExtendedContext, next: Next) => Promise<void>)[]
) => void;

const disallowNext = (middleware: Middleware) => {
  return (context: ExtendedContext) => middleware(context, async () => void 0);
};

/**
 * Registers an endpoint to a a route.
 * @param router The router to register the endpoint to.
 * @param path The path to register to.
 * @param routeObject The route configuration to register.
 */
export const registerRoute = (
  router: Router,
  path: string,
  routeObject: ReturnType<typeof route>
) => {
  for (const [method, controller] of Object.entries(routeObject)) {
    if (!controller) continue;
    const {
      handler,
      accepts = [],
      schema,
      middleware: { pre = [], post = [] } = {},
    } = controller;

    const handlerResolver = async (context: ExtendedContext, next: Next) => {
      const nextIfMiddlewareExist = () => {
        if (post.length) return next();
      };

      const requestValidation = await schema.request.safeParseAsync(
        context.request.body ?? null
      );

      if (!requestValidation.success) {
        context.body = requestValidation.error;
        context.status = 400;
        return;
      } else
        context.request.body = <typeof context.request.body>(
          requestValidation.data
        );

      const response = await handler(context);

      const responseValidation = await schema.response.safeParseAsync(
        "body" in response ? response.body : ""
      );

      if (!responseValidation.success) {
        console.warn(Errors.RESPONSE_MISMATCH);
        context.status = 500;
        return;
      }

      context.body = responseValidation.data;
      context.status = response.status ?? 200;

      for (const [key, value] of Object.entries(response.headers || {}))
        context.set(key, value.toString());

      return nextIfMiddlewareExist();
    };

    const methodRegistrar = router[
      method as keyof Router
    ] as MethodRegistrationFunction;

    const chain = [
      ...getParsingMiddleware(accepts),
      ...pre,
      handlerResolver,
      ...post.map((middleware, index) => {
        if (post.length - 1 !== index) return middleware;
        return disallowNext(middleware);
      }),
    ] as Parameters<typeof methodRegistrar>[1][];

    if (typeof methodRegistrar !== "function")
      throw Error("UNSUPPORTED_METHOD_NAME");

    (router[method as keyof typeof router] as MethodRegistrationFunction)(
      path,
      ...chain
    );
  }
};
