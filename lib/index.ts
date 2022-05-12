import Koa, { Next } from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { mapDirectoryToRoutes } from "@/util/filesystem";
import { handleRoute } from "@/util/routing";

import { ExtendedContext } from "@/@types/http-method";

type ParsedController = ReturnType<typeof handleRoute>;

interface CreateRouterParams {
  routesFolder: string;
  port: number;
  hostname?: string;
  middleware?: Koa.Middleware[];
}

/**
 * Creates a router at the specified port & hostname, sourcing
 * the routes from the provided `routesFolder` directory.
 * @param props.routesFolder The folder to map for paths.
 * @param props.middleware An object containing arrays of Koa middleware functions.
 * @param props.port The port to host the server on.
 * @param props.hostname The hostname to host the server on.
 * @returns A promise which resolves with the `koa` app, and `koa-router` router objects.
 */
export const createRouter = async ({
  routesFolder,
  middleware = [],
  port,
  hostname,
}: CreateRouterParams) => {
  const app = new Koa();
  const router = new Router();

  app.use(bodyParser());
  app.use(router.routes());
  middleware.forEach(app.use);

  const registerController = (path: string, controller: ParsedController) => {
    for (const { internalHandler, method, middleware } of controller) {
      const { pre = [], post = [] } = middleware || {};
      const middlewareChain = [
        ...pre,
        async (context: ExtendedContext, next: Next) => {
          await internalHandler(context);
          await next();
        },
        ...post,
      ];

      if (typeof router[method as keyof typeof router] === "function")
        (
          router[method as keyof typeof router] as (
            route: string,
            ...middleware: ((
              context: ExtendedContext,
              next: Next
            ) => Promise<void>)[]
          ) => void
        )(path, ...middlewareChain);
    }
  };

  for (const { getRoute, path } of mapDirectoryToRoutes(routesFolder))
    await getRoute().then((controller: ParsedController) =>
      registerController(path, controller)
    );

  return new Promise<{ app: Koa; router: Router }>((resolve) => {
    app.listen(port, hostname, () => {
      resolve({ app, router });
    });
  });
};

export { RouteController } from "@/@types/route-controller";
export * from "@/@types/http-method";
