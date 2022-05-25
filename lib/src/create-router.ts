import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { route } from "@/src/create-route";
import { mapDirectoryToRoutes } from "@/util/filesystem";
import type { Middleware, Next } from "koa";
import type { ExtendedContext } from "@/@types/method";

type MethodRegistrationFunction = (
  route: string,
  ...middleware: ((context: ExtendedContext, next: Next) => Promise<void>)[]
) => void;

interface CreateRouterOptions {
  routesFolder: string;
  port: number;
  hostname?: string;
  middleware?: Middleware[];
}

const getParsingMiddleware = (accepts: string[]) => {
  return accepts.length
    ? [
        bodyParser({
          enableTypes: accepts,
          onerror: (_error, context) => context.throw(422),
        }),
      ]
    : [];
};

export const router = async ({
  routesFolder,
  middleware = [],
  port,
  hostname,
}: CreateRouterOptions) => {
  const app = new Koa();
  const router = new Router();

  app.use(router.routes());
  middleware.forEach(app.use);

  const registerRoute = (path: string, routes: ReturnType<typeof route>) => {
    for (const [method, controller] of Object.entries(routes)) {
      if (!controller) continue;
      const {
        handler,
        accepts = [],
        schema,
        middleware: { pre = [], post = [] } = {},
      } = controller;

      const handlerResolver = async (context: ExtendedContext, next: Next) => {
        const requestValidation = await schema.request.safeParseAsync(
          context.request.body ?? null
        );

        if (!requestValidation.success) {
          context.status = 400;
          context.body = requestValidation.error;
          await next();
          return;
        }

        const {
          status = 200,
          headers = {},
          body: responseBody,
        } = await handler(context);

        const responseValidation = await schema.response.safeParseAsync(
          responseBody ?? null
        );

        if (!responseValidation.success) {
          context.status = 500;
          await next();
          return;
        }

        context.status = status;
        context.body = responseBody;
        for (const [key, value] of Object.entries(headers))
          context.set(key, value.toString());

        await next();
      };

      const methodRegistrar = router[
        method as keyof typeof router
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

  for (const { routes, path } of mapDirectoryToRoutes(routesFolder)) {
    const resolvedRoutes = await routes;
    await registerRoute(path, resolvedRoutes);
  }

  return new Promise((resolve) => {
    app.listen(port, hostname, () => {
      resolve({ app, router });
    });
  });
};
