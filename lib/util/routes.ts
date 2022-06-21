import Router from "koa-router";
import { Errors } from "@/@types/errors";
import { getParsingMiddleware } from "@/util/middleware";
import type { route } from "@/src/create-route";
import type { ExtendedContext } from "@/@types/method";
import type { Next } from "koa";

type MethodRegistrationFunction = (
  route: string,
  ...middleware: ((context: ExtendedContext, next: Next) => Promise<void>)[]
) => void;

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
      const continueToPost = () => {
        if (post.length > 0) next();
      };

      const requestValidation = await schema.request.safeParseAsync(
        context.request.body ?? null
      );

      if (!requestValidation.success) {
        context.body = requestValidation.error;
        context.status = 400;
        await continueToPost();
        return;
      } else
        context.request.body = <typeof context.request.body>(
          requestValidation.data
        );

      const {
        status = 200,
        headers = {},
        body: responseBody,
      } = await handler(context);

      const responseValidation = await schema.response.safeParseAsync(
        responseBody ?? null
      );

      if (!responseValidation.success) {
        console.warn(Errors.RESPONSE_MISMATCH);
        context.status = 500;
        await continueToPost();
        return;
      }

      context.body = responseValidation.data;
      context.status = status;

      for (const [key, value] of Object.entries(headers))
        context.set(key, value.toString());

      continueToPost();
    };

    const methodRegistrar = router[
      method as keyof Router
    ] as MethodRegistrationFunction;

    const chain = [
      ...getParsingMiddleware(accepts),
      ...pre,
      handlerResolver,
      ...post,
    ] as Parameters<typeof methodRegistrar>[1][];

    if (typeof methodRegistrar !== "function")
      throw Error("UNSUPPORTED_METHOD_NAME");

    (router[method as keyof typeof router] as MethodRegistrationFunction)(
      path,
      ...chain
    );
  }
};
